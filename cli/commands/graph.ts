import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import type { GraphOptions } from '../types.js';
import { flattenTokens, type FlatToken } from '../../core/flatten.js';
import { exportGraphImage } from '../../core/image-export.js';
import { setupConstraints } from '../constraint-registry.js';
import { loadConfig } from '../config.js';

// Local helper for non-poset dependency graphs
function generateDependencyGraph(edges: Array<[string, string]>, format: string): string {
  switch (format) {
    case 'dot': {
      const dotNodes = new Set<string>(); edges.forEach(([f,t]) => { dotNodes.add(f); dotNodes.add(t); });
      let dot = 'digraph tokens {\n  rankdir=LR;\n  node [shape=box, style=rounded];\n\n';
      dotNodes.forEach(n => { dot += `  "${n}";\n`; });
      dot += '\n'; edges.forEach(([f,t]) => { dot += `  "${f}" -> "${t}";\n`; });
      return dot + '}\n'; }
    case 'mermaid': {
      let mermaid = 'graph LR\n'; const mermaidNodes = new Set<string>();
      edges.forEach(([from,to]) => { const fromId = from.replace(/[^a-zA-Z0-9]/g,'_'); const toId = to.replace(/[^a-zA-Z0-9]/g,'_');
        if (!mermaidNodes.has(fromId)) { mermaid += `  ${fromId}["${from}"]\n`; mermaidNodes.add(fromId); }
        if (!mermaidNodes.has(toId)) { mermaid += `  ${toId}["${to}"]\n`; mermaidNodes.add(toId); }
        mermaid += `  ${fromId} --> ${toId}\n`; });
      return mermaid; }
    case 'json':
    default: return JSON.stringify({ nodes: Array.from(new Set(edges.flat())), edges }, null, 2);
  }
}

