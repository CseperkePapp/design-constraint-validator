import type { TokenNode, TokenValue } from './flatten.js';
export interface PatchChange {
    id: string;
    from: TokenValue | null | undefined;
    to: TokenValue | null | undefined;
    type: 'modify' | 'add' | 'remove';
}
export interface PatchDocument {
    version: 1;
    generatedAt: string;
    baseFile?: string;
    breakpoint?: string;
    changes: PatchChange[];
    patch: Record<string, TokenValue | null | undefined>;
    hash: string;
    baseTokensHash?: string;
    meta?: Record<string, any>;
}
export interface BuildPatchOptions {
    tokens: TokenNode;
    baseFile?: string;
    overrides?: Record<string, any>;
    breakpoint?: string;
    includeUnchanged?: boolean;
}
export declare function applyFlatOverrides(tokens: TokenNode, overrides?: Record<string, any>): void;
export declare function buildPatch(opts: BuildPatchOptions): PatchDocument;
//# sourceMappingURL=patch.d.ts.map