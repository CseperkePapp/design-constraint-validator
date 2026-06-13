import { dirname, resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { flattenTokens, type FlatToken } from '../../core/flatten.js';
import { mergeTokens } from '../../core/breakpoints.js';
import { valuesToCss, type ManifestRow } from '../../adapters/css.js';
import { emitJSON } from '../../adapters/json.js';
import { emitJS } from '../../adapters/js.js';
import type { BuildOptions } from '../types.js';
import { loadThemeTokens } from './utils.js';

export async function buildCommand(options: BuildOptions & { [k: string]: any }): Promise<void> {
  const { loadTokensWithBreakpoint } = await import('../../core/breakpoints.js');
  let tokens = loadTokensWithBreakpoint(undefined, options.tokens);
  if (options.theme) {
    tokens = mergeTokens(tokens, loadThemeTokens(options.theme));
  }
  const { flat } = flattenTokens(tokens);
  const allValues = Object.fromEntries(Object.values(flat).map(t => [t.id, (t as FlatToken).value]));
  const format = options.format || 'css';
  const defaultOutput = `dist/tokens.${format}`;
  let manifest: ManifestRow[] | undefined;
  if (options.mapper) {
    try {
      const mp = resolve(options.mapper);
      if (!existsSync(mp)) throw new Error(`mapper file not found: ${mp}`);
      manifest = JSON.parse(readFileSync(mp, 'utf8')) as ManifestRow[];
      if (!Array.isArray(manifest)) throw new Error('mapper manifest must be an array');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`Failed to load mapper manifest: ${msg}`);
      process.exit(1);
    }
  }
  // Read both the kebab key (CLI, camel-case-expansion is off) and the camelCase
  // key (programmatic callers, e.g. tests). Reading only one form silently no-ops
  // for the other caller — that was the TASK-024 bug class.
  const allFormats = options['all-formats'] ?? options.allFormats;
  const dryRun = options['dry-run'] ?? options.dryRun;
  if (allFormats) {
    const css = valuesToCss(allValues, { manifest });
    const json = emitJSON(allValues, manifest);
    const js = emitJS(allValues, manifest);
    if (dryRun) {
      // Dry run: print every format, write nothing.
      console.log(css);
      console.log(json);
      console.log(js);
      return;
    }
    const dir = 'dist'; if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync('dist/tokens.css', css, 'utf8');
    writeFileSync('dist/tokens.json', json, 'utf8');
    writeFileSync('dist/tokens.js', js, 'utf8');
    console.log(`Tokens written (all formats) to dist/ (css/json/js)${manifest ? ' with mapper' : ''}`);
    return;
  }
  if (format === 'css') {
    const css = valuesToCss(allValues, { manifest });
  if (dryRun) { console.log(css); return; }
    const outPath = options.output || defaultOutput; const dir = dirname(outPath); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(outPath, css, 'utf8');
    console.log(`CSS tokens written to ${outPath}${manifest ? ' (manifest mapper applied)' : ''}`);
  } else if (format === 'json') {
    const outPath = options.output || defaultOutput; const dir = dirname(outPath); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (dryRun) { console.log(emitJSON(allValues, manifest)); return; }
    writeFileSync(outPath, emitJSON(allValues, manifest), 'utf8');
    console.log(`JSON tokens written to ${outPath}${manifest ? ' (manifest mapper applied)' : ''}`);
  } else if (format === 'js') {
    const outPath = options.output || defaultOutput; const dir = dirname(outPath); if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (dryRun) { console.log(emitJS(allValues, manifest)); return; }
    writeFileSync(outPath, emitJS(allValues, manifest), 'utf8');
    console.log(`JS tokens written to ${outPath}${manifest ? ' (manifest mapper applied)' : ''}`);
  }
}
