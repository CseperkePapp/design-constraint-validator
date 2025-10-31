// core/poset.ts
// Simple poset model + transitive reduction (Hasse) + mermaid export.

export type Id = string;
export type Comp = "<=" | ">=";
export type Order = [Id, Comp, Id];

export type Digraph = Map<Id, Set<Id>>; // edges u -> v

// Edge labels for violation messages
export type EdgeLabels = Map<string, string>; // key = "a|b" (raw ids)

// Small escapes so Mermaid/DOT don't choke on special characters
const escMermaid = (s: string) => s.replace(/"/g, '\\"').replace(/\n/g, "\\n");
const escDot = (s: string) => s.replace(/"/g, '\\"').replace(/\n/g, "\\n");

/** Safe ID for Mermaid/DOT node identifiers */
export function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

export type Highlight = {
  nodes?: Set<string>;              // raw token IDs to style
  edges?: Set<string>;              // "a|b" pairs (raw IDs) to style
  color?: string;                   // hex or named (Mermaid & DOT)
};

export function buildPoset(orders: Order[]): Digraph {
  const g: Digraph = new Map();
  const add = (u: Id, v: Id) => {
    if (!g.has(u)) g.set(u, new Set());
    if (!g.has(v)) g.set(v, new Set());
    g.get(u)!.add(v);
  };
  for (const [a, op, b] of orders) {
    if (op === ">=") add(a, b);      // a ≥ b → edge a→b
    else if (op === "<=") add(b, a); // a ≤ b → edge b→a
  }
  return g;
}

export function transitiveReduction(g: Digraph): Digraph {
  // naive but fine for our sizes: remove any edge u->v if a path u->...->v exists without that edge
  const out: Digraph = new Map([...g.entries()].map(([u, set]) => [u, new Set(set)]));
  const nodes = [...g.keys()];
  const hasPath = (src: Id, dst: Id, skipU?: Id, skipV?: Id): boolean => {
    const seen = new Set<Id>(); const stack = [src];
    while (stack.length) {
      const n = stack.pop()!;
      if (n === dst) return true;
      if (seen.has(n)) continue;
      seen.add(n);
      for (const w of g.get(n) ?? []) {
        if (skipU === n && skipV === w) continue;
        stack.push(w);
      }
    }
    return false;
  };
  for (const u of nodes) {
    for (const v of g.get(u) ?? []) {
      if (hasPath(u, v, u, v)) out.get(u)!.delete(v);
    }
  }
  return out;
}

export function toMermaidHasse(gHasse: Digraph, {title = "Poset"} = {}): string {
  const lines = ["flowchart TD", `%% ${title}`];
  for (const [u, vs] of gHasse) {
    for (const v of vs) {
      lines.push(`  "${u}" --> "${v}"`);
    }
  }
  return lines.join("\n");
}

// New: styled Mermaid (ids + labels + classing)
export function toMermaidHasseStyled(
  g: Digraph,
  opts: { title?: string; highlight?: Highlight; labels?: EdgeLabels } = {}
): string {
  const { title = "Poset", highlight, labels } = opts;
  const lines = ["flowchart TD", `%% ${title}`];
  const classes: string[] = [];

  for (const [u, vs] of g) {
    const uId = sanitizeId(u);
    lines.push(`  ${uId}["${u}"]`);
    for (const v of vs) {
      const vId = sanitizeId(v);
      lines.push(`  ${vId}["${v}"]`);
      
      // Add edge with optional label
      const lbl = labels?.get(`${u}|${v}`);
      if (lbl) {
        lines.push(`  ${uId} -- "${escMermaid(lbl)}" --> ${vId}`);
      } else {
        lines.push(`  ${uId} --> ${vId}`);
      }

      if (highlight?.edges?.has(`${u}|${v}`)) {
        // edge styling via linkStyle… we assign after all edges (Mermaid counts links in order)
        // simpler: also mark both nodes; edges get colored via linkStyle below
        classes.push(uId, vId);
      }
    }
  }

  const violNodes = new Set<string>(highlight?.nodes ? [...highlight.nodes].map(sanitizeId) : []);
  classes.forEach(id => violNodes.add(id));
  if (violNodes.size) {
    lines.push(`  classDef viol fill:#ffe6e6,stroke:${highlight?.color ?? "#ff0000"},stroke-width:2px;`);
    lines.push(`  class ${[...violNodes].join(",")} viol;`);
  }

  // Edge coloring: Mermaid lets us style by link index; simpler workaround:
  // Add a class to nodes and rely on thick red node borders (good enough for audit views).

  return lines.join("\n");
}

export function toDotHasse(
  gHasse: Digraph, 
  opts: { title?: string; labels?: EdgeLabels } = {}
): string {
  const { title = "Poset", labels } = opts;
  const lines = [
    "digraph poset {",
    `  label="${title}";`,
    "  rankdir=TD;",
    "  node [shape=box, style=rounded];",
    ""
  ];
  
  for (const [u, vs] of gHasse) {
    for (const v of vs) {
      const lbl = labels?.get(`${u}|${v}`);
      const labelAttr = lbl ? ` [label="${escDot(lbl)}"]` : "";
      lines.push(`  "${u}" -> "${v}"${labelAttr};`);
    }
  }
  
  lines.push("}");
  return lines.join("\n");
}

// New: styled DOT
export function toDotHasseStyled(
  g: Digraph,
  opts: { title?: string; highlight?: Highlight; labels?: EdgeLabels } = {}
): string {
  const { title = "Poset", highlight, labels } = opts;
  const lines = [
    `digraph G {`,
    `  label="${title}"; labelloc="t"; rankdir=TB; node [shape=box];`
  ];
  const hiColor = highlight?.color ?? "red";

  const hiNodes = highlight?.nodes ?? new Set<string>();
  const hiEdges = highlight?.edges ?? new Set<string>();

  // declare nodes so we can style them
  const declared = new Set<string>();
  for (const [u, vs] of g) {
    if (!declared.has(u)) {
      const style = hiNodes.has(u) ? ` [color="${hiColor}", penwidth=2]` : "";
      lines.push(`  "${u}"${style};`);
      declared.add(u);
    }
    for (const v of vs) {
      if (!declared.has(v)) {
        const style = hiNodes.has(v) ? ` [color="${hiColor}", penwidth=2]` : "";
        lines.push(`  "${v}"${style};`);
        declared.add(v);
      }
      const eKey = `${u}|${v}`;
      const attrs: string[] = [];
      if (hiEdges.has(eKey)) { 
        attrs.push(`color="${hiColor}"`, "penwidth=2"); 
      }
      const lbl = labels?.get(eKey);
      if (lbl) { 
        attrs.push(`label="${escDot(lbl)}"`); 
      }
      const attrStr = attrs.length ? ` [${attrs.join(", ")}]` : "";
      lines.push(`  "${u}" -> "${v}"${attrStr};`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

// Utility to validate poset (check for cycles)
export function validatePoset(g: Digraph): { valid: boolean; cycles?: Id[][] } {
  const cycles: Id[][] = [];
  const state = new Map<Id, 'white' | 'gray' | 'black'>();
  
  // Initialize all nodes as white (unvisited)
  for (const node of g.keys()) {
    state.set(node, 'white');
  }
  
  const dfs = (node: Id, path: Id[]): boolean => {
    if (state.get(node) === 'gray') {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      cycles.push([...path.slice(cycleStart), node]);
      return true;
    }
    
    if (state.get(node) === 'black') {
      return false; // Already processed
    }
    
    state.set(node, 'gray');
    path.push(node);
    
    let foundCycle = false;
    for (const neighbor of g.get(node) ?? []) {
      if (dfs(neighbor, path)) {
        foundCycle = true;
      }
    }
    
    path.pop();
    state.set(node, 'black');
    return foundCycle;
  };
  
  for (const node of g.keys()) {
    if (state.get(node) === 'white') {
      dfs(node, []);
    }
  }
  
  return { valid: cycles.length === 0, cycles: cycles.length > 0 ? cycles : undefined };
}

export function filterDigraph(
  g: Digraph,
  predicate: (id: string) => boolean
): Digraph {
  const out: Digraph = new Map();
  for (const [u, vs] of g) {
    if (!predicate(u)) continue;
    for (const v of vs) {
      if (!predicate(v)) continue;
      if (!out.has(u)) out.set(u, new Set());
      if (!out.has(v)) out.set(v, new Set());
      out.get(u)!.add(v);
    }
  }
  return out;
}

export function filterByPrefix(g: Digraph, prefixes: string[]): Digraph {
  const norm = prefixes.map(p => (p.endsWith(".") ? p : p + "."));
  const keep = (id: string) =>
    norm.some(p => id === p.slice(0, -1) || id.startsWith(p));
  return filterDigraph(g, keep);
}

export function filterExcludePrefix(g: Digraph, prefixes: string[]): Digraph {
  const norm = prefixes.map(p => (p.endsWith(".") ? p : p + "."));
  const match = (id: string) =>
    norm.some(p => id === p.slice(0, -1) || id.startsWith(p));
  return filterDigraph(g, id => !match(id));
}

export function khopSubgraph(g: Digraph, seeds: Set<string>, k = 1): Digraph {
  // treat edges as undirected for neighborhood; then filter directed edges
  const undirected = new Map<string, Set<string>>();
  const addU = (a: string, b: string) => {
    if (!undirected.has(a)) undirected.set(a, new Set());
    if (!undirected.has(b)) undirected.set(b, new Set());
    undirected.get(a)!.add(b); undirected.get(b)!.add(a);
  };
  for (const [u, vs] of g) for (const v of vs) addU(u, v);

  const keep = new Set<string>(seeds);
  let frontier = new Set<string>(seeds);
  for (let step = 0; step < k; step++) {
    const next = new Set<string>();
    for (const n of frontier) {
      for (const m of undirected.get(n) ?? []) if (!keep.has(m)) { keep.add(m); next.add(m); }
    }
    if (!next.size) break;
    frontier = next;
  }

  const out: Digraph = new Map();
  for (const [u, vs] of g) if (keep.has(u)) {
    for (const v of vs) if (keep.has(v)) {
      if (!out.has(u)) out.set(u, new Set());
      if (!out.has(v)) out.set(v, new Set());
      out.get(u)!.add(v);
    }
  }
  return out;
}

export function pickSeedsByPattern(nodes: Iterable<string>, pattern: string): Set<string> {
  // exact id or prefix with trailing *
  if (pattern.endsWith("*")) {
    const pref = pattern.slice(0, -1);
    return new Set([...nodes].filter(id => id === pref || id.startsWith(pref)));
  }
  return new Set([...nodes].filter(id => id === pattern));
}
