# Task 008 CLAUDE: DCV — DTCG 2025.10 stable-spec compliance (fixture, structured colors, aliases)

**Status:** todo
**Priority:** P2
**Created:** 2026-06-11
**Effort:** M
**Dependencies:** none
**Phase:** DTCG Compliance
**Branch:** `task/008-dtcg-stable-compliance`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Bring DCV's DTCG support up to the **2025.10 stable spec** — structured color objects, structured dimensions, `{alias.path}` references, and `$extensions` passthrough — proven by a real Figma-shaped fixture validated in CI. Investigation-first; fix size depends on findings.

**Sequencing:** independent of TASK-004, but **must land before any DTCG / design-tokens ecosystem listing** (distribution checklist Phase 1) — the listing claim is "DTCG adapter", and this task determines whether that claim is true against the *stable* spec.

---

## Context (verified 2026-06-11)

- `core/flatten.ts:4-5` handles `$type` / `$value` — DTCG *draft-era* syntax support exists in the flattener itself.
- `examples/dtcg/` contains **only a README** — there is no actual DTCG fixture anywhere in the repo, so DTCG support has never been exercised by a test.
- The repo predates the spec's first stable version (DTCG 2025.10, announced 2025-10-28). The stable spec changed the ground under this code: **color tokens are structured objects** (`{ "colorSpace": "srgb", "components": [r,g,b], "alpha": 1, "hex": "#..." }`), not plain CSS strings. Figma now natively exports spec-compliant JSON in this shape.
- DCV's `parseCssColor` (`core/color.ts:38`) accepts **strings only**. If a stable-spec export reaches the WCAG plugin as an object, the plugin emits "Unparseable color(s)" warnings — i.e., a Figma stable export would produce warnings instead of validations, or worse, silently check nothing if pairs don't resolve.
- Alias support: DTCG aliases are `"{color.brand.primary}"` string references. Verify whether `flatten.ts` / the alias-edge machinery (seen working in `graph` output for the internal format) resolves DTCG-style curly-brace references or only the internal alias convention.

## Scope

### Investigate (do first, ~1–2 h)

1. Obtain or construct a **real stable-spec fixture**: export a small variable set from Figma (or use Tokens Studio / the spec's own examples from the DTCG repo) containing: structured color tokens, dimension tokens, at least one alias chain, `$extensions` on one token.
2. Run it through `flatten` → `Engine` → WCAG/monotonic plugins. Document exactly what breaks: structured color values, alias resolution, `$extensions` passthrough, dimension objects (`{ "value": 16, "unit": "px" }` — stable spec also structured dimensions; check `parseSize`).

### Fix (scoped by findings)

3. **Color normalization at the adapter/flatten boundary, not in `parseCssColor`:** convert structured DTCG color objects to the internal string/RGBA representation in one normalization step (prefer the `hex` field when present; else map `colorSpace`+`components` for `srgb`; warn-and-skip for color spaces DCV can't handle, e.g. `display-p3` — do NOT silently treat p3 components as sRGB, that corrupts contrast math).
4. **Dimension normalization:** map structured dimension objects to the numeric values `parseSize`/`parseNumber` expect.
5. **Alias resolution for `{dot.path}` references**, feeding the same edge machinery `why`/`graph` already use.
6. **`$extensions`: preserve, never crash** — DCV doesn't need to understand them, only to not choke (Penpot-style passthrough is the spec's intent).
7. Commit the fixture as `examples/dtcg/figma-export.tokens.json` (or similar) + a test that validates it end-to-end with at least one deliberately failing contrast pair.

### Out of scope

Full spec conformance (composite types like typography/shadow tokens — warn-and-skip is fine), DTCG *export* from DCV, color-space conversion beyond sRGB handling, `$deprecated`/resolver-spec features.

## Acceptance criteria

- [ ] A genuine stable-spec (2025.10) fixture lives in `examples/dtcg/` and is validated in CI.
- [ ] Structured sRGB colors validate with correct WCAG ratios (spot-check one pair by hand).
- [ ] Non-sRGB color spaces produce an explicit warning, never silent wrong math.
- [ ] `{alias.path}` chains resolve; `why` shows the chain for an aliased token.
- [ ] `$extensions` present anywhere causes no error.
- [ ] README's DTCG claim updated to state precisely what is and isn't supported (honest scope beats broad claims — this text becomes the listing description).

## Gotchas

- Compiled `.js` committed in-tree — rebuild after every edit (until the hygiene task removes them).
- The stable spec's color `components` are in the color space's own coordinates; only `srgb` components map 1:1 to the existing math. When in doubt, prefer the `hex` fallback field.
- Keep normalization in ONE place (adapter/flatten boundary) so `core/color.ts` math stays untouched and verified.
