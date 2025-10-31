import { loadTokens, outputResult } from './utils.js';
import { buildPatch } from '../../core/patch.js';
export async function patchCommand(opts) {
    const tokens = loadTokens(opts.tokens || 'tokens/tokens.example.json');
    // For now just accept a flat overrides JSON file if provided
    let overrides;
    if (opts.overrides) {
        const fs = await import('node:fs');
        if (fs.existsSync(opts.overrides)) {
            overrides = JSON.parse(fs.readFileSync(opts.overrides, 'utf8'));
        }
        else if (opts.overrides.startsWith('{')) {
            overrides = JSON.parse(opts.overrides);
        }
        else {
            throw new Error(`Overrides not found: ${opts.overrides}`);
        }
    }
    const patchDoc = buildPatch({ tokens, overrides, baseFile: opts.tokens });
    outputResult(patchDoc, opts.format || 'json', opts.output);
}
