#!/usr/bin/env node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerDcvMcpTools } from './tools.js';

export {
  graphInputSchema,
  graphInputShape,
  jsonObjectSchema,
  jsonValueSchema,
  validateInputSchema,
  validateInputShape,
  whyInputSchema,
  whyInputShape,
} from './contracts.js';
export type {
  GraphToolInput,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  ValidateToolInput,
  WhyToolInput,
} from './contracts.js';
export {
  dcvMcpTools,
  graphTool,
  registerDcvMcpTools,
  ToolExecutionError,
  validateTool,
  whyTool,
} from './tools.js';
export type {
  DcvMcpToolName,
  GraphToolResult,
  ToolFailure,
  ToolResponse,
  WhyToolResult,
} from './tools.js';

export function createDcvMcpServer(): McpServer {
  const server = new McpServer({
    name: 'dcv-mcp',
    version: '2.1.0',
  });

  registerDcvMcpTools(server);
  return server;
}

export async function startStdioServer(): Promise<void> {
  const server = createDcvMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function isEntrypoint(): boolean {
  const entry = process.argv[1];
  return entry !== undefined && resolve(fileURLToPath(import.meta.url)) === resolve(entry);
}

if (isEntrypoint()) {
  startStdioServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown MCP server failure';
    console.error(`[dcv-mcp] ${message}`);
    process.exitCode = 1;
  });
}
