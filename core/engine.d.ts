import type { TokenId, TokenValue } from "./flatten.js";
export type ConstraintIssue = {
    id: TokenId | string;
    rule: string;
    level: "error" | "warn";
    message: string;
    where?: string;
};
export type ConstraintPlugin = {
    id: string;
    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
};
export type Graph = Map<TokenId, Set<TokenId>>;
export declare class Engine {
    private values;
    private graph;
    private plugins;
    constructor(initValues: Record<TokenId, TokenValue>, edges: Array<[TokenId, TokenId]>);
    use(plugin: ConstraintPlugin): this;
    get(id: TokenId): TokenValue | undefined;
    set(id: TokenId, value: TokenValue): void;
    /** All nodes that depend (directly/indirectly) on start. */
    affected(start: TokenId): Set<TokenId>;
    evaluate(candidates: Set<TokenId>): ConstraintIssue[];
    /** Single change -> returns affected set, issues, and a patch you can feed to adapters. */
    commit(id: TokenId, value: TokenValue): {
        affected: string[];
        issues: ConstraintIssue[];
        patch: Record<string, TokenValue>;
    };
}
//# sourceMappingURL=engine.d.ts.map