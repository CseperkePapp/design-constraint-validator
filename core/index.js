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
    set(id, value) { this.values.set(id, value); }
    get(id) { return this.values.get(id); }
    use(plugin) {
        this.plugins.push(plugin);
        return this;
    }
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
    evaluate(ids) {
        const candidates = new Set(ids);
        const issues = [];
        // Run all registered constraint plugins
        for (const plugin of this.plugins) {
            issues.push(...plugin.evaluate(this, candidates));
        }
        return issues;
    }
    /** Apply a single change and return a batch: affected set + issues + patch */
    commit(id, value) {
        this.set(id, value);
        const A = this.affected(id);
        const issues = this.evaluate([id, ...A]);
        const patch = {};
        patch[id] = value; // include dependents if you compute derived values
        return { affected: Array.from(A), issues, patch };
    }
}
