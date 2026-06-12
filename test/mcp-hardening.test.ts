import { describe, it, expect } from 'vitest';
import { validateTool, whyTool, graphTool } from '../mcp/tools.js';

/**
 * TASK-017 Phase 1: MCP handler-boundary hardening. A direct caller (or any path
 * that bypasses the MCP SDK's schema check) must not be able to feed garbage
 * inline `tokens` / `constraints` and get `ok: true`. Malformed input now returns
 * a structured tool error (an `error` key), never a passing validation result.
 */
function errMessage(r: unknown): string | undefined {
  return (r as { error?: { message?: string } })?.error?.message;
}

describe('MCP hardening: garbage inline tokens are rejected (fail closed)', () => {
  for (const bad of [null, [1, 2], 'a-string', 42, true]) {
    it(`validate rejects tokens=${JSON.stringify(bad)} with a structured error`, async () => {
      const r = await validateTool({ tokens: bad as never });
      expect(r.ok).toBe(false);
      expect(r).toHaveProperty('error');
      expect(errMessage(r)).toMatch(/must be a JSON object/);
    });
  }

  it('why rejects garbage tokens with a structured error', async () => {
    const r = await whyTool({ tokens: [] as never, tokenId: 'x' });
    expect(r.ok).toBe(false);
    expect(errMessage(r)).toMatch(/must be a JSON object/);
  });

  it('graph rejects garbage tokens with a structured error', async () => {
    const r = await graphTool({ tokens: null as never });
    expect(r.ok).toBe(false);
    expect(errMessage(r)).toMatch(/must be a JSON object/);
  });

  it('rejects malformed inline constraints', async () => {
    const r = await validateTool({
      tokens: { color: { a: { $value: '#000000' } } },
      constraints: [1, 2] as never,
    });
    expect(r.ok).toBe(false);
    expect(errMessage(r)).toMatch(/must be a JSON object/);
  });
});

describe('MCP hardening: well-formed requests still work', () => {
  it('a valid request that finds a violation is a tool SUCCESS with ok:false (no error key)', async () => {
    const r = await validateTool({
      tokens: { color: { text: { $value: '#888888' }, bg: { $value: '#999999' } } },
      constraints: {
        enableBuiltInWcagDefaults: false,
        enableBuiltInThreshold: false,
        wcag: [{ foreground: 'color.text', background: 'color.bg', ratio: 4.5, description: 'body' }],
      } as never,
    });
    // contrast 1.24:1 < 4.5 → validation fails, but the TOOL succeeded
    expect(r.ok).toBe(false);
    expect(r).not.toHaveProperty('error');
    expect(r).toHaveProperty('counts');
  });

  it('an empty-object token set is accepted (ok, nothing to check)', async () => {
    const r = await validateTool({ tokens: {} });
    expect(r).not.toHaveProperty('error');
    expect(r.ok).toBe(true);
  });
});
