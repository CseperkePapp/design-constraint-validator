# Prompt: Test and Merge Task 004

**Task:** [TASK-004](../tasks/TASK-004-CLAUDE-dcv-fix-tokens-flag-and-readme.md)
**Status:** in-progress (code + README merged; v2.1.0 publish pending)
**Branch:** `task/004-fix-tokens-flag-and-readme`
**Merged:** 2026-06-12 → `main` (merge commit `d136e2b`, `--no-ff`)

## Source

- agent: Claude
- model: claude-opus-4-8

---

## Pre-Merge Checklist

### 1. Build Verification

Verified on `task/004-fix-tokens-flag-and-readme` in isolation (stale
cross-branch artifacts cleaned first):

```bash
npm run build          # tsc → exit 0
npm test               # 10 files, 74 passed, 2 skipped
npm run workflow:test  # 19 passed
npm run lint           # exit 0
```

- [x] Clean build passes
- [x] Test suite green (74 passed, 2 skipped — includes the new clean-room test)
- [x] Workflow integrity + lint green

### 2. Manual Testing (clean-room, outside the repo tree)

Every README command and code sample was run literally in a fresh `mktemp` dir
with a user `tokens.json` + auto-discovered `dcv.config.json`:

- [x] `dcv validate tokens.json --summary table` → reports the contrast
      violation, exit code `1`
- [x] `dcv validate tokens.json --format json` → `ok:false`, `counts.violations:1`
- [x] `dcv why color.text --tokens tokens.json --format table` → exit `0`
- [x] `dcv graph --tokens tokens.json --format mermaid` → exit `0`
- [x] nonexistent tokens path → non-zero exit + `Tokens file not found`
- [x] Programmatic `validate({ tokensPath, configPath })` (sync) → `ok:false`,
      `violations[].ruleId` / `.message` as documented

### 3. Documentation Verification

- [x] README Quick Start + Programmatic API rewritten to be runnable as written
- [x] No README reference to a nonexistent export remains
- [x] `CHANGELOG.md` 2.1.0 entry added
- [x] Linked docs (`docs/API.md` etc.) exist

### 4. Task Status

- [ ] Status: done — **still in-progress.** The only open acceptance criterion is
      `v2.1.0 published to npm`, which is gated on TASK-006 (publish pipeline) and
      is an outward-facing action. Version is bumped to `2.1.0` and the changelog
      is written; `npm publish` is intentionally deferred.

---

## Merge to Main

```bash
git checkout main
git merge --no-ff task/004-fix-tokens-flag-and-readme   # → merge commit d136e2b
```

Post-merge verification on `main`:

- [x] `npm run build` → exit 0
- [x] `npm test` → 74 passed, 2 skipped
- [x] `npm pack --dry-run` → 191 files, ~104 kB, version 2.1.0

---

## Post-Merge

- [x] Main builds clean at 2.1.0
- [ ] **Not tagged / not published.** Tag `v2.1.0` and `npm publish` only after
      TASK-006 lands the publish pipeline. Do not ship from this merge alone.
- [ ] **Not pushed.** `main` carries 007 + 001 + 004 locally; pushing to
      `origin/main` is a separate explicit step.

### Stacking note

`task/004` was the last branch in the 007 → 001 → 004 stack; all three are now
merged to `main`. No remaining stacked branches.
