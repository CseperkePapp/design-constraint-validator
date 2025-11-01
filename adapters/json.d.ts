import { type ManifestRow } from './css.js';
export declare function emitJSON(values: Record<string, any>, manifest?: ManifestRow[]): string;
import type { TokenId, TokenValue, FlatToken } from '../core/flatten.js';
/**
 * Generates a JSON representation of the entire token set and dependency graph.
 */
export declare function valuesToJson(data: {
    flat: Record<TokenId, FlatToken>;
    edges: [TokenId, TokenId][];
}): string;
/**
 * Generates a JSON representation of a patch from an engine commit.
 */
export declare function patchToJson(patch: {
    patch: Record<TokenId, TokenValue>;
    affected: TokenId[];
}): string;
//# sourceMappingURL=json.d.ts.map