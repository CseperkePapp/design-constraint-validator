# Prompt: Test and Merge Task 011

**Task:** [DONE-TASK-011](../tasks/DONE-TASK-011-CODEX-dcv-system-code-review-remediation.md)
**Status:** done
**Branch:** `task/011-system-code-review-remediation`
**Merged:** 2026-06-12 → `main` (merge commit, `--no-ff`)

## Source

- implementation: Codex (GPT-5.3-Codex), from its 2026-06-12 review
- verification + landing: Claude (claude-opus-4-8)

---

## Coordination context

Codex ran a read-only review, filed its findings as TASK-011, **and implemented
the remediation in the working tree** (uncommitted). Claude independently fixed
the two most urgent items first (CI build order → TASK-007; release-doc
reconciliation → TASK-006), then verified Codex's full implementation and landed
it. No re-implementation; the code changes are Codex's, validated before commit.

## Verification (before landing)

- [x] `npm run build` → exit 0
- [x] `npm test` → 11 files, 71 passed, 1 skipped (compiled `**/*.test.js` now
      excluded, so counts are no longer doubled)
- [x] `npm run lint` → exit 0
- [x] `npm run workflow:test` → 19 passed
- [x] `test/flatten.test.ts` alias-regex regressions → 3 passed
- [x] Code diffs reviewed file-by-file and matched TASK-011's documented scope

## What landed

- **Alias/ref parser** — escape ref IDs in replacement regex (no over-match);
  `_` allowed in `REF_RE`; `FlatToken.raw` preserves the original `$value`.
- **CLI/config** — `--config` registered; JSON-only config (`.js` rejected with a
  clear error); `package.json` basename fix; `backdrop` added to WCAG schema.
- **Release/CI** — CI builds before test; `check` builds before test;
  `prepublishOnly` clean-checkout safe; `release-reminder.yml` removed; RELEASE.md
  reconciled to the tag-push flow.
- **Workflow CI** — SHA-pinned actions + `npm ci --ignore-scripts`.
- **Cleanup** — dead `graph diff` intercept removed; Windows `dot.exe` discovery.

## Post-merge

`main`: build exit 0, 71 passed / 1 skipped. No publish, no tag. `main` stays
local per the owner's preference.
