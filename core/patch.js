import { createHash } from 'node:crypto';
import { flattenTokens } from './flatten.js';
function canonicalString(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}
export function applyFlatOverrides(tokens, overrides) {
    if (!overrides)
        return;
    for (const [id, val] of Object.entries(overrides)) {
        const parts = id.split('.');
        let cur = tokens;
        for (let i = 0; i < parts.length; i++) {
            const p = parts[i];
            if (cur == null || typeof cur !== 'object')
                break;
            if (!(p in cur))
                break;
            if (i === parts.length - 1) {
                const leaf = cur[p];
                if (leaf && typeof leaf === 'object' && Object.prototype.hasOwnProperty.call(leaf, '$value')) {
                    if (val === null) {
                        // Do not delete here; handled later to keep reference resolution intact.
                    }
                    else {
                        leaf.$value = val;
                    }
                }
            }
            else {
                cur = cur[p];
            }
        }
    }
}
export function buildPatch(opts) {
    const cloned = JSON.parse(JSON.stringify(opts.tokens));
    // Flatten original
    const baseFlat = flattenTokens(cloned).flat;
    // Canonical base tokens hash (id -> value) for drift detection when applying patch later
    const baseFlatValues = {};
    Object.keys(baseFlat).sort().forEach(id => { baseFlatValues[id] = baseFlat[id]?.value; });
    const baseTokensHash = createHash('sha256').update(canonicalString(baseFlatValues)).digest('hex');
    // Apply overrides on a fresh clone for diffing
    const modified = JSON.parse(JSON.stringify(opts.tokens));
    const removalIds = new Set();
    if (opts.overrides) {
        for (const [id, v] of Object.entries(opts.overrides)) {
            if (v === null)
                removalIds.add(id);
        }
    }
    applyFlatOverrides(modified, opts.overrides);
    const modFlat = flattenTokens(modified).flat;
    // Post-process removals: remove from modFlat so diff sees them as missing
    for (const id of removalIds) {
        delete modFlat[id];
    }
    const changes = [];
    const patch = {};
    const visited = new Set();
    for (const id of Object.keys(baseFlat)) {
        visited.add(id);
        const before = baseFlat[id]?.value;
        const after = modFlat[id]?.value;
        if (removalIds.has(id)) {
            // Skip here; removal handled later
            continue;
        }
        if (before !== after) {
            changes.push({ id, from: before, to: after, type: 'modify' });
            patch[id] = after;
        }
        else if (opts.includeUnchanged) {
            changes.push({ id, from: before, to: after, type: 'modify' });
        }
    }
    // Added ids (override referencing unknown id -> treat as add)
    if (opts.overrides) {
        for (const id of Object.keys(opts.overrides)) {
            if (visited.has(id))
                continue;
            patch[id] = opts.overrides[id];
            changes.push({ id, from: null, to: opts.overrides[id], type: 'add' });
        }
    }
    // Removed ids (present in base, absent after overrides application)
    for (const id of Object.keys(baseFlat)) {
        if (!(id in modFlat)) {
            const before = baseFlat[id]?.value;
            patch[id] = null;
            changes.push({ id, from: before, to: null, type: 'remove' });
        }
    }
    // Sort deterministic
    changes.sort((a, b) => a.id.localeCompare(b.id));
    const patchSorted = {};
    Object.keys(patch).sort().forEach(k => { patchSorted[k] = patch[k]; });
    const hash = createHash('sha256').update(canonicalString(patchSorted)).digest('hex');
    return {
        version: 1,
        generatedAt: new Date().toISOString(),
        baseFile: opts.baseFile,
        breakpoint: opts.breakpoint,
        changes,
        patch: patchSorted,
        hash,
        baseTokensHash,
        meta: { changeCount: changes.length }
    };
}
