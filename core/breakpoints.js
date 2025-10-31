// core/breakpoints.ts
import fs from "node:fs";
export function parseBreakpoints(argv) {
    const allIdx = argv.indexOf("--all-breakpoints");
    if (allIdx >= 0)
        return ["sm", "md", "lg"];
    const bpIdx = argv.indexOf("--breakpoint");
    if (bpIdx >= 0)
        return [argv[bpIdx + 1]];
    return []; // no BP slicing requested
}
export function loadJsonSafe(path) {
    try {
        const data = JSON.parse(fs.readFileSync(path, "utf8"));
        return data;
    }
    catch {
        return null;
    }
}
export function loadOrders(axis, bp) {
    const withBp = bp ? loadJsonSafe(`themes/${axis}.${bp}.order.json`) : null;
    if (withBp?.order)
        return withBp.order;
    const global = loadJsonSafe(`themes/${axis}.order.json`);
    return (global?.order ?? []);
}
export function mergeTokens(base, overlay) {
    if (!overlay)
        return base;
    if (typeof base !== "object" || base === null)
        return overlay;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const k of Object.keys(overlay)) {
        out[k] = mergeTokens(base?.[k], overlay[k]);
    }
    return out;
}
/** Load tokens with optional breakpoint override: base + overrides/<bp>.json */
/**
 * Load tokens with override precedence: base < local < breakpoint
 */
export function loadTokensWithBreakpoint(bp) {
    const base = loadJsonSafe("tokens/tokens.example.json") ?? {};
    const local = loadJsonSafe("tokens/overrides/local.json");
    const ov = bp ? loadJsonSafe(`tokens/overrides/${bp}.json`) : null;
    return mergeTokens(mergeTokens(base, local), ov);
}
