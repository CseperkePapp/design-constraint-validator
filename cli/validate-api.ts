/**
 * Programmatic validation API.
 *
 * A thin convenience wrapper over the same flatten + engine + constraint-registry
 * machinery the CLI uses, so library consumers (and the MCP server) get one call
 * that takes tokens + constraints and returns structured violations — no argv, no
 * process.exit, no prose.
 *
 * Re-exported from the package root (`design-constraint-validator`) via
 * `core/index.ts`.
 */
import fs from 'node:fs';
import { flattenTokens, type TokenNode, type FlatToken } from '../core/flatten.js';
import { Engine, type ConstraintIssue } from '../core/engine.js';
import type { Breakpoint } from '../core/breakpoints.js';
import { loadConfig } from './config.js';
import { validateConfig } from './config-schema.js';
import { setupConstraints, collectReferencedIds } from './constraint-registry.js';
import { formatViolation, type ConstraintViolation } from './json-output.js';
import type { DcvConfig } from './types.js';

export interface ValidateInput {
  /** Inline tokens object (DTCG-style `$value`/`$type`). Takes precedence over `tokensPath`. */
  tokens?: TokenNode;
  /** Path to a tokens file. Used when `tokens` is not provided. */
  tokensPath?: string;
  /** Inline constraints config (the `constraints` block of dcv.config.json). Takes precedence over `configPath`. */
  constraints?: DcvConfig['constraints'];
  /** Path to a config file. When neither `constraints` nor `configPath` is given, a dcv.config.* in cwd is discovered. */
  configPath?: string;
  /** Directory holding order / cross-axis constraint files. Defaults to `themes`. */
  constraintsDir?: string;
  /** Optional breakpoint, selecting `<axis>.<bp>.order.json` / cross-axis variants. */
  breakpoint?: Breakpoint;
}

export interface ValidateResult {
  /** True when there are no error-level violations. */
  ok: boolean;
  counts: { checked: number; violations: number; warnings: number };
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  /** Set when tokens were validated but no active constraint referenced any of them. */
  note?: string;
}

function readTokensFile(p: string): TokenNode {
  if (!fs.existsSync(p)) {
    throw new Error(`Tokens file not found: ${p}`);
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as TokenNode;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(`Tokens file is not valid JSON: ${p} (${detail})`);
  }
}

function resolveConfig(input: ValidateInput): DcvConfig {
  if (input.constraints !== undefined) {
    const { value, errors } = validateConfig({ constraints: input.constraints });
    if (errors) {
      throw new Error(`Inline constraints validation failed:\n  - ${errors.join('\n  - ')}`);
    }
    return value!;
  }
  const res = loadConfig(input.configPath);
  if (!res.ok) {
    throw new Error(res.error);
  }
  return res.value;
}

/**
 * Validate a token set against constraints and return structured results.
 *
 * Unlike the CLI, this treats `tokens` / `tokensPath` as the complete token set
 * (no implicit cwd token overrides), so it is safe to call from a server that
 * cannot share a filesystem with the caller.
 */
export function validate(input: ValidateInput = {}): ValidateResult {
  const tokens: TokenNode =
    input.tokens !== undefined
      ? input.tokens
      : input.tokensPath !== undefined
        ? readTokensFile(input.tokensPath)
        : {};

  const config = resolveConfig(input);

  const { flat, edges } = flattenTokens(tokens);
  const init: Record<string, string | number> = {};
  for (const t of Object.values(flat)) {
    init[(t as FlatToken).id] = (t as FlatToken).value;
  }
  const engine = new Engine(init, edges);
  const knownIds = new Set(Object.keys(init));

  const sources = setupConstraints(
    engine,
    { config, bp: input.breakpoint, constraintsDir: input.constraintsDir ?? 'themes' },
    { knownIds },
  );

  const issues = engine.evaluate(knownIds);
  const errors = issues.filter((i: ConstraintIssue) => i.level === 'error');
  const warnings = issues.filter((i: ConstraintIssue) => i.level !== 'error');

  // No-match note: validated tokens that no active constraint references.
  const coverage = collectReferencedIds(sources);
  let matched = false;
  for (const id of coverage.ids) {
    if (knownIds.has(id)) {
      matched = true;
      break;
    }
  }
  const note =
    knownIds.size > 0 && coverage.coverageKnown && !matched
      ? `No active constraint references any of the ${knownIds.size} validated token(s) — nothing was checked. ` +
        `Define constraints (constraints.wcag / constraints.thresholds) or point constraintsDir at your order/cross-axis files.`
      : undefined;

  return {
    ok: errors.length === 0,
    counts: { checked: issues.length, violations: errors.length, warnings: warnings.length },
    violations: errors.map(formatViolation),
    warnings: warnings.map(formatViolation),
    note,
  };
}
