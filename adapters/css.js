export const defaultVarMapper = (id) => `--${id.replace(/[^a-z0-9.]/gi, "-").replace(/\.+/g, "-").toLowerCase()}`;
;
/**
 * Build a mapping of token id -> {canonical, aliases} from an optional manifest.
 * If no manifest provided, falls back to defaultVarMapper with no aliases.
 */
export function buildVarMapping(ids, manifest) {
    const map = new Map();
    const byId = new Map();
    if (manifest) {
        for (const row of manifest) {
            if (!row || !row.id)
                continue;
            byId.set(row.id, row);
        }
    }
    for (const id of ids) {
        const row = byId.get(id);
        // Always fall back to generated name so canonical is never null.
        const canonical = ((row?.canonicalVar ? row.canonicalVar.trim() : "") || defaultVarMapper(id));
        const aliasSet = new Set();
        (row?.legacyVars || []).forEach(a => {
            if (!a)
                return;
            const alias = a.trim();
            if (alias && alias !== canonical)
                aliasSet.add(alias);
        });
        map.set(id, { canonical, aliases: Array.from(aliasSet) });
    }
    return map;
}
export function makeManifestVarMapper(manifest) {
    const byId = new Map();
    for (const m of manifest)
        if (m.canonicalVar)
            byId.set(m.id, m.canonicalVar);
    return (id) => byId.get(id) ?? defaultVarMapper(id);
}
// Build a CSS block from a map of token IDs to values.
function buildCssBlock(values, opts) {
    const decls = [];
    if (opts.manifest) {
        const mapping = buildVarMapping(Object.keys(values), opts.manifest);
        for (const [id, val] of Object.entries(values)) {
            const m = mapping.get(id);
            if (!m)
                continue;
            const v = String(val).trim();
            if (!v)
                continue;
            decls.push(`${m.canonical}: ${v};`);
            for (const alias of m.aliases) {
                decls.push(`${alias}: var(${m.canonical});`);
            }
        }
    }
    else {
        const mapVar = opts.mapVar ?? defaultVarMapper;
        for (const [id, val] of Object.entries(values)) {
            const cssVar = mapVar(id);
            if (!cssVar)
                continue; // skip if intentionally unmapped
            const v = String(val).trim();
            if (v)
                decls.push(`${cssVar}: ${v};`);
        }
    }
    return decls.join("\n    ");
}
/**
 * Generate CSS for a *full* :root block (use for initial build from flat values).
 */
export function valuesToCss(values, opts) {
    const selector = opts?.selector ?? ":root";
    const layer = opts?.layer ?? "tokens";
    const body = buildCssBlock(values, { mapVar: opts?.mapVar, manifest: opts?.manifest });
    return `@layer ${layer} {\n  ${selector} {\n    ${body}\n  }\n}`;
}
/**
 * Generate CSS for a *patch* (small overlay you can inject at runtime).
 */
export function patchToCss(patch, opts) {
    const selector = opts?.selector ?? ":root";
    const layer = opts?.layer ?? "tokens-overrides";
    const body = buildCssBlock(patch, { mapVar: opts?.mapVar, manifest: opts?.manifest });
    return `@layer ${layer} {\n  ${selector} {\n    ${body}\n  }\n}`;
}
/**
 * (Browser only) Replace the contents of a <style> element with the given CSS.
 */
export function applyCssToStyleEl(styleEl, cssText) {
    styleEl.textContent = cssText;
}
// NOTE: The design studio -> catalog preview iframe token sync uses a simplified
// :root { --token: value } block (no @layer) built ad-hoc. For a layered build
// prefer valuesToCss / patchToCss helpers above.
