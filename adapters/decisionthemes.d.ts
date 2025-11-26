/**
 * DecisionThemes Adapter (Placeholder)
 *
 * This adapter will integrate with the DecisionThemes framework (coming 2026).
 * It transforms VT (Value Themes) + DT (Decision Themes) into flat tokens for DCV validation.
 *
 * @see https://www.decisionthemes.com
 * @see docs/Adapters.md for implementation details
 *
 * @example
 * ```typescript
 * import { decisionthemesAdapter } from './adapters/decisionthemes.js';
 *
 * const { tokens, policy } = decisionthemesAdapter({
 *   vt: { ... }, // Value Themes (raw values)
 *   dt: { ... }  // Decision Themes (formulas)
 * });
 *
 * // tokens = flat token object for DCV validation
 * // policy = auto-generated constraints from 5-axis model
 * ```
 */
export interface VT {
    [key: string]: any;
}
export interface DT {
    [key: string]: any;
}
export interface DecisionThemesInput {
    vt: VT;
    dt: DT;
}
export interface DecisionThemesOutput {
    tokens: Record<string, any>;
    policy?: string;
}
/**
 * Transform DecisionThemes (VT+DT) into DCV-compatible tokens
 *
 * @param input - VT (values) + DT (decisions)
 * @returns Flat tokens + optional policy JSON
 */
export declare function decisionthemesAdapter(_input: DecisionThemesInput): DecisionThemesOutput;
//# sourceMappingURL=decisionthemes.d.ts.map