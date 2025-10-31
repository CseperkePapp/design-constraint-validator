export type TokenId = string; // "dimension.spacing.scale.4"
export type TokenValue = string | number;
export type Graph = Map<TokenId, Set<TokenId>>; // edges: id -> dependents

export type ConstraintIssue = {
  id: TokenId;
  rule: string;          // "wcag-contrast"
  level: "error" | "warn";
  message: string;
};

export type ConstraintPlugin = {
  id: string;
  evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
};

export class Engine {
  private values = new Map<TokenId, TokenValue>();
  private graph: Graph = new Map();
  private plugins: ConstraintPlugin[] = [];

  constructor(initValues: Record<TokenId, TokenValue>, edges: Array<[TokenId, TokenId]>) {
    for (const [k,v] of Object.entries(initValues)) this.values.set(k, v);
    for (const [from,to] of edges) {
      if (!this.graph.has(from)) this.graph.set(from, new Set());
      this.graph.get(from)!.add(to);
      if (!this.graph.has(to)) this.graph.set(to, new Set());
    }
  }

  set(id: TokenId, value: TokenValue) { this.values.set(id, value); }
  get(id: TokenId) { return this.values.get(id); }
  
  use(plugin: ConstraintPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  affected(start: TokenId): Set<TokenId> {
    const seen = new Set<TokenId>(); const stack = [start];
    while (stack.length) {
      const n = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      for (const d of this.graph.get(n) ?? []) stack.push(d);
    }
    seen.delete(start);
    return seen;
  }

  evaluate(ids: Iterable<TokenId>): ConstraintIssue[] {
    const candidates = new Set(ids);
    const issues: ConstraintIssue[] = [];
    
    // Run all registered constraint plugins
    for (const plugin of this.plugins) {
      issues.push(...plugin.evaluate(this, candidates));
    }
    
    return issues;
  }

  /** Apply a single change and return a batch: affected set + issues + patch */
  commit(id: TokenId, value: TokenValue) {
    this.set(id, value);
    const A = this.affected(id);
    const issues = this.evaluate([id, ...A]);
    const patch: Record<TokenId, TokenValue> = {};
    patch[id] = value; // include dependents if you compute derived values
    return { affected: Array.from(A), issues, patch };
  }
}
