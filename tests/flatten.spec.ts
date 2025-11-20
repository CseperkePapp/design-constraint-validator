import { describe, it, expect } from 'vitest';
import tokens from './fixtures/tokens.test.json';
import { flattenTokens } from '../core/flatten';

describe('flatten', () => {
  it('returns flat values and edges', () => {
    const { flat, edges } = flattenTokens(tokens as any);
    expect(flat['a.base'].value).toBe('#000000');
    expect(flat['b.usesA'].value).toBe('#000000'); // Resolved reference
    expect(flat['b.usesA'].raw).toBe('{a.base}'); // Original reference
    expect(flat['c.usesB'].value).toBe('#000000'); // Fully resolved chain
    expect(flat['alias.toC'].value).toBe('#000000'); // Alias pointing to chain end
    expect(edges).toContainEqual(['a.base','b.usesA']);
    expect(edges).toContainEqual(['b.usesA','c.usesB']);
  });

  it('resolves alias chain end correctly', () => {
    const { flat } = flattenTokens(tokens as any);
    expect(flat['alias.toC'].raw).toBe('{c.usesB}');
    expect(flat['alias.toC'].value).toBe(flat['c.usesB'].value);
  });

  it('throws on missing alias reference', () => {
    const broken = { a: { base: { $value: '#000' } }, bad: { ref: { $value: '{z.missing}' } } } as any;
    expect(() => flattenTokens(broken)).toThrow(/Could not resolve token z.missing/);
  });
});
