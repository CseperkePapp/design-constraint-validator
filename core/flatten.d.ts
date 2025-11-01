export type TokenId = string;
export type TokenValue = string | number;
export type TokenNode = {
    $type?: string;
    $value?: TokenValue;
    [k: string]: TokenNode | string | number | undefined;
};
export type FlatToken = {
    id: TokenId;
    type: string;
    value: TokenValue;
    raw: TokenValue;
    refs: TokenId[];
};
export type FlattenResult = {
    flat: Record<TokenId, FlatToken>;
    edges: Array<[from: TokenId, to: TokenId]>;
};
export declare function flattenTokens(root: TokenNode): FlattenResult;
//# sourceMappingURL=flatten.d.ts.map