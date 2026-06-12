# Task 004 CLAUDE: DCV v2.1.0 — Make the published package actually usable (fix `--tokens`, README parity, boundary test)

**Status:** in-progress
**Priority:** P1
**Created:** 2026-06-11
**Effort:** L
**Dependencies:** TASK-006, TASK-007
**Phase:** DCV v2.1.0
**Branch:** `task/004-fix-tokens-flag-and-readme`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Fix the broken user-facing seams in the published package so a stranger in an **empty directory** — with only `npm i -D design-constraint-validator` and the README — can validate **their own tokens file** with **their own constraints** and get correct violations and exit codes, then release as v2.1.0.

**Definition of done (the only one that counts):** the sentence above. Every fix in scope serves it.

**Audit basis:** independent code audit + empirical run, 2026-06-11 (all file:line references verified against the working tree at tag v2.0.2). The engine math (`core/color.ts`, `core/constraints/*`) was independently verified correct and is out of bounds for this task.

**Sequencing:** TASK-007 (repo hygiene) ideally lands first; TASK-006 (release pipeline) must land before this task's v2.1.0 publish.

---

## Context — what the audit found

The core engine is correct and tested: exact WCAG relative luminance (proper sRGB linearization), reference OKLCH→sRGB matrices, Porter-Duff alpha compositing in linear light, working poset/graph machinery, 22 passing tests, correct exit codes (`1` on violations, `0` with `--fail-on off`). **Do not touch the math in `core/color.ts` or `core/constraints/*`.**

The user-facing seams are broken in published v2.0.1 (and in the v2.0.2 tag, which was committed but **never published** — npm `latest` is still 2.0.1):

1. **`--tokens` is silently ignored.** `cli/commands/validate.ts:59` calls `loadTokensWithBreakpoint(bp)` with no path — it always loads the repo-default tokens (`tokens/tokens.example.json` path convention inside `core/breakpoints.ts`). The parsed `_options.tokens` value is consumed **only** at `validate.ts:132`, where it's written into the validation *receipt* — so receipts record a file that was never validated. Empirically confirmed: `dcv validate --tokens examples/failing/contrast-fail.tokens.json` reports violations for `color.role.focus.ring` / `control.size.min`, tokens that exist only in the default set.
2. **Same bare call elsewhere:** `cli/commands/build.ts:10–11` and `cli/commands/graph.ts:71` also call `loadTokensWithBreakpoint()` without a path.
3. **README Quick Start is wrong:** `npx dcv validate ./tokens/tokens.json` uses a positional argument the CLI rejects ("Unknown arguments"). Also `npx dcv why --format table` fails — `why` requires a `<tokenId>` positional.
4. **README API example is fictional:** `import { validate } from 'design-constraint-validator'` — no such export. `core/index.ts` exports `Engine`, plugin factories, and types only. There is no `tokensPath`/`policyPath` anywhere in core.
5. **The missing test that allowed all of this:** `test/cli.test.ts` covers happy paths against the repo's own default tokens only. No test passes a custom tokens file. (`test/engine.test.ts` is a deprecated noop — consider deleting it.)

---

## Scope

### In scope

**A. Thread the tokens path end-to-end.**
- Extend `loadTokensWithBreakpoint` (in `core/breakpoints.ts`) with an optional explicit tokens-file path parameter (keep current default behavior when omitted).
- `validate.ts`: pass `_options.tokens` through; the receipt at :132 then records the file that was genuinely validated.
- `build.ts` and `graph.ts`: accept and thread a `--tokens` option the same way (check their yargs builders; add the option if missing).
- Add positional support to `validate` (`dcv validate [tokens]`) as an alias for `--tokens`, so the README's natural form works. Positional and flag must not conflict; if both given, flag wins, warn on mismatch.
- Error explicitly (non-zero exit, clear message) when the resolved tokens path does not exist — currently unknown behavior; verify and pin with a test.

**B. Investigate and fix external constraint configuration (likely the deeper half of the bug).**
The violations in the empirical run came from constraints configured somewhere in the repo (`cli/config.ts`, `cli/constraint-registry.ts`, `cli/cross-axis-loader.ts` — there was **no `dcv.config.*` at root**, so discover the actual mechanism first). Determine: *how does an external user supply their own contrast pairs / monotonic orders / thresholds?* If a config-file mechanism exists, document it in the README with a complete minimal example. If it does not exist for external use, add the minimal version (a `dcv.config.json` discovered from cwd, or `--config <path>`), because without it, fixing `--tokens` still doesn't make the tool usable on foreign tokens. Keep it minimal — no plugin API expansion.

