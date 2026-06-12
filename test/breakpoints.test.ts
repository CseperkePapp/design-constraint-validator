import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  mergeTokens,
  parseBreakpoints,
  loadJsonSafe,
  loadTokensWithBreakpoint,
} from '../core/breakpoints.js';

/**
 * TASK-016 coverage hardening: breakpoints.ts merge precedence was untested.
 * The precedence chain in loadTokensWithBreakpoint is
 *   mergeTokens(mergeTokens(base, local), bp)
 * so mergeTokens is the load-bearing logic; pin it directly, plus the
 * error paths and the small parsers.
 */
describe('mergeTokens: deep merge, overlay wins', () => {
  it('overlay overrides base at the leaf, deep-merges branches', () => {
    const base = { color: { text: { $value: '#000' }, bg: { $value: '#fff' } } };
    const overlay = { color: { text: { $value: '#111' } } };
    const out = mergeTokens(base, overlay) as typeof base;
    expect(out.color.text.$value).toBe('#111'); // overridden
    expect(out.color.bg.$value).toBe('#fff'); // preserved (deep merge, not replace)
  });

  it('null/undefined overlay returns base unchanged', () => {
    const base = { a: { $value: 1 } };
    expect(mergeTokens(base, null)).toBe(base);
    expect(mergeTokens(base, undefined)).toBe(base);
  });

  it('when base is not an object, overlay replaces it', () => {
    expect(mergeTokens('scalar', { a: 1 })).toEqual({ a: 1 });
  });

  it('models the base < local < breakpoint precedence (last wins)', () => {
    const base = { t: { $value: 'base' } };
    const local = { t: { $value: 'local' } };
    const bp = { t: { $value: 'bp' } };
    const merged = mergeTokens(mergeTokens(base, local), bp) as { t: { $value: string } };
    expect(merged.t.$value).toBe('bp'); // breakpoint wins
    const noBp = mergeTokens(mergeTokens(base, local), null) as { t: { $value: string } };
    expect(noBp.t.$value).toBe('local'); // local wins over base
  });
});

describe('parseBreakpoints', () => {
  it('--all-breakpoints → all three', () => {
    expect(parseBreakpoints(['--all-breakpoints'])).toEqual(['sm', 'md', 'lg']);
  });
  it('--breakpoint md → [md]', () => {
    expect(parseBreakpoints(['--breakpoint', 'md'])).toEqual(['md']);
  });
  it('no flag → []', () => {
    expect(parseBreakpoints(['validate'])).toEqual([]);
  });
});

describe('loadJsonSafe', () => {
  it('returns null for a missing file (never throws)', () => {
    expect(loadJsonSafe('does/not/exist.json')).toBeNull();
  });
  it('returns null for invalid JSON', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dcv-bp-'));
    try {
      const p = path.join(dir, 'bad.json');
      writeFileSync(p, '{not json');
      expect(loadJsonSafe(p)).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('loadTokensWithBreakpoint: explicit-path error handling', () => {
  it('throws a clear error when the explicit tokens path is missing', () => {
    expect(() => loadTokensWithBreakpoint(undefined, 'no/such/tokens.json')).toThrow(
      /Tokens file not found/,
    );
  });

  it('throws when the explicit tokens file is invalid JSON', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dcv-bp-'));
    try {
      const p = path.join(dir, 'tokens.json');
      writeFileSync(p, '{nope');
      expect(() => loadTokensWithBreakpoint(undefined, p)).toThrow(/not valid JSON/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
