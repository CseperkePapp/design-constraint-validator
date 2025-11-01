import type { ConstraintPlugin } from "../engine.js";
export declare function parseLightness(v: unknown): number | null;
export type Order = [string, "<=" | ">=", string];
export declare function MonotonicLightness(orders: Order[]): ConstraintPlugin;
//# sourceMappingURL=monotonic-lightness.d.ts.map