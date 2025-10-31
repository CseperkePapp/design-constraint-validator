import { readFileSync, existsSync } from 'node:fs';
import { validateConfig } from './config-schema.js';
import { ok, err } from './result.js';
export function loadConfig(configPath) {
    const candidates = configPath ? [configPath] : [
        'dcv.config.json',
        'dcv.config.js',
        '.dcvrc.json',
        'package.json'
    ];
    for (const p of candidates) {
        if (!existsSync(p))
            continue;
        try {
            const rawTxt = readFileSync(p, 'utf8');
            let raw = JSON.parse(rawTxt);
            if (p === 'package.json' && raw && typeof raw === 'object') {
                const pkg = raw;
                if ('dcv' in pkg) {
                    raw = pkg.dcv;
                }
                else {
                    continue; // No dcv config in package.json
                }
            }
            const { value, errors } = validateConfig(raw);
            if (errors)
                return err(`Config validation failed in ${p}:\n  - ${errors.join('\n  - ')}`);
            return ok(value);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return err(`Failed reading config ${p}: ${msg}`);
        }
    }
    return ok({});
}
