import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validate } from '../core/index.js';

/**
 * DTCG 2025.10 stable-spec compliance.
 *
 * Validates the committed Figma-shaped fixture end-to-end through the real
 * programmatic API. Proves DCV handles the stable spec's structured color and
 * dimension objects, `{alias}` references, and `$extensions` — none of which
 * existed when the flattener was written (it was string/number only).
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.resolve(here, '../examples/dtcg/figma-export.tokens.json');
const configPath = path.resolve(here, '../examples/dtcg/dcv.config.json');

const result = validate({ tokensPath, configPath });
const violations = JSON.stringify(result.violations);
const warnings = JSON.stringify(result.warnings);

describe('DTCG 2025.10 stable-spec compliance', () => {
  it('validates structured sRGB colors instead of choking on object $value', () => {
    // color.text(#888888) on color.bg(#999999) ≈ 1.24:1 — a real failing pair.
    // color.bg has NO hex field, so this also proves srgb components → color math.
    expect(result.ok).toBe(false);
    expect(violations).toContain('color.text');
    expect(violations).toContain('color.bg');
  });

  it('resolves {alias.path} references (brand → text)', () => {
    // color.brand aliases color.text; it must fail the same contrast, proving the
    // alias resolved to #888888 rather than the literal string "{color.text}".
    expect(violations).toContain('color.brand');
  });

  it('normalizes structured dimensions so thresholds apply', () => {
    // size.touch = { value: 30, unit: "px" } < 44px → threshold violation.
    expect(violations).toContain('size.touch');
  });

  it('warns on non-sRGB color spaces, never silently doing wrong math', () => {
    // color.neon is display-p3 with no hex fallback → explicit unparseable warning
    // that names the color space; it is never coerced into sRGB contrast math.
    expect(warnings).toContain('display-p3');
  });

  it('tolerates $extensions without error', () => {
    // $extensions on color.text must not crash flattening/validation.
    expect(result.counts.checked).toBeGreaterThan(0);
  });
});
