import { describe, it, expect } from 'vitest';
import { valuesToCss, patchToCss, defaultVarMapper } from '../adapters/css.js';
import { emitJS } from '../adapters/js.js';
import { valuesToJson, patchToJson } from '../adapters/json.js';
import { decisionthemesAdapter } from '../adapters/decisionthemes.js';

/**
 * Boundary tests for the adapters (TASK-009 audit).
 *
 * Finding: every adapter is OUTPUT-only — it takes the internal flat token map
 * and emits a format (CSS / JS / JSON). None of them PARSES external token files;
 * the input/DTCG path is core/flatten.ts. decisionthemes.ts is an unimplemented
 * placeholder that throws by design. These tests pin that contract so the
 * docs/Adapters.md "output adapters" framing can't silently drift.
 */
describe('adapters are output-only (TASK-009 boundary)', () => {
  it('css: valuesToCss emits a layered :root block with id→--var mapping', () => {
    const css = valuesToCss({ 'color.text': '#888888', 'space.md': '16px' });
    expect(css).toContain('@layer tokens');
    expect(css).toContain(':root {');
    expect(css).toContain('--color-text: #888888;');
    expect(css).toContain('--space-md: 16px;');
    // dots → hyphens, lowercased, reversible-ish neutral name
    expect(defaultVarMapper('a.b.c')).toBe('--a-b-c');
  });

  it('css: patchToCss uses the overrides layer', () => {
    const css = patchToCss({ 'color.text': '#000000' });
    expect(css).toContain('@layer tokens-overrides');
    expect(css).toContain('--color-text: #000000;');
  });

  it('js: emitJS emits a default-exported module keyed by css var name', () => {
    const js = emitJS({ 'color.text': '#888888' });
    expect(js).toContain('export default');
    expect(js).toContain('"--color-text": "#888888"');
  });

  it('json: valuesToJson emits { tokens, edges } from flat + edges', () => {
    const json = valuesToJson({
      flat: {
        a: { id: 'a', type: 'color', value: '#ffffff', raw: '#ffffff', refs: [] },
      },
      edges: [['a', 'b']],
    });
    const parsed = JSON.parse(json);
    expect(parsed.tokens).toEqual({ a: '#ffffff' });
    expect(parsed.edges).toEqual([{ from: 'a', to: 'b' }]);
  });

  it('json: patchToJson emits { changed, affected }', () => {
    const json = patchToJson({ patch: { a: 1 }, affected: ['a', 'b'] });
    const parsed = JSON.parse(json);
    expect(parsed.changed).toEqual({ a: 1 });
    expect(parsed.affected).toEqual(['a', 'b']);
  });

  it('decisionthemes: placeholder throws (not yet implemented) — documented as such', () => {
    expect(() => decisionthemesAdapter({ vt: {}, dt: {} })).toThrow(/not yet implemented/i);
  });
});
