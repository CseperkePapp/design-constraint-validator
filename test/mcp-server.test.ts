import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { describe, expect, it } from 'vitest';

const mcpJs = path.resolve(process.cwd(), 'mcp/index.js');

const TOKENS = {
  color: {
    text: { $value: '#888888' },
    bg: { $value: '#999999' },
    alias: { $value: '{color.text}' },
  },
};

const CONSTRAINTS = {
  enableBuiltInWcagDefaults: false,
  enableBuiltInThreshold: false,
  wcag: [
    {
      foreground: 'color.text',
      background: 'color.bg',
      ratio: 4.5,
      description: 'text on bg',
    },
  ],
};

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [mcpJs],
    cwd: process.cwd(),
    stderr: 'pipe',
  });
  const client = new Client({ name: 'dcv-mcp-test', version: '0.0.0' });

  try {
    await client.connect(transport);
    return await fn(client);
  } finally {
    await client.close().catch(() => undefined);
    await transport.close().catch(() => undefined);
  }
}

function structured(result: Awaited<ReturnType<Client['callTool']>>): Record<string, unknown> {
  expect('structuredContent' in result).toBe(true);
  return result.structuredContent as Record<string, unknown>;
}

describe('dcv-mcp stdio server', () => {
  it('lists exactly the validate, why, and graph tools', async () => {
    await withClient(async (client) => {
      const result = await client.listTools();
      expect(result.tools.map((tool) => tool.name).sort()).toEqual(['graph', 'validate', 'why']);
    });
  });

  it('calls validate over stdio and returns structured content', async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: 'validate',
        arguments: {
          tokens: TOKENS,
          constraints: CONSTRAINTS,
          constraintsDir: '__none__',
        },
      });
      const content = structured(result);

      expect(result.isError).toBeUndefined();
      expect(content.tool).toBe('validate');
      expect(content.ok).toBe(false);
      expect((content.counts as { violations: number }).violations).toBe(1);
    });
  });

  it('returns structured tool errors over stdio', async () => {
    await withClient(async (client) => {
      const result = await client.callTool({
        name: 'why',
        arguments: {
          tokens: TOKENS,
          tokenId: 'color.aliass',
        },
      });
      const content = structured(result);

      expect(result.isError).toBe(true);
      expect(content.tool).toBe('why');
      expect(content.ok).toBe(false);
      expect((content.error as { code: string }).code).toBe('unknown_token');
    });
  });
});
