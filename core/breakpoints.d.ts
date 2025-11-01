import type { TokenNode } from "./flatten.js";
export type Breakpoint = "sm" | "md" | "lg";
export declare function parseBreakpoints(argv: string[]): Breakpoint[];
export declare function loadJsonSafe<T = unknown>(path: string): T | null;
export declare function loadOrders(axis: string, bp?: Breakpoint): [string, "<=" | ">=", string][];
export declare function mergeTokens(base: unknown, overlay: unknown): TokenNode;
/** Load tokens with optional breakpoint override: base + overrides/<bp>.json */
/**
 * Load tokens with override precedence: base < local < breakpoint
 */
export declare function loadTokensWithBreakpoint(bp?: Breakpoint): TokenNode;
//# sourceMappingURL=breakpoints.d.ts.map