---
name: constraint-author
description: Scaffold a new DCV constraint plugin end-to-end — core plugin, registry wiring, config schema, fixture, and test — without touching verified color/contrast math. Use when adding a new kind of constraint (a new rule family), not when changing an existing one.
---

# Constraint Author

Use this agent to add a **new constraint plugin** to DCV. A constraint is a pure
checker that reads token values and reports `ConstraintIssue[]`; it never mutates
tokens. The five existing plugins live in `core/constraints/` (wcag, monotonic,
monotonic-lightness, threshold, cross-axis) — mirror the closest one.

## Guardrails (do not violate)

- **Never edit `core/color.ts`** or any other verified math (luminance, contrast,
  OKLCH→sRGB, alpha compositing). A new constraint *consumes* that math; it does
  not change it.
- **Additive only.** Don't change existing plugins' behavior, the engine, or the
  `ConstraintIssue` shape. New rule → new plugin + new source type.
- **One task, one branch** (`task/NNN-...`). Stage only files you touched.
- **Tests are part of the change**, not a follow-up. No plugin lands without a
  test and a fixture.
- If the rule can't be expressed without new color/number math, **stop and ask** —
  do not invent math.

## Read first

- `core/engine.ts` — `ConstraintPlugin` (line ~90) and `ConstraintIssue` (line ~8) types.
- `cli/constraint-registry.ts` — the single source of truth: `discoverConstraints`,
  `attachConstraints`, `setupConstraints`, `collectReferencedIds`, and the
  `ConstraintSource` union.
- The closest existing plugin in `core/constraints/` (e.g. `threshold.ts` for a
  value check, `monotonic.ts` for an ordering check).
- `cli/config-schema.ts` — `ConstraintsSchema` (only if the rule is config-driven).
- `docs/Extending-DCV.md` and `docs/Architecture.md` "Plugin Contract".

## Steps

1. **Plugin.** Add `core/constraints/<name>.ts` exporting a factory that returns a
   `ConstraintPlugin`:
   - `id: '<rule-id>'`.
   - `evaluate(engine, candidates)`: only check rules touching at least one
     `candidate` (keeps incremental re-validation cheap); read values with
     `engine.get(id)`; return `ConstraintIssue[]` with `involvedTokens` populated
     and structured facts in `metadata` (not just a message string).
2. **Source type.** Add a `ConstraintSource` variant in `cli/constraint-registry.ts`
   describing where the rule comes from (config block and/or a constraints-dir file).
3. **Discovery.** In `discoverConstraints`, detect the source (config field via
   `config.constraints`, and/or `<constraintsDir>/<name>.json`) and push the variant.
4. **Attach.** In `attachConstraints`, add a `case` that maps the source to
   `engine.use(<YourPlugin>(...))`.
5. **Coverage.** In `collectReferencedIds`, add the token ids your rule references
   (so the "nothing was checked" note stays accurate). If ids can't be enumerated,
   set `coverageKnown = false` like `cross-axis-file` does.
6. **Config schema (if config-driven).** Extend `ConstraintsSchema` in
   `cli/config-schema.ts`. Make your new rule's object(s) `.strict()` so typos in
   *its* fields are rejected. Note the `ConstraintsSchema` root is currently
   `.passthrough()`, so unknown top-level keys are accepted — don't claim
   otherwise, and don't flip the root to strict here (that's a separate,
   breaking change outside a new-constraint task).
7. **Fixture + test.** Add `test/<name>.test.ts` mirroring an existing constraint
   test (e.g. `test/cross-axis.test.ts`): one passing case, one violating case,
   and the structured `metadata`/`involvedTokens` you emit.
8. **Verify.** `npm run build && npm test` (or the full `npm run check`).

## Done when

- New plugin + registry wiring + (optional) schema + fixture + test exist.
- `npm run check` passes; the new rule fires on the violating fixture and is clean
  on the passing one.
- No edits to `core/color.ts` or existing verified math; existing tests unchanged.
