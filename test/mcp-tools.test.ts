import { describe, expect, it } from 'vitest';

import { graphTool, validateTool, whyTool, type ToolFailure } from '../mcp/tools.js';

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

function isFailure(result: unknown): result is ToolFailure {
  return Boolean(result && typeof result === 'object' && 'error' in result);
}

describe('MCP tool adapters', () => {
  it('validate returns structured violations for inline tokens and constraints', async () => {
    const result = await validateTool({
      tokens: TOKENS,
      constraints: CONSTRAINTS,
      constraintsDir: '__none__',
    });

    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.tool).toBe('validate');
    expect(result.ok).toBe(false);
    expect(result.counts.violations).toBe(1);
    expect(result.violations[0].ruleId).toBe('wcag-contrast');
    expect(result.violations[0].context?.actual).toBe(1.24);
    expect(result.violations[0].context?.required).toBe(4.5);
    expect(JSON.stringify(result.violations)).toContain('color.text');
  });

  it('validate returns an explicit no-match note instead of a silent pass', async () => {
    const result = await validateTool({
      tokens: TOKENS,
      constraintsDir: '__none__',
    });

    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.ok).toBe(true);
    expect(result.note).toContain('nothing was checked');
  });

  it('why returns provenance for an aliased token', async () => {
    const result = await whyTool({
      tokens: TOKENS,
      tokenId: 'color.alias',
    });

    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.ok).toBe(true);
    expect(result.value).toBe('#888888');
    expect(result.raw).toBe('{color.text}');
    expect(result.refs).toEqual(['color.text']);
    expect(result.dependsOn).toEqual(['color.text']);
    expect(result.chain).toEqual(['color.alias', 'color.text']);
  });

  it('why returns a structured error for an unknown token', async () => {
    const result = await whyTool({
      tokens: TOKENS,
      tokenId: 'color.aliass',
    });

    if (!isFailure(result)) throw new Error('Expected structured tool failure');
    expect(result.ok).toBe(false);
    expect(result.tool).toBe('why');
    expect(result.error.code).toBe('unknown_token');
    expect(result.error.details?.suggestions).toContain('color.alias');
  });

  it('graph returns nodes and dependency edges', async () => {
    const result = await graphTool({
      tokens: TOKENS,
    });

    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.ok).toBe(true);
    expect(result.nodes).toEqual(['color.alias', 'color.bg', 'color.text']);
    expect(result.edges).toContainEqual(['color.text', 'color.alias']);
    expect(result.meta).toEqual({ nodeCount: 3, edgeCount: 1 });
  });
});
