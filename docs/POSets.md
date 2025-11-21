# Poset Constraints in DCV

DCV uses **partial orders (posets)** for token relationships — not total orders.

## Transitive Closure
Monotonic chains imply transitivity: h1 ≥ h2 ≥ h3 → engine checks h1 ≥ h3 automatically via DAG.

Example Policy (`policies/poset.json`):
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.h3"]
  ]
}
```` 
npx dcv validate tokens.json --policy poset.json → Flags if h1 < h3.

## Anti-Chains
Incomparable elements (e.g., colors in a palette): Use Hasse export to visualize.
npx dcv graph --hasse color --format mermaid → No edges between siblings.

## Join/Meet (Lattice Ops)
Cross-axis approximates: "join" of size/weight = min contrast threshold.
Example: when: { size: "<16px", weight: "<400" }, require: { contrast: ">=7:1" }

## 3D Spaces (Size × Weight × Contrast)
Cross-axis handles incomparables: Some combos valid, others not.
Policy:
```json
{
  "rules": [
    {
      "id": "readable-text",
      "when": [
        { "id": "typography.size.body", "test": "v < 16" },
        { "id": "typography.weight.body", "test": "v <= 400" }
      ],
      "require": { "id": "contrast.body-on-bg", "test": "v >= 7" }
    }
  ]
}
````


** CLI Demo:** Add to Quick Start:
```bash
# Poset Check
npx dcv validate ./examples/poset-fail.tokens.json --policy poset.json
npx dcv why typography --format table  # Shows transitive violation
````

Why: Proves rigor — basic examples → poset power.
