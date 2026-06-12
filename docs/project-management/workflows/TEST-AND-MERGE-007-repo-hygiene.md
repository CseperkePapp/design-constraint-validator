# Prompt: Test and Merge Task 007

**Task:** [DONE-TASK-007](../tasks/DONE-TASK-007-CODEX-dcv-repo-hygiene.md)
**Status:** done
**Branch:** `task/007-repo-hygiene`
**Merged:** 2026-06-12 → `main` (merge commit `0b35e30`, `--no-ff`)

## Source

- agent: Claude
- model: claude-opus-4-8

---

## Pre-Merge Checklist

### 1. Build Verification

Verified on `task/007-repo-hygiene` in isolation (stale cross-branch build
artifacts cleaned first with `git clean -fdX cli core adapters test scripts src`
so the run exercised 007's real state):

```bash
npm run build   # tsc → exit 0
npm test        # 4 files, 20 passed, 2 skipped
```

- [x] Clean build passes (`tsc`, exit 0)
- [x] Test suite green (20 passed, 2 skipped — the 2 skips pre-date this task)
- [x] No guardrail tool regressions

### 2. Manual Testing

DCV is a CLI / library (no UI surface — see `PROJECT-WORKFLOW-OVERLAYS.md`).

- [x] **CLI** — `node cli/index.js --help` lists all commands (build runs the
      freshly compiled output, not committed `.js`)
- [x] **Packaging** — `npm pack --dry-run` still ships the built `.js` + `.d.ts`
      via the `files` allowlist (~190 files); de-committing sources did not break
      the published artifact
- [x] No regressions in related areas

### 3. Documentation Verification

- [x] Task doc complete (`DONE-TASK-007-…`, all acceptance criteria checked)
- [x] `tasks/README.md` index regenerated (`task:sync`); `workflow:test` green
- [ ] `CHANGELOG.md` — deferred to the v2.1.0 release (TASK-004/006); 007 ships
      no user-facing behavior change
- [x] Branch convention recorded in `PROJECT-WORKFLOW-OVERLAYS.md`

### 4. Task Status

- [x] Status: done
- [x] Completed date added (2026-06-12)
- [x] All acceptance criteria checked

---

## Merge to Main

Solo development — merged locally with `--no-ff` to preserve the task boundary:

```bash
git checkout main
git merge --no-ff task/007-repo-hygiene   # → merge commit 0b35e30
```

Post-merge verification on `main`:

- [x] `npm run build` → exit 0
- [x] `npm test` → 20 passed, 2 skipped
- [x] `git ls-files | grep -E '\.(js|d\.ts|map)$'` → only `eslint.config.js` and
      `tokens/tokens.schema.*` remain (zero source-dir artifacts) — the
      structural guarantee that stale-`.js` can't return

---

## Post-Merge

- [x] Main builds clean from the merge commit
- [ ] **Not tagged.** `package.json` carries an interim `2.0.4`; the tagged
      release is `v2.1.0`, gated on TASK-004 (README parity) + TASK-006
      (publish pipeline). Do not tag/publish from this merge alone.
- [ ] **Not pushed.** `main` has the merge locally; push to `origin/main` is a
      separate, explicit step.

### Stacking note

`task/001` and `task/004` are stacked on `865cbb4`, which is now in `main`'s
history via the merge. They remain valid and will merge cleanly in order
(007 → 001 → 004). No rebase required before their own merges.

### Archive

Per the template, a done task may be moved to `docs/project-management/archive/`.
Deferred: the `DONE-TASK-` prefix already satisfies the lifecycle convention and
keeps the task visible in the active index until the v2.1.0 line closes out.
