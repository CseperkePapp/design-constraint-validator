import { describe, it, expect } from 'vitest';
import { parseCssColor } from '../core/color.js';
import { flattenTokens } from '../core/flatten.js';
import { validate } from '../core/index.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
import { Engine } from '../core/engine.js';

/**
 * TASK-016 coverage hardening: adversarial / edge-case inputs that the audit
 * flagged as untested — malformed colors, size-parser boundaries, the
 * circular-reference guard, and the known garbage-root weakness.
 */
describe('parseCssColor: malformed input returns null (never throws)', () => {
  for (const bad of ['', '   ', 'not a color', 'oklch(bad)', 'hsl()', 'rgb()']) {
    it(`rejects ${JSON.stringify(bad)}`, () => {
      expect(parseCssColor(bad)).toBeNull();
    });
  }
  it('accepts valid forms', () => {
    expect(parseCssColor('#ffffff')).toMatchObject({ r: 255, g: 255, b: 255 });
    expect(parseCssColor('rgb(0,0,0)')).toMatchObject({ r: 0, g: 0, b: 0 });
  });
});

describe('ThresholdPlugin: size-parsing boundaries', () => {
  const check = (value: string, op: '>=' | '<=', valuePx: number) => {
    const engine = new Engine({ s: value }, []);
    return ThresholdPlugin([{ id: 's', op, valuePx }]).evaluate(engine, new Set(['s']));
  };
  it('rem is 16× px (16rem ≥ 44px passes)', () => {
    expect(check('16rem', '>=', 44)).toHaveLength(0);
  });
  it('flags a violation (30px < 44)', () => {
    expect(check('30px', '>=', 44)).toHaveLength(1);
  });
  it('bare number is treated as px (44 ≥ 44 ok; 43 fails)', () => {
    expect(check('44', '>=', 44)).toHaveLength(0);
    expect(check('43', '>=', 44)).toHaveLength(1);
  });
  it('unparseable size is skipped — no crash, no false violation', () => {
    expect(check('auto', '>=', 44)).toHaveLength(0);
  });
});

describe('flatten: circular & garbage handling', () => {
  it('throws clearly on a 2-cycle alias (a→b→a)', () => {
    expect(() => flattenTokens({ a: { $value: '{b}' }, b: { $value: '{a}' } })).toThrow(/circular/i);
  });
  it('throws clearly on a self-reference (a→a)', () => {
    expect(() => flattenTokens({ a: { $value: '{a}' } })).toThrow(/circular/i);
  });
  it('throws on an unresolvable reference', () => {
    expect(() => flattenTokens({ a: { $value: '{nonexistent}' } })).toThrow(/resolve/i);
  });
  it('rejects non-object token roots (TASK-017 hardening — fail closed)', () => {
    // Previously these silently flattened to an empty, passing set. Now they
    // throw a descriptive error instead of validating garbage as ok.
    expect(() => flattenTokens([] as never)).toThrow(/must be a JSON object/);
    expect(() => flattenTokens(null as never)).toThrow(/must be a JSON object/);
    expect(() => flattenTokens('scalar' as never)).toThrow(/must be a JSON object/);
    expect(() => flattenTokens(42 as never)).toThrow(/must be a JSON object/);
    // An empty object is still valid — it just has no tokens.
    expect(flattenTokens({}).flat).toEqual({});
  });
});

describe('validate(): non-object token roots reject (TASK-017)', () => {
  it('throws on null / array / scalar inline tokens', () => {
    expect(() => validate({ tokens: null as never })).toThrow(/must be a JSON object/);
    expect(() => validate({ tokens: [] as never })).toThrow(/must be a JSON object/);
    expect(() => validate({ tokens: 'x' as never })).toThrow(/must be a JSON object/);
  });
  it('still accepts an empty object (ok, no tokens)', () => {
    const r = validate({ tokens: {} });
    expect(r.ok).toBe(true);
    expect(r.counts.checked).toBe(0);
  });
});
