import { describe, it, expect } from 'vitest';
import {
  buildPoset,
  transitiveReduction,
  toMermaidHasse,
  toMermaidHasseStyled,
  filterByPrefix,
  filterExcludePrefix,
  khopSubgraph,
  pickSeedsByPattern,
  sanitizeId,
  type Order,
} from '../core/poset.js';

/**
 * TASK-016 coverage hardening: the poset graph/Hasse machinery that backs
 * `dcv graph --hasse` and the filter/focus modes was untested.
 */
const edges = (g: Map<string, Set<string>>) =>
  [...g.entries()].flatMap(([u, vs]) => [...vs].map((v) => `${u}->${v}`)).sort();

describe('transitiveReduction (Hasse diagram)', () => {
  it('drops the redundant edge a->c when a->b->c exists', () => {
    const g = buildPoset([
      ['a', '>=', 'b'],
      ['b', '>=', 'c'],
      ['a', '>=', 'c'],
    ] as Order[]);
    expect(edges(g)).toEqual(['a->b', 'a->c', 'b->c']);
    const h = transitiveReduction(g);
    expect(edges(h)).toEqual(['a->b', 'b->c']); // a->c removed
  });

  it('keeps a genuine direct edge with no alternate path', () => {
    const g = buildPoset([['x', '>=', 'y']] as Order[]);
    expect(edges(transitiveReduction(g))).toEqual(['x->y']);
  });
});

describe('toMermaidHasse', () => {
  it('emits a flowchart with one line per edge', () => {
    const g = buildPoset([['a', '>=', 'b']] as Order[]);
    const mmd = toMermaidHasse(g, { title: 'T' });
    expect(mmd).toContain('flowchart TD');
    expect(mmd).toContain('%% T');
    expect(mmd).toContain('"a" --> "b"');
  });
});

describe('sanitizeId (TASK-027: injective node ids)', () => {
  it('does not collapse distinct ids that differ only in punctuation', () => {
    // The old `[^a-zA-Z0-9_] -> _` rule mapped both of these to "a_b".
    expect(sanitizeId('a.b')).not.toBe(sanitizeId('a_b'));
  });

  it('gives styled Hasse output distinct nodes for a.b vs a_b', () => {
    const g = buildPoset([['a.b', '>=', 'a_b']] as Order[]);
    const mmd = toMermaidHasseStyled(g, { title: 'T' });
    // Two distinct node declarations, not one shared node.
    expect(mmd).toContain(`${sanitizeId('a.b')}["a.b"]`);
    expect(mmd).toContain(`${sanitizeId('a_b')}["a_b"]`);
  });
});

describe('prefix filters', () => {
  const g = buildPoset([
    ['color.a', '>=', 'color.b'],
    ['size.a', '>=', 'size.b'],
  ] as Order[]);

  it('filterByPrefix keeps only the matching subtree', () => {
    expect(edges(filterByPrefix(g, ['color']))).toEqual(['color.a->color.b']);
  });

  it('filterExcludePrefix drops the matching subtree', () => {
    expect(edges(filterExcludePrefix(g, ['color']))).toEqual(['size.a->size.b']);
  });
});

describe('khopSubgraph', () => {
  const g = buildPoset([
    ['a', '>=', 'b'],
    ['b', '>=', 'c'],
    ['c', '>=', 'd'],
  ] as Order[]);

  it('k=1 keeps seed + immediate (undirected) neighbours', () => {
    // around b: a (a->b) and c (b->c)
    expect(edges(khopSubgraph(g, new Set(['b']), 1))).toEqual(['a->b', 'b->c']);
  });

  it('k=2 reaches two hops out', () => {
    const e = edges(khopSubgraph(g, new Set(['a']), 2));
    expect(e).toContain('a->b');
    expect(e).toContain('b->c');
    expect(e).not.toContain('c->d'); // d is 3 hops from a
  });
});

describe('pickSeedsByPattern', () => {
  const nodes = ['color.text', 'color.bg', 'size.md'];
  it('exact id', () => {
    expect([...pickSeedsByPattern(nodes, 'color.text')]).toEqual(['color.text']);
  });
  it('prefix wildcard', () => {
    expect([...pickSeedsByPattern(nodes, 'color*')].sort()).toEqual(['color.bg', 'color.text']);
  });
  it('no match → empty', () => {
    expect([...pickSeedsByPattern(nodes, 'nope')]).toEqual([]);
  });
});
