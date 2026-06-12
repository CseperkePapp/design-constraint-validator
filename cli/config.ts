import { readFileSync, existsSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { validateConfig } from './config-schema.js';
import { ok, err, type Result } from './result.js';
import type { DcvConfig } from './types.js';

export function loadConfig(configPath?: string): Result<DcvConfig, string> {
  if (configPath && !existsSync(configPath)) {
    return err(`Config file not found: ${configPath}`);
  }
  const candidates = configPath ? [configPath] : [
    'dcv.config.json',
    '.dcvrc.json',
    'package.json'
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    if (extname(p) === '.js') {
      return err(`Unsupported config file ${p}: use JSON config (dcv.config.json, .dcvrc.json, or package.json "dcv").`);
    }
    try {
      const rawTxt = readFileSync(p, 'utf8');
      let raw: unknown = JSON.parse(rawTxt);
      if (basename(p) === 'package.json' && raw && typeof raw === 'object') {
        const pkg = raw as Record<string, unknown>;
        if ('dcv' in pkg) {
          raw = pkg.dcv;
        } else {
          continue; // No dcv config in package.json
        }
      }
      const { value, errors } = validateConfig(raw);
      if (errors) return err(`Config validation failed in ${p}:\n  - ${errors.join('\n  - ')}`);
      return ok(value!);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return err(`Failed reading config ${p}: ${msg}`);
    }
  }
  return ok({});
}
