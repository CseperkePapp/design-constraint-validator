import type { TokenId, TokenValue } from "./flatten";

export type ConstraintIssue = {
  id: TokenId | string;
  rule: string;            // e.g., "wcag-contrast"
  level: "error" | "warn";
  message: string;
  where?: string;          // optional hint (e.g., "body text on surface")
};

export type ConstraintPlugin = {
  id: string;
  // Called with the set of candidate IDs (changed + affected).
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
