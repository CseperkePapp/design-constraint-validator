import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { valuesToCss } from '../../adapters/css.js';
import type { TokenNode, TokenValue } from '../../core/flatten.js';

// Shared helpers for command modules

export function loadTokens(tokensPath: string): TokenNode {
  const resolvedPath = resolve(tokensPath);
  if (!existsSync(resolvedPath)) {
    throw new Error(`Token file not found: ${resolvedPath}`);
  }
  const data = JSON.parse(readFileSync(resolvedPath, 'utf8'));
  if (typeof data !== 'object' || data === null) {
    throw new Error(`Invalid token file: expected object, got ${typeof data}`);
  }
  return data as TokenNode;
}

export function loadThemeTokens(theme: string): TokenNode {
  const themePath = join('tokens/themes', `${theme}.json`);
  if (!existsSync(themePath)) {
    throw new Error(`Theme file not found: ${themePath}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(readFileSync(themePath, 'utf8'));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(`Theme file is not valid JSON: ${themePath} (${detail})`);
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    const got = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data;
    throw new Error(`Theme file must contain a JSON object: ${themePath} (got ${got})`);
  }

  return data as TokenNode;
}

export function outputResult(data: unknown, format: string, outputPath?: string): void {
  let content: string;
  switch (format) {
    case 'json':
      content = JSON.stringify(data, null, 2);
      break;
    case 'css': {
      if (data && typeof data === 'object' && 'patch' in (data as { patch?: unknown })) {
        const patch = (data as { patch: Record<string, TokenValue> }).patch;
        content = valuesToCss(patch);
      } else if (data && typeof data === 'object') {
        content = valuesToCss(data as Record<string, TokenValue>);
      } else {
        content = valuesToCss({});
      }
      break; }
    case 'js':
      content = `export default ${JSON.stringify(data, null, 2)};`;
      break;
    default:
      content = JSON.stringify(data, null, 2);
  }
  if (outputPath) {
    const dir = dirname(outputPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(outputPath, content, 'utf8');
    console.log(`Output written to: ${outputPath}`);
  } else {
    console.log(content);
  }
}
