export type TokenId = string;
export type TokenValue = string | number;
export type Graph = Map<TokenId, Set<TokenId>>;
export type ConstraintIssue = {
    id: TokenId;
    rule: string;
    level: "error" | "warn";
    message: string;
};
export type ConstraintPlugin = {
    id: string;
    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
};
export declare class Engine {
    private values;
    private graph;
    private plugins;
    constructor(initValues: Record<TokenId, TokenValue>, edges: Array<[TokenId, TokenId]>);
    set(id: TokenId, value: TokenValue): void;
    get(id: TokenId): TokenValue | undefined;
    use(plugin: ConstraintPlugin): this;
    affected(start: TokenId): Set<TokenId>;
    evaluate(ids: Iterable<TokenId>): ConstraintIssue[];
    /** Apply a single change and return a batch: affected set + issues + patch */
    commit(id: TokenId, value: TokenValue): {
        affected: string[];
        issues: ConstraintIssue[];
        patch: Record<string, TokenValue>;
    };
}
//# sourceMappingURL=index.d.ts.map