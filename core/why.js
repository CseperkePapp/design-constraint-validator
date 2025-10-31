export function makeReverseEdges(edges) {
    const rev = new Map();
    for (const [from, to] of edges) {
        if (!rev.has(to))
            rev.set(to, new Set());
        rev.get(to).add(from);
        if (!rev.has(from))
            rev.set(from, new Set());
    }
    return rev;
}
export function explain(id, flat, edges, layers = {}) {
    const node = flat[id];
    const rev = makeReverseEdges(edges);
    const dependsOn = Array.from(rev.get(id) ?? []);
    const dependents = edges.filter(([from, _to]) => from === id).map(([_, to]) => to);
    const prov = layers.overrides && id in layers.overrides ? "override" :
        layers.theme && id in layers.theme ? "theme" :
            flat[id] ? "base" : "unknown";
    // Try to produce a simple chain if it's a 1→1 alias chain
    const chain = [id];
    let cursor = id;
    let guard = 0;
    while (guard++ < 32) {
        const f = flat[cursor];
        if (!f || !Array.isArray(f.refs) || f.refs.length !== 1)
            break;
        const next = f.refs[0];
        chain.push(next);
        cursor = next;
        const nxt = flat[next];
        if (!nxt || !nxt.refs?.length)
            break;
    }
    return {
        id,
        value: node?.value,
        raw: node?.raw,
        refs: node?.refs,
        provenance: prov,
        dependsOn,
        dependents,
        chain: chain.length > 1 ? chain : undefined
    };
}
