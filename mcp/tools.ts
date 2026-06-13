import fs from 'node:fs';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import { suggestIds } from '../core/cli-format.js';
import { flattenTokens, type TokenNode, type FlatToken } from '../core/flatten.js';
import { explain as explainWhy, type WhyReport } from '../core/why.js';
import { Engine } from '../core/engine.js';
import { ConstraintsSchema } from '../cli/config-schema.js';
import { loadConfig } from '../cli/config.js';
import { discoverConstraints } from '../cli/constraint-registry.js';
import { validate, type ValidateResult } from '../cli/validate-api.js';
import type { DcvConfig } from '../cli/types.js';
import type { Breakpoint } from '../core/breakpoints.js';
import {
  describeConstraints,
  explain as explainInsight,
  suggestFix as suggestFixInsight,
  InsightError,
  type ConstraintDescriptor,
  type ExplainResult,
  type SuggestResult,
  type ValueResolver,
} from './insights.js';
import type {
  JsonObject,
  ValidateToolInput,
  WhyToolInput,
  GraphToolInput,
  ListConstraintsToolInput,
  ExplainToolInput,
  SuggestFixToolInput,
} from './contracts.js';
import {
  graphInputShape,
  validateInputShape,
  whyInputShape,
  listConstraintsInputShape,
  explainInputShape,
  suggestFixInputShape,
} from './contracts.js';

export type DcvMcpToolName = 'validate' | 'why' | 'graph' | 'list-constraints' | 'explain' | 'suggest-fix';

