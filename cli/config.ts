import { readFileSync, existsSync } from 'node:fs';
import { validateConfig } from './config-schema.js';
import { ok, err, type Result } from './result.js';
import type { LarissaConfig } from './types.js';

export function loadConfig(configPath?: string): Result<LarissaConfig, string> {
  const candidates = configPath ? [configPath] : [
    'dcv.config.json',
    'dcv.config.js',
    '.dcvrc.json',
    'dtv.config.json',      // legacy support
    'dtv.config.js',        // legacy support
    '.dtvrc.json',          // legacy support
    'larissa.config.json',  // legacy support
    'larissa.config.js',    // legacy support
    '.larissarc.json',      // legacy support
    'package.json'
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    try {
      const rawTxt = readFileSync(p, 'utf8');
      let raw: unknown = JSON.parse(rawTxt);
      if (p === 'package.json' && raw && typeof raw === 'object') {
        const pkg = raw as Record<string, unknown>;
        // Check for dcv config first, fall back to dtv/larissa for legacy support
        if ('dcv' in pkg) {
          raw = pkg.dcv;
        } else if ('dtv' in pkg) {
          raw = pkg.dtv;
        } else if ('larissa' in pkg) {
          raw = pkg.larissa;
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
