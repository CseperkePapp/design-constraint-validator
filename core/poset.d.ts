export type Id = string;
export type Comp = "<=" | ">=";
export type Order = [Id, Comp, Id];
export type Digraph = Map<Id, Set<Id>>;
export type EdgeLabels = Map<string, string>;
/** Safe ID for Mermaid/DOT node identifiers */
export declare function sanitizeId(id: string): string;
export type Highlight = {
    nodes?: Set<string>;
    edges?: Set<string>;
    color?: string;
};
export declare function buildPoset(orders: Order[]): Digraph;
export declare function transitiveReduction(g: Digraph): Digraph;
export declare function toMermaidHasse(gHasse: Digraph, { title }?: {
    title?: string | undefined;
}): string;
export declare function toMermaidHasseStyled(g: Digraph, opts?: {
    title?: string;
    highlight?: Highlight;
    labels?: EdgeLabels;
}): string;
export declare function toDotHasse(gHasse: Digraph, opts?: {
    title?: string;
    labels?: EdgeLabels;
}): string;
export declare function toDotHasseStyled(g: Digraph, opts?: {
    title?: string;
    highlight?: Highlight;
    labels?: EdgeLabels;
}): string;
export declare function validatePoset(g: Digraph): {
    valid: boolean;
    cycles?: Id[][];
};
export declare function filterDigraph(g: Digraph, predicate: (id: string) => boolean): Digraph;
export declare function filterByPrefix(g: Digraph, prefixes: string[]): Digraph;
export declare function filterExcludePrefix(g: Digraph, prefixes: string[]): Digraph;
export declare function khopSubgraph(g: Digraph, seeds: Set<string>, k?: number): Digraph;
export declare function pickSeedsByPattern(nodes: Iterable<string>, pattern: string): Set<string>;
//# sourceMappingURL=poset.d.ts.map