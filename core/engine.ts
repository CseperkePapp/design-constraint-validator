import type { TokenId, TokenValue } from "./flatten.js";

/**
 * Represents a constraint violation.
 *
 * Phase 3C: Enhanced with metadata for tooling and visualization.
 */
export type ConstraintIssue = {
  id: TokenId | string;
  rule: string;            // e.g., "wcag-contrast"
  level: "error" | "warn";
  message: string;
  where?: string;          // optional hint (e.g., "body text on surface")

  /**
   * Token IDs involved in this violation.
   * Useful for filtering, highlighting, and incremental validation.
   *
   * Example: For a WCAG contrast violation between fg and bg tokens,
   * this would be [fgTokenId, bgTokenId].
   */
  involvedTokens?: TokenId[];

  /**
   * Graph edges (reference relationships) involved in this violation.
   * Useful for visualization and "why" explanations.
   *
   * Example: If a token references another that violates a constraint,
   * this captures that reference edge.
   */
  involvedEdges?: Array<[TokenId, TokenId]>;
};

/**
 * Constraint plugin interface.
 *
 * Phase 3C: Documented contract for candidate-based evaluation.
 *
 * ## Candidate Contract
 *
 * Plugins MUST honor the `candidates` set for incremental validation:
 * - Only evaluate constraints that involve at least one candidate token
 * - Return violations where at least one involved token is in candidates
 * - This enables efficient re-validation when tokens change
 *
 * ## Metadata Contract
 *
 * Plugins SHOULD populate `involvedTokens` in returned issues:
 * - List all token IDs that participate in the constraint
 * - This enables filtering, highlighting, and graph visualization
 * - Optional but recommended for better tooling support
 *
 * ## Example Implementation
 *
 * ```ts
 * export function MyPlugin(rules: Rule[]): ConstraintPlugin {
 *   return {
 *     id: "my-plugin",
 *     evaluate(engine, candidates) {
 *       const issues: ConstraintIssue[] = [];
 *       for (const rule of rules) {
 *         // Honor candidates: skip if no involved tokens are candidates
 *         if (!candidates.has(rule.tokenA) && !candidates.has(rule.tokenB)) {
 *           continue;
 *         }
 *         // Check constraint...
 *         if (violated) {
 *           issues.push({
 *             id: `${rule.tokenA}|${rule.tokenB}`,
 *             rule: "my-plugin",
 *             level: "error",
 *             message: "...",
 *             involvedTokens: [rule.tokenA, rule.tokenB], // Metadata
 *           });
 *         }
 *       }
 *       return issues;
 *     }
 *   };
 * }
 * ```
 */
export type ConstraintPlugin = {
  id: string;
  /**
   * Evaluate constraints for a set of candidate tokens.
   *
   * @param engine Engine instance providing token values and graph
   * @param candidates Set of token IDs to evaluate (changed + affected)
   * @returns Array of constraint violations
   */
  evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
};

export type Graph = Map<TokenId, Set<TokenId>>; // id -> dependents

export class Engine {
  private values = new Map<TokenId, TokenValue>();
  private graph: Graph = new Map();
  private plugins: ConstraintPlugin[] = [];

  constructor(initValues: Record<TokenId, TokenValue>, edges: Array<[TokenId, TokenId]>) {
    for (const [k, v] of Object.entries(initValues)) this.values.set(k, v);
    for (const [from, to] of edges) {
      if (!this.graph.has(from)) this.graph.set(from, new Set());
      this.graph.get(from)!.add(to);
      if (!this.graph.has(to)) this.graph.set(to, new Set());
    }
  }

  use(plugin: ConstraintPlugin) { this.plugins.push(plugin); return this; }

  get(id: TokenId): TokenValue | undefined { return this.values.get(id); }
  set(id: TokenId, value: TokenValue) { this.values.set(id, value); }

  /**
   * Get all token IDs in the engine.
   *
   * Phase 3C: Exposed for plugins and adapters.
   * Useful for iterating all tokens or creating a full candidate set.
   *
   * @returns Array of all token IDs
   */
  getAllIds(): TokenId[] {
    return Array.from(this.values.keys());
  }

  /**
   * Get flat token map (ID → value).
   *
   * Phase 3C: Exposed to avoid duplicate flattening in CLI/adapters.
   * Returns a plain object suitable for serialization or adapter use.
   *
   * @returns Record mapping token IDs to their current values
   */
  getFlatTokens(): Record<TokenId, TokenValue> {
    return Object.fromEntries(this.values);
  }

  /** All nodes that depend (directly/indirectly) on start. */
  affected(start: TokenId): Set<TokenId> {
    const seen = new Set<TokenId>();
    const stack = [start];
    while (stack.length) {
      const n = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      for (const d of this.graph.get(n) ?? []) stack.push(d);
    }
    seen.delete(start);
    return seen;
  }

  evaluate(candidates: Set<TokenId>) {
    return this.plugins.flatMap(p => p.evaluate(this, candidates));
  }

  /** Single change -> returns affected set, issues, and a patch you can feed to adapters. */
  commit(id: TokenId, value: TokenValue) {
    this.set(id, value);
    const A = this.affected(id);
    const candidates = new Set<TokenId>([id, ...A]);
    const issues = this.evaluate(candidates);
    const patch: Record<TokenId, TokenValue> = { [id]: value };
    return { affected: [...A], issues, patch };
  }
}
