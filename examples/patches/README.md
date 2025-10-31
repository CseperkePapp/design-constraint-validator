# Patch Examples

Curated examples demonstrating override/removal semantics prior to full Patch I/O Phase 2.

## 1. Basic Override Patch

`basic-override.json` changes a single token value.

## 2. Removal Patch

`removal-null.json` demonstrates removal via null value (dependents should be inspected before applying).

## 3. Mixed Patch

`mixed-multi.json` combines additions, modifications, and removals.

Schema note: These are illustrative override maps (engine minimal patch shape: `{ [id]: value|null }`). Formal PatchDocument (with deltas, provenance, hash) will supersede these in Phase 2.