export async function graphCommand(options: GraphOptions): Promise<void> {
  const { parseBreakpoints } = await import('../../core/breakpoints.js');
  const bps = parseBreakpoints(process.argv);
  const plan = bps.length ? bps : [undefined];
  if (options.hasse) {
    const name = options.hasse;
  const bundle = (options as any).bundle;
  const fmt = (options.format === 'json' ? 'mermaid' : options.format) as 'mermaid' | 'dot' | 'svg' | 'png';
    const imageFrom = options.imageFrom || 'mermaid';
    const filterPrefixes = options.filterPrefix ? options.filterPrefix.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const excludePrefixes = options.excludePrefix ? options.excludePrefix.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const onlyViolations = options.onlyViolations || false;
    const highlightViolations = options.highlightViolations || false;
    const violationColor = options.violationColor || '#ff2d55';
    const labelViolations = options.labelViolations || false;
    const labelTruncate = Math.max(0, options.labelTruncate || 0);
    const minSeverity = options.minSeverity || 'warn';
    const focus = options.focus; const radius = Math.max(0, options.radius || 1);
    for (const breakpoint of plan) {
      const suffixParts: string[] = [];
      if (breakpoint) suffixParts.push(breakpoint);
      if (filterPrefixes.length) suffixParts.push(filterPrefixes.join('_'));
      if (excludePrefixes.length) suffixParts.push('not-' + excludePrefixes.join('_'));
      if (focus) suffixParts.push(`focus-${focus.replace(/[^\w.*-]/g,'_')}-r${radius}`);
      if (onlyViolations) suffixParts.push('violations'); else if (highlightViolations) suffixParts.push('highlight-violations');
      if (labelViolations) suffixParts.push('labeled');
      const suffix = suffixParts.length ? '-' + suffixParts.map(s=>s.replace(/[^\w.-]/g,'_')).join('__') : '';
      const baseFmt = fmt === 'svg' || fmt === 'png' ? (imageFrom === 'dot' ? 'dot' : 'mermaid') : fmt;
      const ext = baseFmt === 'mermaid' ? 'mmd' : 'dot';
      const outDir = 'dist/graphs'; const baseFile = `${outDir}/${name}${suffix}-hasse.${ext}`;
      try {
        const src = `themes/${name}.order.json`;
        if (!existsSync(src)) { console.error(`❌ Order constraint file not found: ${src}`); process.exit(1); }
        const { order } = JSON.parse(readFileSync(src, 'utf8'));
        const { buildPoset, transitiveReduction, toMermaidHasseStyled, toDotHasseStyled, filterByPrefix, filterExcludePrefix, khopSubgraph, pickSeedsByPattern } = await import('../../core/poset.js');
        let g = buildPoset(order);
        if (filterPrefixes.length) g = filterByPrefix(g, filterPrefixes);
        if (excludePrefixes.length) g = filterExcludePrefix(g, excludePrefixes);
        let h = transitiveReduction(g);
        if (focus) { const nodes = new Set<string>([...h.keys(), ...Array.from(h.values()).flatMap(s=>[...s])]); const seeds = pickSeedsByPattern(nodes, focus); h = khopSubgraph(h, seeds, radius); }
        let highlight: { nodes: Set<string>; edges: Set<string>; color?: string } | undefined; let edgeLabels: Map<string,string> | undefined;
        if (onlyViolations || highlightViolations || labelViolations) {
          const { loadTokensWithBreakpoint } = await import('../../core/breakpoints.js');
          const tokens = loadTokensWithBreakpoint(breakpoint);
          const { flattenTokens } = await import('../../core/flatten.js');
          const { Engine } = await import('../../core/engine.js');
          const { MonotonicPlugin, parseSize } = await import('../../core/constraints/monotonic.js');
          const { MonotonicLightness } = await import('../../core/constraints/monotonic-lightness.js');

          const { flat, edges: depEdges } = flattenTokens(tokens);
          const init: Record<string, string | number> = {};
          Object.values(flat).forEach((t) => {
            const ft = t as FlatToken;
            init[ft.id] = ft.value;
          });
          const engine = new Engine(init, depEdges);

          const allIdsInHasse = new Set<string>([...h.keys(), ...Array.from(h.values()).flatMap((s) => [...s])]);
          let issues: any[] = [];
          if (name === 'color') {
            const colorOrders = order as [string, '<=' | '>=', string][];
            issues = MonotonicLightness(colorOrders).evaluate(engine, allIdsInHasse);
          } else {
            const numericOrders = order as [string, '<=' | '>=', string][];
            issues = MonotonicPlugin(numericOrders, parseSize, 'monotonic').evaluate(engine, allIdsInHasse);
          }

          // Attach threshold (and any other runtime constraints) respecting config flags
          const cfgRes = loadConfig(undefined);
          if (cfgRes.ok) {
            const config = cfgRes.value;
            const knownIds = new Set(Object.keys(flat as Record<string, FlatToken>));
            setupConstraints(engine, { config, bp: breakpoint }, { knownIds });
            const runtimeIssues = engine.evaluate(allIdsInHasse);
            issues.push(...runtimeIssues);
          }

          const severityRank = { error: 2, warn: 1 } as const;
          const filteredIssues = issues.filter((it) => {
            const level = (it.level as 'warn' | 'error') || 'error';
            return severityRank[level] >= severityRank[minSeverity];
          });
          const edgeViol = new Set<string>();
          const nodeViol = new Set<string>();
          if (labelViolations) edgeLabels = new Map<string, string>();
          for (const it of filteredIssues) {
            if (typeof it.id === 'string' && it.id.includes('|')) {
              const [a, b] = it.id.split('|');
              edgeViol.add(`${a}|${b}`);
              nodeViol.add(a);
              nodeViol.add(b);
              if (labelViolations && edgeLabels) {
                let label = it.message ?? 'violation';
                if (labelTruncate > 0 && label.length > labelTruncate) {
                  label = label.slice(0, labelTruncate - 1) + '…';
                }
                edgeLabels.set(`${a}|${b}`, label);
              }
            } else if (typeof it.id === 'string') {
              nodeViol.add(it.id);
            }
          }
          highlight = { nodes: nodeViol, edges: edgeViol, color: violationColor };
          if (onlyViolations) {
            const pruned: Map<string, Set<string>> = new Map();
            for (const [u, vs] of h) {
              for (const v of vs) {
                if (edgeViol.has(`${u}|${v}`) || nodeViol.has(u) || nodeViol.has(v)) {
                  if (!pruned.has(u)) pruned.set(u, new Set());
                  pruned.get(u)!.add(v);
                  if (!pruned.has(v)) pruned.set(v, new Set());
                }
              }
            }
            h = pruned;
          }
        }
        const bpLabel = breakpoint ? ` @${breakpoint}` : '';
        const title = `${name}${suffix ? ' ' + suffix : ''}${bpLabel} (Hasse)`;
        const mermaidContent = toMermaidHasseStyled(h, { title, highlight, labels: edgeLabels });
        const dotContent = toDotHasseStyled(h, { title, highlight, labels: edgeLabels });
        mkdirSync(outDir, { recursive: true });
        if (bundle) {
          const mFile = baseFile.replace(/\.dot$/,'-bundle.mmd').replace(/\.mmd$/,'-bundle.mmd');
          const dFile = baseFile.replace(/\.mmd$/,'-bundle.dot').replace(/\.dot$/,'-bundle.dot');
          writeFileSync(mFile, mermaidContent);
          writeFileSync(dFile, dotContent);
        }
        const baseContent = baseFmt === 'mermaid' ? mermaidContent : dotContent;
        writeFileSync(baseFile, baseContent);
        if (fmt === 'svg' || fmt === 'png') {
          const imgFile = `${outDir}/${name}${suffix}-hasse.${fmt}`;
          const { ok, hint } = exportGraphImage(baseFile, imgFile, fmt, imageFrom);
          if (ok) console.log(`✓ Wrote ${baseFile} and ${imgFile}`); else console.log(`✓ Wrote ${baseFile} (image export skipped). ${hint}`);
        } else {
          const hasViolations = highlight && (highlight.edges.size > 0 || highlight.nodes.size > 0);
          const message = (onlyViolations || highlightViolations) && !hasViolations ? `✓ Wrote ${baseFile} (no violations in slice)` : `✓ Wrote ${baseFile}`;
          console.log(message);
        }
      } catch (error) { console.error(`❌ Error generating Hasse diagram for ${breakpoint}:`, error); process.exit(1); }
    }
    return; }
  for (const breakpoint of plan) {
    const { loadTokensWithBreakpoint } = await import('../../core/breakpoints.js');
    const tokens = loadTokensWithBreakpoint(breakpoint); const { edges } = flattenTokens(tokens);
    let filteredEdges = edges;
    if (options.filter) { const filterRegex = new RegExp(options.filter); filteredEdges = edges.filter(([from,to]) => filterRegex.test(from) || filterRegex.test(to)); }
    const format = options.format || 'json'; const graph = generateDependencyGraph(filteredEdges, format);
    if (options.output) { const bpSuffix = breakpoint ? `.${breakpoint}` : ''; const outputPath = options.output.replace(/(\.[^.]+)$/ , `${bpSuffix}$1`); writeFileSync(outputPath, graph, 'utf8'); console.log(`Dependency graph written to: ${outputPath}`); }
    else { if (breakpoint) console.log(`\n=== ${breakpoint.toUpperCase()} ===`); console.log(graph); }
  }
}
