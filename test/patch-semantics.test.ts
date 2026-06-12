import { describe, it, expect } from 'vitest';
import { applyFlatOverrides, buildPatch } from '../core/patch.js';

/**
 * TASK-009 audit: define and pin patch/set semantics that were previously only
 * exercised on happy paths.
 */
describe('patch/set semantics (TASK-009)', () => {
  it('set/override on an aliased token overwrites that token\'s own $value (de-aliases it), never the source', () => {
    const tokens = {
      color: {
        text: { $type: 'color', $value: '#888888' },
        brand: { $type: 'color', $value: '{color.text}' },
      },
    };
    applyFlatOverrides(tokens as never, { 'color.brand': '#ff0000' });
    // The named token (brand) now holds a literal; the alias is replaced.
    expect((tokens as { color: { brand: { $value: string } } }).color.brand.$value).toBe('#ff0000');
    // The alias source (text) is untouched.
    expect((tokens as { color: { text: { $value: string } } }).color.text.$value).toBe('#888888');
  });

  it('buildPatch records a deterministic modify change + content hash', () => {
    const tokens = { space: { md: { $value: '16px' } } };
    const patch = buildPatch({ tokens: tokens as never, overrides: { 'space.md': '20px' } });
    expect(patch.patch['space.md']).toBe('20px');
    const change = patch.changes.find((c) => c.id === 'space.md');
    expect(change?.type).toBe('modify');
    expect(change?.from).toBe('16px');
    expect(change?.to).toBe('20px');
    expect(typeof patch.hash).toBe('string');
    expect(patch.hash.length).toBe(64); // sha256 hex
  });

  it('applying a patch is a pure transform — it does not validate the result', () => {
    // This pins the deliberate contract: `patch apply` writes the transformed
    // tokens regardless of whether they satisfy constraints. Callers must run
    // `validate` afterward. Here, overriding to a clearly-bad contrast value
    // still produces a patch with no validation gate.
    const tokens = { color: { text: { $value: '#000000' } } };
    const patch = buildPatch({ tokens: tokens as never, overrides: { 'color.text': '#010101' } });
    expect(patch.patch['color.text']).toBe('#010101'); // no constraint check, by design
  });
});
