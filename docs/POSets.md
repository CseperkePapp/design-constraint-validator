# Poset Constraints in DCV

DCV uses **partial orders (posets)** for token relationships — not total orders.

## Transitive Closure
Monotonic chains imply transitivity: h1 ≥ h2 ≥ h3 → engine checks h1 ≥ h3 automatically via DAG.

Example order file (`themes/typography.order.json` — discovered by axis name in
the constraints dir):
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.h3"]
  ]
}
```
Order files are auto-discovered from the constraints dir (default `themes/`; use
`--constraints-dir <dir>` for another). With the file above present,
`npx dcv validate tokens.json` flags `h1 < h3` (transitive).

## Anti-Chains
Incomparable elements (e.g., colors in a palette): Use Hasse export to visualize.
npx dcv graph --hasse color --format mermaid → No edges between siblings.

## Join/Meet (Lattice Ops)
Cross-axis approximates: "join" of size/weight = min contrast threshold.
Example: when: { size: "<16px", weight: "<400" }, require: { contrast: ">=7:1" }

## 3D Spaces (Size × Weight × Contrast)
Cross-axis handles incomparables: Some combos valid, others not.
Cross-axis rules (`themes/cross-axis.rules.json`, discovered from the constraints
dir). Each rule has a single `when` guard and a single `require` (matching the
loader and `docs/Constraints.md`):
```json
{
  "rules": [
    {
      "id": "body-weight-vs-size",
      "where": "Body legibility",
      "when": { "id": "typography.weight.body", "op": "<=", "value": 400 },
      "require": { "id": "typography.size.body", "op": ">=", "fallback": "16px" }
    }
  ]
}
```


**CLI demo:** order files are auto-discovered from the constraints dir (default
`themes/`; `--constraints-dir` for a custom one). Point validate at your own
tokens; a file whose typography scale is out of order is flagged transitively:
```bash
npx dcv validate <your-tokens.json> --constraints-dir themes
npx dcv why typography.size.h1 --format table   # explains the implicated order
```

Why: Proves rigor — basic examples → poset power.
