import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validate } from '../core/index.js';

/**
 * TASK-037: close the false-ok class. Each test proves that genuinely-wrong,
 * typo'd, or out-of-range input is rejected/surfaced LOUDLY instead of silently
 * reporting `ok: true`. "No rule ran" must never look like "rule passed".
 */

const NO_BUILTINS = { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false } as const;

function withTempDir<T>(fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), 'dcv-strict-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('TASK-037 item 1: typo\'d constraint block keys are rejected (not silently ignored)', () => {
  it('rejects an unknown key inside constraints (e.g. `wcagg`)', () => {
    expect(() =>
      validate({ tokens: { c: { $value: '1px' } }, constraints: { ...NO_BUILTINS, wcagg: [] } as any }),
    ).toThrow(/validation failed|wcagg|Unrecognized/i);
  });
});

describe('TASK-037 item 2: typo\'d rule fields are rejected (not dropped to a default)', () => {
  it('rejects a misspelled threshold field (`levle`)', () => {
    expect(() =>
      validate({
        tokens: { control: { size: { $value: '32px' } } },
        constraints: { ...NO_BUILTINS, thresholds: [{ id: 'control.size', op: '>=', valuePx: 44, levle: 'warn' }] } as any,
      }),
    ).toThrow(/validation failed|levle|Unrecognized/i);
  });
});

describe('TASK-037 item 3: out-of-range ratio / valuePx are rejected', () => {
  const wcag = (ratio: number) => ({ ...NO_BUILTINS, wcag: [{ foreground: 'a', background: 'b', ratio, description: 't' }] });
  const thr = (valuePx: number) => ({ ...NO_BUILTINS, thresholds: [{ id: 'a', op: '>=' as const, valuePx }] });
  const tokens = { a: { $value: '#000' }, b: { $value: '#fff' } };

  it('rejects ratio <= 1', () => {
    expect(() => validate({ tokens, constraints: wcag(0.5) as any })).toThrow();
  });
  it('rejects ratio > 21', () => {
    expect(() => validate({ tokens, constraints: wcag(50) as any })).toThrow();
  });
  it('rejects non-finite ratio', () => {
    expect(() => validate({ tokens, constraints: wcag(Infinity) as any })).toThrow();
  });
  it('rejects negative valuePx', () => {
    expect(() => validate({ tokens: { a: { $value: '1px' } }, constraints: thr(-1) as any })).toThrow();
  });
  it('rejects non-finite valuePx', () => {
    expect(() => validate({ tokens: { a: { $value: '1px' } }, constraints: thr(Infinity) as any })).toThrow();
  });
});

describe('TASK-037 item 8: a configured `warn` threshold stays a warning', () => {
  it('does not promote a warn-level threshold to an error', () => {
    const r = validate({
      tokens: { control: { size: { $value: '32px' } } },
      constraints: { ...NO_BUILTINS, thresholds: [{ id: 'control.size', op: '>=', valuePx: 44, level: 'warn', where: 'soft' }] },
    });
    expect(r.ok).toBe(true); // warn, not error
    expect(r.violations).toHaveLength(0);
    expect(r.warnings.some((w) => w.ruleId === 'custom-threshold')).toBe(true);
  });
});

describe('TASK-037 item 4: malformed cross-axis rules are skipped with a reason (no NaN false error)', () => {
  it('skips a rule with a non-numeric fallback and surfaces a warning instead of `b < NaN`', () =>
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'cross-axis.rules.json'),
        JSON.stringify({ rules: [{ id: 'bad', when: { id: 'a', op: '>=', value: 0 }, require: { id: 'b', op: '>=', fallback: 'abc' } }] }),
      );
      const r = validate({ tokens: { a: { $value: '1px' }, b: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.violations).toHaveLength(0); // no spurious `b < NaN` error
      expect(r.warnings.some((w) => /skipped/i.test(w.message ?? ''))).toBe(true);
    }));

  it('skips a rule whose `when` is missing op/value (no always-true predicate)', () =>
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'cross-axis.rules.json'),
        JSON.stringify({ rules: [{ id: 'halfwhen', when: { id: 'a' }, require: { id: 'b', op: '>=', fallback: '10px' } }] }),
      );
      const r = validate({ tokens: { a: { $value: '1px' }, b: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.warnings.some((w) => /skipped/i.test(w.message ?? ''))).toBe(true);
    }));
});

describe('TASK-037 item 5: a present-but-unusable cross-axis file is surfaced, not swallowed', () => {
  it('warns on invalid JSON instead of silently treating it as no rules', () =>
    withTempDir((dir) => {
      writeFileSync(join(dir, 'cross-axis.rules.json'), '{ this is : not valid json');
      const r = validate({ tokens: { a: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.warnings.some((w) => /unusable|invalid JSON/i.test(w.message ?? ''))).toBe(true);
    }));
});

describe('TASK-037 item 6: cross-axis size parsing shares the hardened finite policy', () => {
  it('coerces an `em` operand (was silently skipped) so the violation is caught', () =>
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'cross-axis.rules.json'),
        JSON.stringify({ rules: [{ id: 'emrule', when: { id: 'a', op: '>=', value: 0 }, require: { id: 'b', op: '>=', fallback: '10px' } }] }),
      );
      // a=1em→16 (when 16>=0 true); b=1px→1, require 1>=10 fails → error.
      const r = validate({ tokens: { a: { $value: '1em' }, b: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.ok).toBe(false);
      expect(r.violations.some((v) => v.ruleId === 'cross-axis')).toBe(true);
    }));

  it('warns (does not silently skip) on a present-but-unparseable operand', () =>
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'cross-axis.rules.json'),
        JSON.stringify({ rules: [{ id: 'pct', when: { id: 'a', op: '>=', value: 0 }, require: { id: 'b', op: '>=', fallback: '10px' } }] }),
      );
      const r = validate({ tokens: { a: { $value: '50%' }, b: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.warnings.some((w) => /unparseable/i.test(w.message ?? ''))).toBe(true);
    }));
});

describe('TASK-037 item 7: coverage mirrors breakpoint filtering', () => {
  it('a bp-only rule does not suppress the no-match note in a global run', () =>
    withTempDir((dir) => {
      writeFileSync(
        join(dir, 'cross-axis.rules.json'),
        JSON.stringify({ rules: [{ id: 'sm-only', bp: 'sm', when: { id: 'a', op: '>=', value: 0 }, require: { id: 'b', op: '>=', fallback: '10px' } }] }),
      );
      // Global run: the sm rule does not run, so nothing references the tokens.
      const r = validate({ tokens: { a: { $value: '1px' }, b: { $value: '1px' } }, constraints: NO_BUILTINS, constraintsDir: dir });
      expect(r.ok).toBe(true);
      expect(r.note).toBeTruthy();
      expect(r.note).toContain('nothing was checked');
    }));
});
