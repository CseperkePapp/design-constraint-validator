import type { FlatToken } from "./flatten";

export type WhyReport = {
  id: string;
  value: string | number | undefined;
  raw?: string | number;
  refs?: string[];
  provenance: "base" | "theme" | "override" | "unknown";
  dependsOn: string[];     // immediate refs (parents)
  dependents: string[];    // immediate children
  chain?: string[];        // simple linear chain if raw is a single {ref} repeated
};

export function makeReverseEdges(edges: Array<[string,string]>): Map<string, Set<string>> {
  const rev = new Map<string, Set<string>>();
  for (const [from, to] of edges) {
    if (!rev.has(to)) rev.set(to, new Set());
    rev.get(to)!.add(from);
    if (!rev.has(from)) rev.set(from, new Set());
  }
  return rev;
}

export function explain(
  id: string,
  flat: Record<string, FlatToken>,
  edges: Array<[string,string]>,
  layers: { overrides?: Record<string, unknown>, theme?: Record<string, unknown> } = {}
): WhyReport {
  const node = flat[id];
  const rev = makeReverseEdges(edges);
  const dependsOn = Array.from(rev.get(id) ?? []);
  const dependents = edges.filter(([from, _to]) => from === id).map(([_, to]) => to);

  const prov: WhyReport["provenance"] =
    layers.overrides && id in layers.overrides ? "override" :
    layers.theme     && id in layers.theme     ? "theme"    :
    flat[id] ? "base" : "unknown";

  // Try to produce a simple chain if it's a 1→1 alias chain
  const chain: string[] = [id];
  let cursor = id; let guard = 0;
  while (guard++ < 32) {
    const f = flat[cursor];
    if (!f || !Array.isArray(f.refs) || f.refs.length !== 1) break;
    const next = f.refs[0];
    chain.push(next);
    cursor = next;
    const nxt = flat[next];
    if (!nxt || !nxt.refs?.length) break;
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
