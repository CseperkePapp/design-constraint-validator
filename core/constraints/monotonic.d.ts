import type { ConstraintPlugin } from "../engine.js";
import type { Order } from "../poset.js";
export declare function MonotonicPlugin(orders: Order[], parse: (v: unknown) => number | null, ruleId?: string): ConstraintPlugin;
export declare const parseSize: (v: unknown) => number | null;
export declare const parseNumber: (v: unknown) => number | null;
export declare const parseLightness: (v: unknown) => number | null;
//# sourceMappingURL=monotonic.d.ts.map