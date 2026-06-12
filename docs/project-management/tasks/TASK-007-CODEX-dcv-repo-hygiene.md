# Task 007 CODEX: DCV — repo hygiene (remove committed build artifacts + small cleanups)

**Status:** todo
**Priority:** P2
**Created:** 2026-06-11
**Effort:** S
**Dependencies:** none
**Phase:** DCV v2.1.0

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

De-commit the 142 build artifacts (`.js` / `.d.ts` / `.map`) that ship next to their `.ts` sources — the "stale compiled `.js`" gotcha every other DCV task has to warn about — delete the noop test, guard the cross-repo `demo*` scripts, and run a timeboxed dependency-freshness pass.

**Sequencing:** ideally **first** of the DCV series — it removes the stale-`.js` gotcha; if done later the other tasks' warnings simply become obsolete.

---

## Context (verified 2026-06-11)

- **142 build artifacts (`.js`, `.d.ts`, `.map`) are committed to git** alongside their `.ts` sources (`cli/`, `core/`, `adapters/`, `test/`). The CLI bin runs the committed `.js`, so any `.ts` edit without `npm run build` silently executes stale code — this gotcha had to be flagged in three separate task docs.
- `package.json` has a `files` allowlist and `prepublishOnly` runs `check && build`, so **npm publishing does not need artifacts in git.**
- `test/engine.test.ts` is a deprecated noop (`describe('deprecated engine.test') → it('noop')`) inflating the test count.
- npm scripts `demo`, `demo:build` reference `../designLab-DEMO` (a sibling repo cloners don't have); `demo:v2` references `designLab-v2` (verify whether it exists in-tree).
- `zod` pinned `^3.0.0`; yargs `^17`; fast-glob `^3.3.2` — functional, but a freshness pass hasn't happened since ~2025-11.

## Scope

1. **De-commit build artifacts.** Add `*.js`, `*.d.ts`, `*.d.ts.map`, `*.js.map` ignore rules scoped to the source dirs (`cli/`, `core/`, `adapters/`, `test/` — careful: don't ignore intentional JS like config files if any exist; check `eslint`/`prettier` configs first). `git rm --cached` the 142 files, one commit. Verify afterward: fresh clone + `npm install` + `npm run build` + `npm test` + `node cli/index.js --help` all work; `npm pack --dry-run` shows the built files still included via `files` + `prepublishOnly`.
2. **Confirm the `files` allowlist** ships exactly what's needed (built js + d.ts, README, LICENSE, examples?) and nothing odd — read the `npm pack --dry-run` file list once; published 2.0.1 shipped 190 files, sanity-check what they were.
3. Delete `test/engine.test.ts` (noop) and its committed artifacts.
4. Remove or guard the `demo*` scripts that reference repos outside this one (a `[ -d ... ] ||` guard with a clear message, or deletion).
5. **Dependency freshness pass (timeboxed, ~30 min):** `npm outdated`; bump patch/minor only; zod major (v4) ONLY if `npm test` stays green without code changes — otherwise note it and move on. No dependency archaeology.
6. **CI check:** ensure `ci.yml` builds from clean (it must now, since artifacts are gone) — this is the structural guarantee the stale-js class of bug can't return.

## Out of scope

Restructuring directories, monorepo-ization, adding new tooling (no changesets/turbo/etc.), test-coverage expansion (covered by the other task docs' boundary tests), README content (fix task owns it).

## Acceptance criteria

- [x] `git ls-files | grep -E '\.(js|d\.ts|map)$'` returns only intentional files (zero in source dirs; remaining files are `eslint.config.js` and `tokens/tokens.schema.*`).
- [x] Fresh-clone flow verified: install → build → test → CLI runs.
- [x] `npm pack --dry-run` file list reviewed and sane.
- [x] Noop test gone; suite still green (count drops accordingly — update any badge/claim that cites a number).
- [x] No npm script references a path outside the repo without a guard.
- [x] CI green from clean checkout.
