import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function readSnapshot() {
  const p = path.join(__dirname, '__fixtures__', 'tokens.css');
  return fs.readFileSync(p, 'utf8');
}

describe('tokens.css structural invariants', () => {
  const css = readSnapshot();

  it('contains required role tokens', () => {
    const required = [
      '--color-role-text-default',
      '--color-role-accent-default',
      '--color-role-focus-ring'
    ];
    for (const token of required) {
      expect(css).toContain(token);
    }
  });

  it('contains brand + gray palette ladder segments', () => {
    const brand = css.match(/--color-palette-brand-\d+/g) || [];
    const gray = css.match(/--color-palette-gray-\d+/g) || [];
    expect(brand.length).toBeGreaterThanOrEqual(2); // 600,700 present
    expect(gray.length).toBeGreaterThanOrEqual(2);  // 0 + 900 at least
  });

  it('uses OKLCH color syntax (modern model)', () => {
    const oklchCount = (css.match(/oklch\(/g) || []).length;
    expect(oklchCount).toBeGreaterThan(5);
  });

  it('exposes spacing scale continuity (2,3,4,5,6)', () => {
    const needed = ['2','3','4','5','6'];
    for (const n of needed) {
      expect(css).toMatch(new RegExp(`--size-spacing-${n}:`));
    }
  });

  it('includes motion + elevation primitives', () => {
    expect(css).toContain('--motion-duration-fast');
    expect(css).toContain('--motion-easing-standard');
    expect(css).toContain('--elevation-1');
  });
});
