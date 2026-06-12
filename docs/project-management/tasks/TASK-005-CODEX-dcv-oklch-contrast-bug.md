# Task 005 CODEX: DCV — fix OKLCH→sRGB conversion (contrast is wrong for OKLCH inputs)

**Status:** in-progress
**Priority:** P1
**Created:** 2026-06-11
**Effort:** M
**Dependencies:** none
**Phase:** DCV v2.1.0
**Branch:** `task/005-oklch-contrast-bug`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

`parseCssColor()` mis-converts `oklch(…)` strings to sRGB (resolving them too dark), so WCAG contrast is dramatically under-reported for OKLCH inputs and passing themes get flagged as failures. Fix the OKLCH→sRGB path in `core/color.ts` and add the OKLCH test coverage that would have caught it.

**Severity:** High for any OKLCH consumer (DecisionThemes emits **only** OKLCH).
**Found:** 2026-06-11, empirically, while validating DecisionThemes themes. **Separate bug** from TASK-004 (that one is `--tokens`/README; this one is colour math); rides in v2.1.0 alongside it.

---

## The bug

`parseCssColor()` (in `core/color.ts`) mis-converts `oklch(…)` strings to sRGB. The downstream WCAG
formula is fine — it's being fed wrong sRGB. Result: **contrast is dramatically under-reported for OKLCH**,
so passing themes get flagged as WCAG failures.

### Reproduction (DCV's own functions)

```ts
import { parseCssColor, relativeLuminance, contrastRatio } from 'design-constraint-validator/core/color.js';

// hex is correct:
parseCssColor('#888888')          // { r:136, g:136, b:136, a:1 }  relLum 0.246  ✅
parseCssColor('#ffffff')          // { r:255, ... }                relLum 1.0    ✅

// OKLCH is wrong:
parseCssColor('oklch(0.67 0.09 195)') // { r:15.5, g:97.9, b:97.6 } relLum 0.097  ❌
//   a medium-LIGHT teal (L=0.67) resolves as if it were dark (~L 0.45); luminance should be ~0.35.

// near-black text on that teal:
//   DCV reports contrast 2.96:1  —  true value (correct OKLCH→sRGB) is 7.20:1.
```

The RGB scale is 0–255 (consistent — `#ffffff`→255→relLum 1.0), so scale isn't the issue. The OKLCH→sRGB
**values** are wrong (too dark). A correct reference (DecisionThemes' `color-contrast.ts`:
`oklchToRgb`/`relativeLuminance`/`wcagContrast`) gives 7.20:1 for the same pair, matching visual reality
(dark-on-light = high contrast).

## Why it was never caught

Every test/example/audit case uses **hex** (`#888888`, `#999999` in `test/clean-room.test.ts` per the other
task). OKLCH was never exercised. The audit's "OKLCH→sRGB matrices are correct" claim was not actually tested
against OKLCH input.

## Scope

1. **Fix `parseCssColor`'s OKLCH path** (or the OKLab→linear-sRGB step it calls) in `core/color.ts` so an
   `oklch(L C H)` string converts to correct sRGB. Cross-check against a reference implementation — e.g.
   `culori`, or DecisionThemes `color-contrast.ts` (`oklchToRgb`) which is verified. L=0.67 teal should land
   near `rgb(60, 175, 175)` on the 0–255 scale (luminance ~0.35), not `rgb(15, 98, 98)`.
2. **Add OKLCH test coverage** — the gap that hid this. At minimum: a known OKLCH→sRGB vector, and a
   dark-OKLCH-on-light-OKLCH contrast case asserted ≥ its true ratio (not the broken one). Mirror the
   existing hex contrast tests with OKLCH equivalents.
3. **Handle `oklch(… / alpha)`** correctly too (DT can emit alpha; compositing already exists, just ensure
   the parse feeds it right).
4. **Test both supplied color families at the validator boundary.** Keep the internal contract simple:
   CSS inputs (`#hex`, `rgb[a]()`, `hsl[a]()`, `oklch()`) normalize to gamma-encoded sRGB RGBA channels on
   the 0-255 scale before luminance/contrast. Do not make the validator accept ambiguous raw linear-RGB
   objects. Add validator-level tests that prove:
   - sRGB-style CSS inputs (`#hex` / `rgb[a]()`) still produce the expected contrast behavior.
   - OKLCH CSS inputs produce the corrected contrast behavior for equivalent/known token pairs.

## Acceptance

- [ ] `parseCssColor('oklch(0.67 0.09 195)')` returns sRGB matching a reference (luminance ~0.35, not ~0.10).
- [ ] A dark-OKLCH-on-light-OKLCH pair reports its true contrast (~7:1), not ~3:1.
- [ ] OKLCH test vectors added; hex tests still pass; math otherwise untouched.
- [ ] Validator-level tests cover both supplied input families: sRGB CSS (`#hex` / `rgb[a]()`) and OKLCH CSS,
      with both paths normalizing to encoded sRGB RGBA before contrast.
- [ ] Ride in v2.1.0 alongside the `--tokens`/README work.

## Note for DecisionThemes side

DT has already worked around this **locally** (TASK-145): the dt-core validation pipeline now computes
contrast with its own correct `color-contrast.ts` instead of DCV's contrast plugin. Once DCV's OKLCH is
fixed and released, DT *could* revert to DCV's contrast plugin — but the local path is correct and
self-contained, so there's no urgency. The two are independent.
