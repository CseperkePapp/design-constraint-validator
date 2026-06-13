import { describe, expect, it } from 'vitest';

import {
  graphTool,
  validateTool,
  whyTool,
  listConstraintsTool,
  explainTool,
  suggestFixTool,
  type ToolFailure,
} from '../mcp/tools.js';

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

describe('MCP insight tools (list-constraints / explain / suggest-fix)', () => {
  const WCAG_BASE = { tokens: TOKENS, constraints: CONSTRAINTS, constraintsDir: '__none__' };

  it('list-constraints reports the active wcag rule', async () => {
    const result = await listConstraintsTool(WCAG_BASE);
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.tool).toBe('list-constraints');
    expect(result.meta.count).toBe(1);
    const rule = result.constraints[0];
    expect(rule).toMatchObject({ kind: 'wcag', source: 'config', foreground: 'color.text', background: 'color.bg', minRatio: 4.5 });
  });

  it('list-constraints reports built-in sources when enabled', async () => {
    const result = await listConstraintsTool({ tokens: TOKENS, constraintsDir: '__none__' });
    if (isFailure(result)) throw new Error(result.error.message);
    const kinds = result.constraints.map((c) => `${c.kind}:${'source' in c ? c.source : ''}`);
    expect(kinds).toContain('wcag:builtin');
    expect(kinds).toContain('threshold:builtin');
  });

  it('explain turns a wcag violation into facts + plain English', async () => {
    const validated = await validateTool(WCAG_BASE);
    if (isFailure(validated)) throw new Error(validated.error.message);
    const violation = validated.violations[0];

    const result = await explainTool({ ...WCAG_BASE, violation });
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.kind).toBe('wcag');
    expect(result.facts.actualRatio).toBe(1.24);
    expect(result.facts.requiredRatio).toBe(4.5);
    expect(result.explanation).toContain('below the required 4.5:1');
  });

  it('explain accepts loose ruleId + nodes (no full violation)', async () => {
    const result = await explainTool({ ...WCAG_BASE, ruleId: 'wcag-contrast', nodes: ['color.text', 'color.bg'] });
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.facts.foreground).toBe('color.text');
  });

  it('explain rejects an unsupported rule', async () => {
    const result = await explainTool({ ...WCAG_BASE, ruleId: 'cross-axis', nodes: ['a'] });
    if (!isFailure(result)) throw new Error('Expected failure for unsupported rule');
    expect(result.error.code).toBe('unsupported_rule');
  });

  it('suggest-fix returns only verified wcag color candidates', async () => {
    const result = await suggestFixTool({ ...WCAG_BASE, ruleId: 'wcag-contrast', nodes: ['color.text', 'color.bg'] });
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.suggestions.length).toBeGreaterThan(0);
    // Every returned candidate must genuinely clear the required ratio.
    for (const s of result.suggestions) {
      expect(s.resultingValue).toBeGreaterThanOrEqual(4.5);
      expect(s.suggestedValue).toMatch(/^#[0-9a-f]{6}$/i);
    }
    expect(result.suggestions.map((s) => s.role)).toContain('foreground');
  });

  it('suggest-fix honors an explicit target side', async () => {
    const result = await suggestFixTool({ ...WCAG_BASE, ruleId: 'wcag-contrast', nodes: ['color.text', 'color.bg'], target: 'background' });
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].role).toBe('background');
    expect(result.suggestions[0].resultingValue).toBeGreaterThanOrEqual(4.5);
  });

  it('suggest-fix refuses unparseable colors with a clear error', async () => {
    const result = await suggestFixTool({
      tokens: { c: { a: { $value: 'notacolor' }, b: { $value: '#ffffff' } } },
      constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false, wcag: [{ foreground: 'c.a', background: 'c.b', ratio: 4.5, description: 'x' }] },
      constraintsDir: '__none__',
      ruleId: 'wcag-contrast',
      nodes: ['c.a', 'c.b'],
    });
    if (!isFailure(result)) throw new Error('Expected failure for unparseable colors');
    expect(result.error.code).toBe('invalid_input');
    expect(result.error.message).toContain('unparseable');
  });

  it('suggest-fix returns the boundary value for a threshold', async () => {
    const result = await suggestFixTool({
      tokens: { control: { size: { $value: '32px' } } },
      constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false, thresholds: [{ id: 'control.size', op: '>=', valuePx: 44, where: 'touch' }] },
      constraintsDir: '__none__',
      ruleId: 'custom-threshold',
      nodes: ['control.size'],
    });
    if (isFailure(result)) throw new Error(result.error.message);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toMatchObject({ tokenId: 'control.size', suggestedValue: '44px', resultingValue: 44 });
  });

  it('explain + suggest-fix handle a monotonic order violation end-to-end', async () => {
    // h1 < h2 violates themes/typography.order.json (h1 >= h2).
    const TYPO = {
      typography: { size: { h1: { $value: '1rem' }, h2: { $value: '2rem' }, h3: { $value: '1.5rem' }, h4: { $value: '1.25rem' }, h5: { $value: '1rem' }, h6: { $value: '0.875rem' } } },
    };
    const cfg = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false };
    const validated = await validateTool({ tokens: TYPO, constraints: cfg });
    if (isFailure(validated)) throw new Error(validated.error.message);
    const mono = validated.violations.find((v) => v.ruleId === 'monotonic');
    expect(mono).toBeTruthy();

    const ex = await explainTool({ tokens: TYPO, constraints: cfg, violation: mono });
    if (isFailure(ex)) throw new Error(ex.error.message);
    expect(ex.explanation).toContain('out of order');

    const fix = await suggestFixTool({ tokens: TYPO, constraints: cfg, violation: mono });
    if (isFailure(fix)) throw new Error(fix.error.message);
    expect(fix.suggestions.map((s) => s.role).sort()).toEqual(['lower', 'raise']);
  });

  it('suggest-fix refuses to synthesize colors for lightness ordering', async () => {
    const result = await suggestFixTool({ tokens: TOKENS, constraintsDir: '__none__', ruleId: 'monotonic-lightness', nodes: ['color.text|color.bg'] });
    if (!isFailure(result)) throw new Error('Expected refusal for lightness ordering');
    expect(result.error.code).toBe('unsupported_rule');
  });
});
