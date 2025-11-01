import type { ConstraintPlugin } from "../engine.js";
export type CrossAxisRule = {
    id: string;
    level?: "error" | "warn";
    where?: string;
    when: {
        id: string;
        test: (v: number) => boolean;
    };
    require: {
        id: string;
        test: (v: number, ctx: Ctx) => boolean;
        msg: (v: number, ctx: Ctx) => string;
    };
} | {
    id: string;
    level?: "error" | "warn";
    where?: string;
    contrast: {
        text: string;
        bg: string;
        min: (bp?: string) => number;
        ratio: (text: string, bg: string, ctx: Ctx) => number;
    };
};
export type Ctx = {
    getPx(id: string): number | null;
    get(id: string): unknown;
    bp?: string;
};
export declare function CrossAxisPlugin(rules: CrossAxisRule[], bp?: string): ConstraintPlugin;
export declare function headingEmphasisRules(heads: string[], bodyId: string, deltaPx?: number): CrossAxisRule[];
//# sourceMappingURL=cross-axis.d.ts.map