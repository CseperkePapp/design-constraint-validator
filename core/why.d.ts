import type { FlatToken } from "./flatten.js";
export type WhyReport = {
    id: string;
    value: string | number | undefined;
    raw?: string | number;
    refs?: string[];
    provenance: "base" | "theme" | "override" | "unknown";
    dependsOn: string[];
    dependents: string[];
    chain?: string[];
};
export declare function makeReverseEdges(edges: Array<[string, string]>): Map<string, Set<string>>;
export declare function explain(id: string, flat: Record<string, FlatToken>, edges: Array<[string, string]>, layers?: {
    overrides?: Record<string, unknown>;
    theme?: Record<string, unknown>;
}): WhyReport;
//# sourceMappingURL=why.d.ts.map