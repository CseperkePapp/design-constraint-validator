import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import {
  graphTool,
  validateTool,
  whyTool,
  listConstraintsTool,
  explainTool,
  suggestFixTool,
  type ToolFailure,
} from '../mcp/tools.js';
import { parseCssColor, compositeOver, relativeLuminance, contrastRatio } from '../core/color.js';

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

  it('suggest-fix never returns a false-verified WCAG background fix when the foreground has alpha', async () => {
    // rgba(0,0,0,0.25) over any opaque bg composites toward the bg, so contrast
    // stays low — the tool must not claim a passing background fix it cannot back up.
    const result = await suggestFixTool({
      tokens: { c: { fg: { $value: 'rgba(0,0,0,0.25)' }, bg: { $value: '#111111' } } },
      constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false, wcag: [{ foreground: 'c.fg', background: 'c.bg', ratio: 4.5, description: 'x' }] },
      constraintsDir: '__none__',
      ruleId: 'wcag-contrast',
      nodes: ['c.fg', 'c.bg'],
      target: 'background',
    });
    if (isFailure(result)) throw new Error(result.error.message);
    const fg = parseCssColor('rgba(0,0,0,0.25)')!;
    for (const s of result.suggestions) {
      const bgc = parseCssColor(s.suggestedValue)!;
      const trueRatio = contrastRatio(relativeLuminance(compositeOver(fg, bgc)), relativeLuminance(bgc));
      // Every returned candidate must clear the ratio under the real alpha pipeline,
      // and the reported value must match that true ratio (no over-reporting).
      expect(trueRatio).toBeGreaterThanOrEqual(4.5);
      expect(s.resultingValue).toBeCloseTo(trueRatio, 1);
    }
  });

  it('suggest-fix returns real boundaries (not no-ops) for a <= monotonic violation', async () => {
    const dir = join('dist', 'test-le-policy');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'spacing.order.json'), JSON.stringify({ order: [['spacing.x', '<=', 'spacing.y']] }));
    try {
      const cfg = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false };
      const tokens = { spacing: { x: { $value: '32px' }, y: { $value: '16px' } } };
      const result = await suggestFixTool({ tokens, constraints: cfg, constraintsDir: dir, ruleId: 'monotonic', nodes: ['spacing.x|spacing.y'] });
      if (isFailure(result)) throw new Error(result.error.message);
      const byId = Object.fromEntries(result.suggestions.map((s) => [s.tokenId, s]));
      // x (32) <= y (16) is violated; the only real fixes move a token to the other's value.
      expect(byId['spacing.x'].suggestedValue).toBe('16px'); // lower x to y
      expect(byId['spacing.y'].suggestedValue).toBe('32px'); // raise y to x
      expect(byId['spacing.x'].suggestedValue).not.toBe(byId['spacing.x'].currentValue); // not a no-op
      expect(result.suggestions.map((s) => s.role).sort()).toEqual(['lower', 'raise']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('explain reports the true state for monotonic — does not claim a violation when the order holds', async () => {
    const dir = join('dist', 'test-explain-order');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'spacing.order.json'), JSON.stringify({ order: [['spacing.x', '<=', 'spacing.y']] }));
    try {
      const cfg = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false };
      const tokens = { spacing: { x: { $value: '16px' }, y: { $value: '32px' } } }; // 16 <= 32 HOLDS
      const r = await explainTool({ tokens, constraints: cfg, constraintsDir: dir, ruleId: 'monotonic', nodes: ['spacing.x|spacing.y'] });
      if (isFailure(r)) throw new Error(r.error.message);
      expect(r.facts.satisfied).toBe(true);
      expect(r.explanation).toContain('the order holds');
      expect(r.explanation).not.toContain('out of order');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('explain rejects a malformed multi-segment monotonic node id', async () => {
    const r = await explainTool({ tokens: TOKENS, constraintsDir: '__none__', ruleId: 'monotonic', nodes: ['a|b|c'] });
    if (!isFailure(r)) throw new Error('Expected invalid_input for a|b|c');
    expect(r.error.code).toBe('invalid_input');
  });
});
