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
