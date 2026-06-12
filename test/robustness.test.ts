import { describe, it, expect } from 'vitest';
import { parseCssColor } from '../core/color.js';
import { flattenTokens } from '../core/flatten.js';
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
  it('KNOWN WEAKNESS: array/null roots silently flatten to empty (no error)', () => {
    // Documented gap from the audit — a non-object token root is silently treated
    // as empty (validates ok). Pinned here as current behavior; candidate for a
    // future "reject malformed roots" task.
    expect(flattenTokens([] as never).flat).toEqual({});
    expect(flattenTokens(null as never).flat).toEqual({});
  });
});
