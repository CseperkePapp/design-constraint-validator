import { describe, it, expect } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Engine } from '../core/engine.js';
import { MonotonicPlugin, parseSize } from '../core/constraints/monotonic.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
import { collectReferencedIds, discoverConstraints } from '../cli/constraint-registry.js';
import { validate } from '../core/index.js';

/**
 * TASK-031: numeric / unit-bearing token values must not silently skip checks.
 * Previously `parseSize`/`parseSizePx` were string-only, so a DTCG numeric
 * `$value` returned null and the rule was skipped → false `ok`.
 */
describe('TASK-031: size value coercion', () => {
  it('parseSize coerces numbers, unitless strings (px), rem and em (16px)', () => {
    expect(parseSize(16)).toBe(16); // bare number = px
    expect(parseSize('16')).toBe(16); // unitless string = px
    expect(parseSize('16px')).toBe(16);
    expect(parseSize('1rem')).toBe(16);
    expect(parseSize('1em')).toBe(16);
    expect(parseSize('.5px')).toBe(0.5);
    expect(parseSize('50%')).toBeNull(); // genuinely unparseable
  });

  it('parseSize rejects degenerate/garbage numerics (TASK-034: no NaN/partial parses)', () => {
    expect(parseSize('.')).toBeNull();
    expect(parseSize('..')).toBeNull();
    expect(parseSize('5.')).toBeNull();
    expect(parseSize('1.2.3px')).toBeNull(); // was partially parsed to 1.2
    expect(parseSize(NaN)).toBeNull();
    expect(parseSize(Infinity)).toBeNull();
  });

  it('monotonic catches an out-of-order violation with NUMERIC values', () => {
    const engine = new Engine({ 'a': 10, 'b': 100 }, []);
    const issues = MonotonicPlugin([['a', '>=', 'b']], parseSize).evaluate(engine, new Set(['a', 'b']));
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('error');
  });

  it('threshold catches a violation with a NUMERIC value', () => {
    const engine = new Engine({ 's': 10 }, []);
    const issues = ThresholdPlugin([{ id: 's', op: '>=', valuePx: 44 }]).evaluate(engine, new Set(['s']));
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('error');
  });

  it('monotonic warns (does not silently skip) on a present-but-unparseable operand', () => {
    const engine = new Engine({ 'a': '50%', 'b': '10px' }, []);
    const issues = MonotonicPlugin([['a', '>=', 'b']], parseSize).evaluate(engine, new Set(['a', 'b']));
    expect(issues).toHaveLength(1);
    expect(issues[0].level).toBe('warn');
  });
});

describe('TASK-034: breakpoint falls back to the global order file', () => {
  it('catches a global-order violation under --breakpoint when no per-bp file exists', () => {
    const dir = join('dist', 'test-bp-fallback');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'spacing.order.json'), JSON.stringify({ order: [['s.b', '>=', 's.a']] }));
    try {
      const cfg = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false };
      const tokens = { s: { a: { $value: '4px' }, b: { $value: '2px' } } }; // b(2) >= a(4) violated
      const global = validate({ tokens, constraints: cfg, constraintsDir: dir });
      const bp = validate({ tokens, constraints: cfg, constraintsDir: dir, breakpoint: 'sm' });
      expect(global.ok).toBe(false);
      expect(bp.ok).toBe(false); // was a false PASS before the fallback
      expect(bp.violations.some((v) => v.ruleId === 'monotonic')).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('TASK-038: absolute constraintsDir paths are honored', () => {
  it('loads an absolute constraintsDir and catches an order violation', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dcv-abs-constraints-'));
    writeFileSync(join(dir, 'spacing.order.json'), JSON.stringify({ order: [['s.b', '>=', 's.a']] }));
    try {
      const cfg = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false };
      const tokens = { s: { a: { $value: '4px' }, b: { $value: '2px' } } };
      const result = validate({ tokens, constraints: cfg, constraintsDir: dir });
      expect(result.ok).toBe(false);
      expect(result.violations.some((v) => v.ruleId === 'monotonic')).toBe(true);
      expect(result.note).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('discovers lightness and cross-axis files under an absolute constraintsDir', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dcv-abs-discovery-'));
    writeFileSync(join(dir, 'color.order.json'), JSON.stringify({ order: [['color.a', '>=', 'color.b']] }));
    writeFileSync(join(dir, 'cross-axis.rules.json'), JSON.stringify({ rules: [] }));
    writeFileSync(join(dir, 'cross-axis.sm.rules.json'), JSON.stringify({ rules: [] }));
    try {
      const cfg = { constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false } };
      const sources = discoverConstraints({ config: cfg, constraintsDir: dir, bp: 'sm' });
      expect(sources).toContainEqual({
        type: 'lightness-file',
        orders: [['color.a', '>=', 'color.b']],
        path: join(dir, 'color.order.json'),
      });
      expect(sources).toContainEqual({ type: 'cross-axis-file', path: join(dir, 'cross-axis.rules.json') });
      expect(sources).toContainEqual({ type: 'cross-axis-file', path: join(dir, 'cross-axis.sm.rules.json'), bp: 'sm' });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('TASK-034: cross-axis enumeration tolerates a non-array rules field', () => {
  it('does not throw when rules is not an array', () => {
    const dir = join('dist', 'test-ca-nonarray');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'cross-axis.rules.json'), JSON.stringify({ rules: { notAnArray: true } }));
    try {
      expect(() => collectReferencedIds([{ type: 'cross-axis-file', path: join(dir, 'cross-axis.rules.json') }])).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('TASK-031: no-match note survives cross-axis presence', () => {
  it('fires the "nothing was checked" note when no constraint references the tokens, even with themes/cross-axis.rules.json present', () => {
    const r = validate({
      tokens: { foo: { bar: { $value: '5px' } } },
      constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false, wcag: [{ foreground: 'x.fg', background: 'x.bg', ratio: 4.5, description: 't' }] },
      constraintsDir: 'themes', // ships cross-axis.rules.json
    });
    expect(r.ok).toBe(true);
    expect(r.note).toBeTruthy();
    expect(r.note).toContain('nothing was checked');
  });
});
