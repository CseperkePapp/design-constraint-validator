import { describe, it, expect } from 'vitest';
import { validate } from '../core/index.js';

/**
 * TASK-030: the shipped "failing" examples must genuinely fail. They previously
 * validated `ok: true, checked: 0` (old `value` key, no constraints). This guards
 * against them silently regressing to passing again. Paths are repo-root relative
 * (vitest cwd).
 */
describe('examples/failing/* genuinely fail', () => {
  const constraintsDir = 'examples/failing';
  const configPath = 'examples/failing/dcv.config.json';

  it('contrast-fail flags a WCAG contrast violation', () => {
    const r = validate({
      tokensPath: 'examples/failing/contrast-fail.tokens.json',
      configPath,
      constraintsDir,
    });
    expect(r.ok).toBe(false);
    expect(r.counts.violations).toBeGreaterThanOrEqual(1);
    expect(r.violations.some((v) => v.ruleId === 'wcag-contrast')).toBe(true);
  });

  it('monotonicity-fail flags an out-of-order heading scale', () => {
    const r = validate({
      tokensPath: 'examples/failing/monotonicity-fail.tokens.json',
      configPath,
      constraintsDir,
    });
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => v.ruleId === 'monotonic')).toBe(true);
  });
});
