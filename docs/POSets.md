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
