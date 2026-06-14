import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { valuesToCss, sanitizeCssValue } from '../adapters/css.js';
import { emitJSON } from '../adapters/json.js';
import { emitJS } from '../adapters/js.js';

/**
 * TASK-035 Group C: output adapters must not inject/corrupt CSS, and must not
 * silently drop a token when two ids collapse to the same variable name.
 */
describe('TASK-035 C: CSS value sanitization (no injection)', () => {
  it('strips `;` `{` `}` and comment markers from values', () => {
    expect(sanitizeCssValue('red; } body { display:none')).not.toMatch(/[;{}]/);
    expect(sanitizeCssValue('10px /* c */')).not.toMatch(/\/\*|\*\//);
  });

  it('a malicious value cannot close the :root block early', () => {
    const css = valuesToCss({ 'color.x': 'red; } body { color: blue' });
    // Only the two structural closers (:root and @layer) — no injected `}`.
    expect((css.match(/}/g) || []).length).toBe(2);
    expect(css).not.toContain('body {');
  });
});

describe('TASK-035 C: variable-name collision is reported, not silently dropped', () => {
  const colliding = { 'a.b': 1, 'a-b': 2 }; // both → --a-b / "a-b"
  it('valuesToCss throws on collision', () => {
    expect(() => valuesToCss(colliding)).toThrow(/collision/i);
  });
  it('emitJSON throws on collision', () => {
    expect(() => emitJSON(colliding)).toThrow(/collision/i);
  });
  it('emitJS throws on collision', () => {
    expect(() => emitJS(colliding)).toThrow(/collision/i);
  });
  it('distinct ids that do NOT collide still emit', () => {
    expect(() => emitJSON({ 'a.b': 1, 'a.c': 2 })).not.toThrow();
  });
});

describe('TASK-035 C: build --all-formats honors --output as a directory', () => {
  it('writes css/json/js into the given --output dir', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dcv-allfmt-'));
    try {
      writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify({ color: { a: { $value: '#111' } } }));
      const cliJs = path.resolve(process.cwd(), 'cli/index.js');
      execSync(`node "${cliJs}" build --all-formats --output out --tokens tokens.json`, { cwd: dir, encoding: 'utf8', stdio: 'ignore' });
      expect(existsSync(path.join(dir, 'out', 'tokens.css'))).toBe(true);
      expect(existsSync(path.join(dir, 'out', 'tokens.json'))).toBe(true);
      expect(existsSync(path.join(dir, 'out', 'tokens.js'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}, 30000);