export interface ToolFailure {
  ok: false;
  tool: DcvMcpToolName;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ToolResponse<T extends { ok: boolean } & object> = ({ tool: DcvMcpToolName } & T) | ToolFailure;

export class ToolExecutionError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export interface GraphToolResult {
  ok: true;
  nodes: string[];
  edges: Array<[string, string]>;
  meta: {
    nodeCount: number;
    edgeCount: number;
  };
}

export type WhyToolResult = { ok: true } & WhyReport;

interface TokenInput {
  tokens?: JsonObject;
  tokensPath?: string;
  constraints?: unknown;
  configPath?: string;
  constraintsDir?: string;
  breakpoint?: Breakpoint;
}

interface ToolDefinition<TInput, TResult extends { ok: boolean } & object> {
  name: DcvMcpToolName;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
  handler: (input: TInput) => Promise<ToolResponse<TResult>> | ToolResponse<TResult>;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown tool failure';
}

function toFailure(tool: DcvMcpToolName, error: unknown): ToolFailure {
  if (error instanceof ToolExecutionError) {
    return {
      ok: false,
      tool,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    };
  }

  // Pure derivation errors (bad input, unsupported rule) carry their own code.
  if (error instanceof InsightError) {
    return {
      ok: false,
      tool,
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  return {
    ok: false,
    tool,
    error: {
      code: 'tool_execution_failed',
      message: errorMessage(error),
    },
  };
}

async function executeTool<T extends { ok: boolean } & object>(
  tool: DcvMcpToolName,
  fn: () => Promise<T> | T,
): Promise<ToolResponse<T>> {
  try {
    return {
      tool,
      ...(await fn()),
    };
  } catch (error) {
    return toFailure(tool, error);
  }
}

function isToolFailure(result: ToolResponse<{ ok: boolean }>): result is ToolFailure {
  return result.ok === false && 'error' in result;
}

function responseToContent(result: ToolResponse<{ ok: boolean }>): string {
  return JSON.stringify(result, null, 2);
}

function parseJsonFile(filePath: string): unknown {
  if (!fs.existsSync(filePath)) {
    throw new ToolExecutionError('tokens_not_found', `Tokens file not found: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new ToolExecutionError('invalid_tokens', `Tokens file is not valid JSON: ${filePath}`, {
      cause: errorMessage(error),
    });
  }
}

function asJsonObject(value: unknown, label: string): JsonObject {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }

  throw new ToolExecutionError('invalid_input', `${label} must be a JSON object.`);
}

function zodIssueMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `.${issue.path.join('.')}` : '';
    return `constraints${path}: ${issue.message}`;
  });
}

function resolveTokens(input: TokenInput): TokenNode {
  if (input.tokens !== undefined) {
    // TASK-017: validate inline tokens at the handler boundary. A direct caller
    // (not going through the MCP SDK's schema check) could otherwise pass an
    // array/null/scalar that silently flattened to an empty, passing set.
    return asJsonObject(input.tokens, 'tokens') as unknown as TokenNode;
  }

  if (input.tokensPath !== undefined) {
    return asJsonObject(parseJsonFile(input.tokensPath), 'tokensPath contents') as unknown as TokenNode;
  }

  throw new ToolExecutionError('invalid_input', 'Provide either tokens or tokensPath.');
}

function constraints(input: TokenInput): DcvConfig['constraints'] | undefined {
  if (input.constraints === undefined) return undefined;
  // TASK-017: reject malformed inline constraints at the boundary.
  const object = asJsonObject(input.constraints, 'constraints');
  const parsed = ConstraintsSchema.safeParse(object);
  if (!parsed.success) {
    throw new ToolExecutionError('invalid_input', 'constraints must match DCV constraint config schema.', {
      issues: zodIssueMessages(parsed.error),
    });
  }
  return parsed.data;
}

export async function validateTool(input: ValidateToolInput): Promise<ToolResponse<ValidateResult>> {
  return executeTool('validate', () => {
    if (input.tokens === undefined && input.tokensPath === undefined) {
      throw new ToolExecutionError('invalid_input', 'Provide either tokens or tokensPath.');
    }

    return validate({
      ...(input.tokens !== undefined ? { tokens: asJsonObject(input.tokens, 'tokens') as unknown as TokenNode } : {}),
      ...(input.tokens === undefined && input.tokensPath !== undefined ? { tokensPath: input.tokensPath } : {}),
      ...(input.constraints !== undefined ? { constraints: constraints(input) } : {}),
      ...(input.configPath !== undefined ? { configPath: input.configPath } : {}),
      ...(input.constraintsDir !== undefined ? { constraintsDir: input.constraintsDir } : {}),
      ...(input.breakpoint !== undefined ? { breakpoint: input.breakpoint } : {}),
    });
  });
}

export async function whyTool(input: WhyToolInput): Promise<ToolResponse<WhyToolResult>> {
  return executeTool('why', () => {
    const { flat, edges } = flattenTokens(resolveTokens(input));
    if (!Object.prototype.hasOwnProperty.call(flat, input.tokenId)) {
      throw new ToolExecutionError('unknown_token', `Unknown token id: ${input.tokenId}`, {
        tokenId: input.tokenId,
        suggestions: suggestIds(input.tokenId, Object.keys(flat)).map((suggestion) => suggestion.id),
      });
    }

    return {
      ok: true as const,
      ...explainWhy(input.tokenId, flat, edges),
    };
  });
}

export async function graphTool(input: GraphToolInput): Promise<ToolResponse<GraphToolResult>> {
  return executeTool('graph', () => {
    const { flat, edges } = flattenTokens(resolveTokens(input));
    const nodes = Object.keys(flat).sort();

    return {
      ok: true as const,
      nodes,
      edges,
      meta: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
    };
  });
}

export interface ListConstraintsResult {
  ok: true;
  constraints: ConstraintDescriptor[];
  meta: { count: number };
}

/** Resolve the constraint config the same way validate() does: inline → configPath
 *  → discovered cwd config. */
function resolveConstraintsConfig(input: TokenInput): DcvConfig {
  if (input.constraints !== undefined) {
    return { constraints: constraints(input) };
  }
  const res = loadConfig(input.configPath);
  if (!res.ok) {
    throw new ToolExecutionError('invalid_config', res.error);
  }
  return res.value;
}

interface DerivedContext {
  descriptors: ConstraintDescriptor[];
  getValue: ValueResolver;
}

/** Flatten tokens, build an engine for value resolution, and discover the active
 *  constraint sources — the shared substrate for the read-only insight tools. */
function deriveContext(input: TokenInput): DerivedContext {
  const tokens = resolveTokens(input);
  const config = resolveConstraintsConfig(input);

  const { flat, edges } = flattenTokens(tokens);
  const init: Record<string, string | number> = {};
  for (const t of Object.values(flat)) {
    init[(t as FlatToken).id] = (t as FlatToken).value;
  }
  const engine = new Engine(init, edges);
  const knownIds = new Set(Object.keys(init));

  const sources = discoverConstraints({
    config,
    bp: input.breakpoint,
    constraintsDir: input.constraintsDir ?? 'themes',
  });

  return {
    descriptors: describeConstraints(sources),
    // Token ids resolve to their value; anything else (a literal backdrop color)
    // passes through, mirroring the WCAG plugin's resolveColor.
    getValue: (idOrLiteral) => (knownIds.has(idOrLiteral) ? String(engine.get(idOrLiteral)) : idOrLiteral),
  };
}

/** explain / suggest-fix accept a full violation OR loose ruleId + nodes. */
function resolveInsightTarget(
  input: ExplainToolInput | SuggestFixToolInput,
): { ruleId: string; nodes: string[]; context?: Record<string, unknown> } {
  if (input.violation) {
    return {
      ruleId: input.violation.ruleId,
      nodes: input.violation.nodes ?? [],
      context: input.violation.context as Record<string, unknown> | undefined,
    };
  }
  if (input.ruleId) {
    return {
      ruleId: input.ruleId,
      nodes: input.nodes ?? [],
      context: input.context as Record<string, unknown> | undefined,
    };
  }
  throw new ToolExecutionError('invalid_input', 'Provide either a violation object or ruleId (with nodes).');
}

export async function listConstraintsTool(input: ListConstraintsToolInput): Promise<ToolResponse<ListConstraintsResult>> {
  return executeTool('list-constraints', () => {
    const { descriptors } = deriveContext(input);
    return { ok: true as const, constraints: descriptors, meta: { count: descriptors.length } };
  });
}

export async function explainTool(input: ExplainToolInput): Promise<ToolResponse<ExplainResult>> {
  return executeTool('explain', () => {
    const { descriptors, getValue } = deriveContext(input);
    const target = resolveInsightTarget(input);
    return explainInsight({ ...target, getValue, descriptors });
  });
}

export async function suggestFixTool(input: SuggestFixToolInput): Promise<ToolResponse<SuggestResult>> {
  return executeTool('suggest-fix', () => {
    const { descriptors, getValue } = deriveContext(input);
    const target = resolveInsightTarget(input);
    return suggestFixInsight({ ...target, getValue, descriptors, target: input.target });
  });
}

export const dcvMcpTools: Array<
  | ToolDefinition<ValidateToolInput, ValidateResult>
  | ToolDefinition<WhyToolInput, WhyToolResult>
  | ToolDefinition<GraphToolInput, GraphToolResult>
  | ToolDefinition<ListConstraintsToolInput, ListConstraintsResult>
  | ToolDefinition<ExplainToolInput, ExplainResult>
  | ToolDefinition<SuggestFixToolInput, SuggestResult>
> = [
  {
    name: 'validate',
    description: 'Validate DTCG-style design tokens against DCV constraints and return structured violations.',
    inputSchema: validateInputShape,
    handler: validateTool,
  },
  {
    name: 'why',
    description: 'Explain token provenance, aliases, immediate dependencies, dependents, and alias chain.',
    inputSchema: whyInputShape,
    handler: whyTool,
  },
  {
    name: 'graph',
    description: 'Return the token dependency graph as nodes and directed edges.',
    inputSchema: graphInputShape,
    handler: graphTool,
  },
  {
    name: 'list-constraints',
    description: 'List the active constraints (WCAG pairs, thresholds, order/lightness scales, cross-axis) for a token set/config. Read-only.',
    inputSchema: listConstraintsInputShape,
    handler: listConstraintsTool,
  },
  {
    name: 'explain',
    description: 'Explain a validation violation (WCAG, threshold, monotonic) in plain English plus machine-readable facts. Read-only.',
    inputSchema: explainInputShape,
    handler: explainTool,
  },
  {
    name: 'suggest-fix',
    description: 'Compute a verified satisfying value for a violation without writing it (WCAG color, threshold/monotonic boundary). Read-only.',
    inputSchema: suggestFixInputShape,
    handler: suggestFixTool,
  },
];

export function registerDcvMcpTools(server: McpServer): void {
  for (const tool of dcvMcpTools) {
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (input): Promise<CallToolResult> => {
        const result = await tool.handler(input as never);
        return {
          content: [
            {
              type: 'text',
              text: responseToContent(result as ToolResponse<{ ok: boolean }>),
            },
          ],
          structuredContent: result as unknown as Record<string, unknown>,
          ...(isToolFailure(result as ToolResponse<{ ok: boolean }>) ? { isError: true } : {}),
        };
      },
    );
  }
}
