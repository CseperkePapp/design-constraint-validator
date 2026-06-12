import { describe, it, expect } from 'vitest';
import { buildPoset, validatePoset, type Order } from '../core/poset.js';
import { Engine } from '../core/engine.js';
import { parseLightness, MonotonicLightness } from '../core/constraints/monotonic-lightness.js';

/**
 * TASK-009 audit: poset cycle detection edge cases + the mixed hex/oklch
 * lightness-scale bug.
 */
describe('validatePoset cycle detection (TASK-009)', () => {
  const check = (orders: Order[]) => validatePoset(buildPoset(orders));

  it('flags a 2-cycle (a>=b, b>=a)', () => {
    expect(check([['a', '>=', 'b'], ['b', '>=', 'a']]).valid).toBe(false);
  });

  it('flags contradictory mixed operators (a>=b AND a<=b) as a cycle', () => {
    expect(check([['a', '>=', 'b'], ['a', '<=', 'b']]).valid).toBe(false);
  });

  it('flags a longer cycle (a>=b>=c>=a)', () => {
    const r = check([['a', '>=', 'b'], ['b', '>=', 'c'], ['c', '>=', 'a']]);
    expect(r.valid).toBe(false);
    expect(r.cycles && r.cycles.length).toBeGreaterThan(0);
  });

  it('flags a self-reference (a>=a)', () => {
    expect(check([['a', '>=', 'a']]).valid).toBe(false);
  });

  it('accepts a valid chain and disconnected components', () => {
    expect(check([['a', '>=', 'b'], ['b', '>=', 'c'], ['x', '>=', 'y']]).valid).toBe(true);
  });

  it('accepts a diamond (two paths, no cycle)', () => {
    // a>=b, a>=c, b>=d, c>=d — d reachable two ways but acyclic
    expect(
      check([['a', '>=', 'b'], ['a', '>=', 'c'], ['b', '>=', 'd'], ['c', '>=', 'd']]).valid,
    ).toBe(true);
  });
});

describe('monotonic-lightness uses one consistent scale (TASK-009 fix)', () => {
  it('parseLightness returns relative luminance for both hex and oklch (same gray ⇒ same number)', () => {
    const hex = parseLightness('#808080')!;
    const oklch = parseLightness('oklch(0.6 0 0)')!; // same gray as #808080
    expect(hex).toBeCloseTo(0.216, 2);
    // The bug returned the raw L (0.6) for oklch; the fix returns luminance (~0.216).
    expect(oklch).toBeCloseTo(hex, 2);
    expect(oklch).toBeLessThan(0.3); // i.e. NOT the raw 0.6
  });

  it('catches a mixed-format violation the old dual-scale code missed', () => {
    // oklch(0.6) is actually DARKER (lum 0.216) than #999999 (lum 0.318), so
    // "a >= b" is false. The old code compared raw L 0.6 >= 0.318 → false pass.
    const engine = new Engine({ a: 'oklch(0.6 0 0)', b: '#999999' }, []);
    const issues = MonotonicLightness([['a', '>=', 'b']]).evaluate(engine, new Set(['a', 'b']));
    expect(issues.length).toBe(1);
    expect(issues[0].rule).toBe('monotonic-lightness');
  });
});
