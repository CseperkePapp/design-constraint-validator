import type { ConstraintPlugin } from "../engine.js";
import type { TokenId } from "../flatten.js";
export type ContrastPair = {
    fg: TokenId;
    bg: TokenId;
    min: number;
    where?: string;
    backdrop?: TokenId | string;
};
export declare function WcagContrastPlugin(pairs: ContrastPair[]): ConstraintPlugin;
//# sourceMappingURL=wcag.d.ts.map