import { describe, it, expect } from 'vitest';
import { flattenTokens } from '../core/flatten';
import { valuesToCss } from '../adapters/css';
import fs from 'node:fs';
import path from 'node:path';

describe('tokens.css snapshot', () => {
  it('matches generated CSS (canonical snapshot)', () => {
    const tokensPath = path.join(__dirname, '../tokens/tokens.example.json');
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    const { flat } = flattenTokens(tokens as any);
    const allValues = Object.fromEntries(Object.values(flat).map(t => [t.id, t.value]));
    const css = valuesToCss(allValues, { layer: 'tokens', selector: ':root' });

    const snapshotPath = path.join(__dirname, '__fixtures__/tokens.css');
    const snapshot = fs.readFileSync(snapshotPath, 'utf8');
    const normalize = (s: string) => s
      .replace(/\s+/g, ' ')            // collapse whitespace
      .replace(/@layer tokens ?\{/, '@layer tokens{') // normalize optional space after layer
      .trim();
    expect(normalize(css)).toBe(normalize(snapshot));
  });
});
