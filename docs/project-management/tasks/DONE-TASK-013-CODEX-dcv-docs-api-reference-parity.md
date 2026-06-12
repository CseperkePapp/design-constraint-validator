# Task 013 CODEX: DCV docs API/reference parity

**Status:** done
**Priority:** P1
**Created:** 2026-06-12
**Completed:** 2026-06-12
**Effort:** M
**Dependencies:** TASK-004, TASK-010, TASK-012
**Phase:** Documentation / Release readiness
**Branch:** `task/013-docs-api-reference-parity`

## Source

- agent: human + Codex
- model: GPT-5 Codex

---

## Summary

Bring the public documentation back into parity with the current DCV code before
the v2.1.0 release. The root README and `docs/AI-GUIDE.md` are mostly current
after TASK-004/TASK-010/TASK-012, but deeper reference docs still describe older
or nonexistent APIs.

This is a documentation-only task. Do not change runtime behavior unless a doc
claim exposes a real code bug and the task is explicitly rescheduled as an
implementation task.

---

## Findings To Amend

1. **`docs/API.md` documents a fictional async API.**
   - It shows `await validate({ tokensPath, themesPath })`.
   - Actual API is synchronous: `validate({ tokens, tokensPath, constraints, configPath, constraintsDir, breakpoint })`.
   - Actual return shape is `{ ok, counts, violations, warnings, note? }`.

2. **`docs/API.md` documents stale engine methods and plugin shapes.**
   - It shows `engine.validate()` and constructor-style plugins such as `new MonotonicPlugin(...)`.
   - Actual `Engine` exposes `evaluate(candidates)` and `commit(id, value)`.
   - Existing plugins are factory functions registered through `engine.use(...)`.

3. **`docs/JSON-OUTPUT.md` is close but not exact.**
   - WCAG structured metadata now uses `context.actual` and `context.required`.
   - Some examples still show `expected` or messages that do not match current formatter output.
   - Confirm the documented `nodes`, `edges`, `warnings`, `stats`, and receipt shapes against current CLI JSON output.

4. **AI-facing snippets need a quick second pass after TASK-012.**
   - `docs/AI-GUIDE.md` now documents MCP, but still contains likely-stale setup examples such as `themes/wcag.json` and singular `threshold` instead of actual config-supported `thresholds`.
   - Keep the MCP section from TASK-012, but align adjacent examples with real config and CLI behavior.

5. **Cross-doc consistency should be checked.**
   - Ensure `README.md`, `docs/API.md`, `docs/CLI.md`, `docs/Configuration.md`, `docs/JSON-OUTPUT.md`, `docs/Concepts.md`, and `docs/AI-GUIDE.md` agree on:
     - `validate()` signature and sync behavior.
     - `dcv validate` positional path and `--tokens` behavior.
     - config discovery: `dcv.config.json`, `.dcvrc.json`, and `package.json` `"dcv"`.
     - JSON output fields: `ruleId`, `level`, `message`, `nodes`, `context`, `warnings`, `note`.
     - v2.1.0 not-yet-published caveat where npm-installable behavior is discussed.

---

## Scope

### In Scope

- Rewrite stale sections of `docs/API.md` around the real public API and core API.
- Update `docs/JSON-OUTPUT.md` examples/schema to match current emitted JSON.
- Patch stale snippets in `docs/AI-GUIDE.md` if they still conflict with current behavior.
- Make small consistency edits in `README.md`, `docs/CLI.md`, `docs/Configuration.md`, and `docs/Concepts.md` only where needed.
- Add or update lightweight doc examples using real token/config snippets from tests where possible.

### Out Of Scope

- New MCP tools or runtime features.
- Changing validation semantics.
- Publishing v2.1.0.
- Large docs restructure, wiki migration, or marketing copy refresh.

---

## Acceptance Criteria

- [x] `docs/API.md` no longer documents nonexistent `themesPath`, async `validate()`, `v.kind`, `engine.validate()`, or constructor-style plugin APIs.
- [x] `docs/API.md` includes the real synchronous `validate()` input and result types.
- [x] `docs/JSON-OUTPUT.md` examples match current CLI output, including `context.required` for WCAG contrast metadata.
- [x] `docs/AI-GUIDE.md` examples use real config keys and do not contradict TASK-012's MCP setup.
- [x] Cross-doc grep for stale terms (`themesPath`, `v.kind`, `engine.validate`, singular `threshold`, `expected` for WCAG ratio) has been reviewed and any intentional historical/architecture references are clearly scoped.
- [x] No source/runtime behavior changes.
- [x] `npm run workflow:test` passes.

---

## Verification Notes

- `rg -n -g '!docs/project-management/**' -g '!docs/prior-art/**' -g '!docs/audits/**' 'themes/wcag\.json|await validate\(|themesPath|engine\.validate|new MonotonicPlugin|v\.kind|"threshold"\s*:|\bexpected\b' docs README.md CONFIGURATION.md examples`
  - Result: no active-doc/example stale-term matches.
- `npx tsx .\cli\dcv.ts validate --tokens examples\minimal\tokens.json --config examples\minimal\dcv.config.json --constraints-dir examples\minimal\themes --format json --fail-on off`
  - Result: exit 0, JSON shape includes `ok`, `counts`, `violations`, `stats`, and `dcv`.
- `npx tsx .\cli\dcv.ts validate --tokens examples\tokens-studio\tokens.json --config examples\tokens-studio\dcv.config.json --constraints-dir examples\tokens-studio\themes --format json --fail-on off`
  - Result: exit 0, JSON shape includes `ok`, `counts`, `violations`, `stats`, and `dcv`.
- `npx tsx .\cli\dcv.ts validate --tokens examples\dtcg\figma-export.tokens.json --config examples\dtcg\dcv.config.json --constraints-dir __none__ --format json --fail-on off`
  - Result: exit 0 due `--fail-on off`; output intentionally reports DTCG fixture violations/warnings, including WCAG `context.actual` and `context.required`.
- `npm run workflow:test`
  - Result: 2 test files passed, 19 tests passed.

Full `npm run check` was not run because this task changed documentation and examples only, with no source/runtime code changes.
