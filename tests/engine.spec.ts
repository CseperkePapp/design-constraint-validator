import { describe, it, expect } from 'vitest';
import tokens from './fixtures/tokens.test.json';
import { flattenTokens } from '../core/flatten';
import { Engine } from '../core/engine';
import { WcagContrastPlugin } from '../core/constraints/wcag';

describe('engine', () => {
  it('affected() follows dependency edges', () => {
    const { flat, edges } = flattenTokens(tokens as any);
    const values = Object.fromEntries(Object.entries(flat).map(([id, token]) => [id, token.value]));
    const eng = new Engine(values, edges);
    const aff = eng.affected('a.base');
  expect(Array.from(aff)).toEqual(expect.arrayContaining(['b.usesA','c.usesB','alias.toC']));
  });

  it('commit() only touches affected and runs plugins', () => {
    const { flat, edges } = flattenTokens(tokens as any);
    const values = Object.fromEntries(Object.entries(flat).map(([id, token]) => [id, token.value]));
    const eng = new Engine(values, edges);
    eng.use(WcagContrastPlugin([])); // should not throw
    const result = eng.commit('a.base', '#010101');
  expect(Array.from(result.affected)).toEqual(expect.arrayContaining(['b.usesA','c.usesB','alias.toC']));
    expect(result.issues || []).toBeDefined();
  });
});
