# Task 009 CLAUDE: DCV — audit the unexamined third: adapters, poset edges, receipt claims

**Status:** todo
**Priority:** P3
**Created:** 2026-06-11
**Effort:** M
**Dependencies:** TASK-004
**Phase:** Audit

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Audit the third of the repo the 2026-06-11 audit skipped — `adapters/`, `core/poset.ts`, the patch/set commands, the receipt feature, and `core/image-export.ts` — boundary-first (not line-by-line), fixing only where findings warrant.

**Sequencing:** after TASK-004 (reuses its clean-room test harness and external-config mechanism). Lowest priority of the DCV series — nothing here blocks listings or the MCP build; it closes the audit coverage gap.

---

## Context

The 2026-06-11 audit verified `core/color.ts` math, the WCAG/monotonic plugins, CLI behavior, and tests — but explicitly did NOT examine: `adapters/` (css, js, json, decisionthemes), `core/poset.ts` (311 lines — the largest core file), `core/patch.ts`, `cli/commands/set.ts` / `patch.ts` / `patch-apply.ts`, `core/image-export.ts`, and the receipt feature's claims. Given the repo's history (engine correct, seams broken), the prior probability is: **adapter/CLI seams have more bugs; core algorithms are probably fine.** Audit accordingly — boundary-first, not line-by-line.

## Scope

### 1. Adapters (highest value)

For each of `adapters/css.ts`, `js.ts`, `json.ts`, `decisionthemes.ts`: what does it claim to consume/produce, and does a round-trip actually work? Write one boundary test per adapter in the clean-room style (real input file → adapter → engine or output → assert known content). Specific suspicions to check:
- `css.ts`: does it parse real-world CSS custom-property files (comments, `:root` + media blocks, fallback values in `var()`)?
- `decisionthemes.ts`: does it still match the *current* DTS EffectiveConfig output shape (the DTS repo has evolved through ~10 releases since this adapter was written — compare against a fresh export from studio.decisionthemes.com)?
- `json.ts` vs the DTCG path: which adapter is the documented entry for which format? README's adapter table (`docs/Adapters.md`) should match reality after this.

### 2. Poset / order machinery (`core/poset.ts`)

`validatePoset` claims cycle detection. Edge-case tests: a 2-cycle (`a>=b`, `b>=a` with unequal values), a longer cycle, contradictory mixed operators, self-reference, disconnected components, and the interaction with `monotonic-lightness` (mixed hex/oklch scales — the audit noted `parseLightness` returns OKLCH perceptual L for oklch strings but gamma-luma for hex, **two different scales in one ordering**; confirm whether a mixed-format scale can produce a false pass/fail and either normalize via the existing correct color pipeline or document the restriction loudly).

### 3. Patch/set commands

`set` dry-run and `patch apply` are covered by happy-path tests. Check: does `patch-apply` validate after applying (or can it write a token file that now violates constraints with exit 0)? Does `set` on an aliased token write to the alias or the source? Define correct behavior, pin with tests.

### 4. Receipt claims

After the fix task makes receipts reference the genuinely validated file: audit the rest of the receipt content against the README/roadmap wording ("Receipts & provenance — hashes, signable reports" is listed as *roadmap*, but `--receipt` exists today). What's actually in a receipt? Is the hash a real content hash of inputs? Make the implemented subset's documentation exact, and keep aspirational parts clearly under Roadmap.

### 5. `core/image-export.ts` (48 lines)

Unknown purpose — read it; if it's dead/experimental, delete or mark experimental. Small.

## Out of scope

New adapter formats, rewriting poset internals absent a failing test, patch-format versioning, performance work (the perf budget flags exist and are untested — note, don't fix).

## Acceptance criteria

- [ ] One passing boundary test per adapter, with findings (bugs fixed or documented limitations) written into `docs/Adapters.md`.
- [ ] Poset edge-case tests green; the mixed hex/oklch lightness-scale question answered with either a normalization fix or an explicit documented restriction + warning.
- [ ] Patch/set semantics defined and pinned (post-apply validation behavior decided deliberately).
- [ ] Receipt documentation matches exactly what receipts contain.
- [ ] `image-export.ts` has a justified existence or is gone.
- [ ] A short findings section appended to this doc: what was sound, what was fixed, what was documented-as-limited — closing the audit loop on the last unexamined third of the repo.
