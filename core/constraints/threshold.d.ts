import type { ConstraintPlugin } from "../engine.js";
export type ThresholdRule = {
    id: string;
    op: ">=" | "<=";
    valuePx: number;
    where?: string;
    level?: "error" | "warn";
};
export declare function ThresholdPlugin(rules: ThresholdRule[], ruleId?: string): ConstraintPlugin;
//# sourceMappingURL=threshold.d.ts.map