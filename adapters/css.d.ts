export type TokenId = string;
export type TokenValue = string | number;
export type VarMapper = (id: TokenId) => string | null;
export declare const defaultVarMapper: VarMapper;
export type ManifestRow = {
    id: string;
    canonicalVar?: string | null;
    legacyVars?: string[];
};
export interface VarMapping {
    canonical: string;
    aliases: string[];
}
/**
 * Build a mapping of token id -> {canonical, aliases} from an optional manifest.
 * If no manifest provided, falls back to defaultVarMapper with no aliases.
 */
export declare function buildVarMapping(ids: Iterable<string>, manifest?: ManifestRow[]): Map<string, VarMapping>;
export declare function makeManifestVarMapper(manifest: ManifestRow[]): VarMapper;
/**
 * Generate CSS for a *full* :root block (use for initial build from flat values).
 */
export declare function valuesToCss(values: Record<TokenId, TokenValue>, opts?: {
    selector?: string;
    layer?: string;
    mapVar?: VarMapper;
    manifest?: ManifestRow[];
}): string;
/**
 * Generate CSS for a *patch* (small overlay you can inject at runtime).
 */
export declare function patchToCss(patch: Record<TokenId, TokenValue>, opts?: {
    selector?: string;
    layer?: string;
    mapVar?: VarMapper;
    manifest?: ManifestRow[];
}): string;
/**
 * (Browser only) Replace the contents of a <style> element with the given CSS.
 */
export declare function applyCssToStyleEl(styleEl: {
    textContent: string | null;
}, cssText: string): void;
//# sourceMappingURL=css.d.ts.map