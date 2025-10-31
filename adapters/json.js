// adapters/json.ts
import { buildVarMapping, defaultVarMapper } from './css.js';
export function emitJSON(values, manifest) {
    const ids = Object.keys(values).sort();
    let mapping;
    if (manifest)
        mapping = buildVarMapping(ids, manifest);
    const out = {};
    for (const id of ids) {
        const canonical = mapping ? mapping.get(id).canonical : defaultVarMapper(id);
        if (canonical)
            out[canonical] = values[id];
    }
    return JSON.stringify(out, null, 2) + '\n';
}
/**
 * Generates a JSON representation of the entire token set and dependency graph.
 */
export function valuesToJson(data) {
    const values = Object.fromEntries(Object.entries(data.flat).map(([id, token]) => [id, token.value]));
    const edges = data.edges.map(([from, to]) => ({ from, to }));
    return JSON.stringify({
        tokens: values,
        edges: edges,
    }, null, 2);
}
/**
 * Generates a JSON representation of a patch from an engine commit.
 */
export function patchToJson(patch) {
    return JSON.stringify({
        changed: patch.patch,
        affected: patch.affected,
    }, null, 2);
}
