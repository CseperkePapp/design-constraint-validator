import { join, dirname, resolve } from 'node:path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { flattenTokens, type FlatToken } from '../../core/flatten.js';
import { valuesToCss, type ManifestRow } from '../../adapters/css.js';
import { emitJSON } from '../../adapters/json.js';
import { emitJS } from '../../adapters/js.js';
import type { BuildOptions } from '../types.js';

export async function buildCommand(options: BuildOptions & { [k: string]: any }): Promise<void> {
  const { loadTokensWithBreakpoint } = await import('../../core/breakpoints.js');
  const tokens = loadTokensWithBreakpoint();
  const { flat } = flattenTokens(tokens);
  let allValues = Object.fromEntries(Object.values(flat).map(t => [t.id, (t as FlatToken).value]));
  if (options.theme) {
    const themePath = join('tokens/themes', `${options.theme}.json`);
    if (existsSync(themePath)) {
      const themeTokens = JSON.parse(readFileSync(themePath, 'utf8'));
      Object.assign(allValues, themeTokens);
    }
  }
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
  const allFormats = options.allFormats ?? options['all-formats'];
  if (allFormats) {
    const dir = 'dist'; if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const css = valuesToCss(allValues, { manifest });
    writeFileSync('dist/tokens.css', css, 'utf8');
    if (options.dryRun) console.log(css);
    writeFileSync('dist/tokens.json', emitJSON(allValues, manifest), 'utf8');
    writeFileSync('dist/tokens.js', emitJS(allValues, manifest), 'utf8');
    console.log(`Tokens written (all formats) to dist/ (css/json/js)${manifest ? ' with mapper' : ''}`);
    return;
  }
  const dryRun = options.dryRun ?? options['dry-run'];
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
