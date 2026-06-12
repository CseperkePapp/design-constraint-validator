# Prompt: Test and Merge Task 013

**Task:** [DONE-TASK-013](../tasks/DONE-TASK-013-CODEX-dcv-docs-api-reference-parity.md)
**Status:** done
**Branch:** `task/013-docs-api-reference-parity`
**Merged:** 2026-06-12 → `main` (`--no-ff`)

## Source

- implementation: Codex (GPT-5.3-Codex)
- verification + landing: Claude (claude-opus-4-8)

## Verification (before landing)

- [x] `npm run build` → exit 0
- [x] `npm test` → 79 passed / 1 skipped (example restructure broke nothing)
- [x] `npm run lint` → exit 0; `npm run workflow:test` → 19 passed
- [x] API.md / JSON-OUTPUT.md spot-checked: real sync `validate({...})` API +
      `ruleId/level/nodes` violation shape
- [x] Restructured examples validate end-to-end (minimal, tokens-studio); the
      minimal WCAG rule confirmed *evaluating* (forced 21:1 → `17.40:1 < 21:1`),
      passes at 4.5:1 because the design is genuinely ~17:1
- [x] No test references the removed `themes/wcag.json`

## What landed

Docs across `docs/*.md` updated to the real implementation (sync API, current
Engine plugin model, current JSON shape, config-backed WCAG/threshold). Examples
moved WCAG config into `dcv.config.json`, removed obsolete `themes/wcag.json`, and
fixed Tokens Studio order files to the tuple format.

Staged Codex's 013 files only; left the untracked `DRAFT-TASK-014/015` and
provenance draft for later pickup. No publish, no tag.