**C. Make the README true.**
- Quick Start: working commands only — verify each one by literally running it in a clean temp directory before committing.
- `why` example: include the required `<tokenId>`.
- Programmatic section: either (preferred) implement a small real `validate()` convenience wrapper in core — `validate({ tokens | tokensPath, constraints | configPath }) → { ok, violations, warnings }` — reusing the CLI's existing loading/registry machinery, exported from `core/index.ts`; **or** (fallback if the wrapper drags past ~an hour) rewrite the section to show genuine `Engine` + plugin usage. Do not leave a documented API that doesn't exist.

**D. The boundary test (the test that would have caught everything).**
New test file, e.g. `test/clean-room.test.ts`:
- Create a temp directory **outside** the repo tree (`fs.mkdtemp` in os tmpdir).
- Write a custom tokens file with token ids that do NOT exist in the repo defaults (e.g. `myapp.color.text` = `#888888`, `myapp.color.bg` = `#999999` — ratio ≈ 1.3:1, unambiguously failing) and a passing pair as control.
- Write the minimal constraint config from (B) defining one wcag-contrast pair (min 4.5) over those ids.
- Run the CLI (`node cli/index.js validate --tokens <file> ...` with cwd = temp dir) and assert: exit code ≠ 0; output mentions `myapp.color.text` (proves the custom file was read); the receipt (if `--receipt` used) references the custom file path.
- Second case: positional form produces the same result. Third case: nonexistent path → non-zero exit + clear error.

**E. Release as v2.1.0** (semver: new `validate()` export and/or new config option = minor). Note the unpublished 2.0.2 changes ride along — review `git log v2.0.1..v2.0.2` (Shai-Hulud supply-chain CI hardening, release notes) for anything that needs README mention. `prepublishOnly` already runs `check` (typecheck + lint + test). Update CHANGELOG via the existing `npm run changelog` convention.

### Out of scope

Named CSS colors in the parser, gamut-mapping improvements, new constraint types, VS Code extension, the `dcv-mcp` server (separate task, gated on this one), DecisionThemes-side changes, monorepo/docs restructuring.

---

## Gotchas (read before editing)

1. **Compiled `.js` is committed next to `.ts`** (`cli/*.js`, `core/*.js` exist in-tree, and the CLI runs the `.js`). After every `.ts` edit, run `npm run build` or your changes silently don't execute. Verify by adding a temporary `console.error` marker once if unsure. Consider whether `check` should assert build freshness — optional, don't gold-plate.
2. **ESM throughout** (`"type": "module"`, Node ≥18). Import specifiers in core use `.js` extensions — keep that convention.
3. **Windows dev environment.** Use `path.join`/`pathToFileURL` correctly in the new test; no hardcoded `/tmp`.
4. **`candidates` parameter in plugins:** the engine supports incremental validation via a candidates set; when validating a fresh external file, all tokens must be candidates. Check how `validate.ts` builds the set — a fresh-file validation that accidentally passes an empty candidates set would skip every check while still printing "ok". Pin this with the boundary test's failing assertion.
5. **Receipts are an audit-trail feature** — after the fix, add the receipt-path assertion (D) so the metadata can never silently lie again.

## Suggested execution order

1. Read `cli/commands/validate.ts`, `core/breakpoints.ts`, `cli/config.ts`, `cli/constraint-registry.ts` fully (≈600 lines total) — settle question (B) before writing anything.
2. Implement (A), build, manually reproduce the fix: the `examples/failing/*` files should now produce *different* output per file (or honest "unparseable/no constraints" results — decide what correct behavior is for token files with no matching constraint config, and make it a clear message rather than silence).
3. Implement (B) minimal config path, then (D) clean-room test — red → green.
4. (C) README, verifying every command by execution.
5. (E) version, changelog, publish.

## Acceptance criteria

- [x] Clean-room test passes: custom tokens + custom constraints in a temp dir, violations reported with custom ids, correct exit codes, receipt references the real file.
- [x] `dcv validate --tokens <file>` and `dcv validate <file>` both work; missing file → clear error, non-zero exit.
- [x] `build` and `graph` accept `--tokens` consistently.
- [x] Every command and code sample in README executes successfully as written, confirmed by running each in a clean directory.
- [x] No README reference to a nonexistent export remains.
- [x] All existing tests still pass; math files untouched.
- [ ] v2.1.0 published to npm. *(version bumped to 2.1.0 and CHANGELOG updated; `npm publish` pending — outward-facing, gated on TASK-006 publish pipeline.)*

---

*Origin: distribution-checklist gate 0.0 — DCV promotion (token-tool lists, DTCG visibility, dcv-mcp) is blocked until this lands. The engine math was independently verified correct on 2026-06-11; this task is purely about the seams between that engine and its users.*
