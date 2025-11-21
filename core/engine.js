export class Engine {
    values = new Map();
    graph = new Map();
    plugins = [];
    constructor(initValues, edges) {
        for (const [k, v] of Object.entries(initValues))
            this.values.set(k, v);
        for (const [from, to] of edges) {
            if (!this.graph.has(from))
                this.graph.set(from, new Set());
            this.graph.get(from).add(to);
            if (!this.graph.has(to))
                this.graph.set(to, new Set());
        }
    }
    use(plugin) { this.plugins.push(plugin); return this; }
    get(id) { return this.values.get(id); }
    set(id, value) { this.values.set(id, value); }
    /**
     * Get all token IDs in the engine.
     *
     * Phase 3C: Exposed for plugins and adapters.
     * Useful for iterating all tokens or creating a full candidate set.
     *
     * @returns Array of all token IDs
     */
    getAllIds() {
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
    getFlatTokens() {
        return Object.fromEntries(this.values);
    }
    /** All nodes that depend (directly/indirectly) on start. */
    affected(start) {
        const seen = new Set();
        const stack = [start];
        while (stack.length) {
            const n = stack.pop();
            if (seen.has(n))
                continue;
            seen.add(n);
            for (const d of this.graph.get(n) ?? [])
                stack.push(d);
        }
        seen.delete(start);
        return seen;
    }
    evaluate(candidates) {
        return this.plugins.flatMap(p => p.evaluate(this, candidates));
    }
    /** Single change -> returns affected set, issues, and a patch you can feed to adapters. */
    commit(id, value) {
        this.set(id, value);
        const A = this.affected(id);
        const candidates = new Set([id, ...A]);
        const issues = this.evaluate(candidates);
        const patch = { [id]: value };
        return { affected: [...A], issues, patch };
    }
}
