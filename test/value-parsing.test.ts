import { describe, it, expect } from 'vitest';
import { Engine } from '../core/engine.js';
import { MonotonicPlugin, parseSize } from '../core/constraints/monotonic.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
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
    expect(parseSize('50%')).toBeNull(); // genuinely unparseable
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
