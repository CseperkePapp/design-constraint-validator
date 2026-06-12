# Prompt: Test and Merge Task 006

**Task:** [TASK-006](../tasks/TASK-006-CODEX-dcv-publish-pipeline.md)
**Status:** in-progress (pipeline fixed + merged; live verification is an owner follow-up)
**Branch:** `task/006-publish-pipeline`
**Merged:** 2026-06-12 → `main` (merge commit `635ff29`, `--no-ff`)

## Source

- agent: Claude
- model: claude-opus-4-8

---

## Pre-Merge Checklist

### 1. Build Verification

```bash
npm run build   # tsc → exit 0
npm test        # 12 files, 84 passed, 2 skipped
npm run lint    # exit 0
npm run workflow:test  # green
```

- [x] Build / test / lint / workflow-integrity green (CI-only change; no code
      paths touched)

### 2. Release-flow Verification (no publish performed)

- [x] `publish.yml` triggers on **`v*` tag push** + `workflow_dispatch` only —
      merging or pushing a branch cannot publish
- [x] `npm publish --dry-run` → packs `design-constraint-validator@2.1.0`,
      191 files (~104 kB) — proves the tarball is well-formed without publishing
- [x] YAML sanity: on-block present, tag+dispatch triggers, registry-verify step
      present

### 3. Documentation Verification

- [x] Root cause written down (CHANGELOG 2.1.0 note + task Resolution section)
- [x] `release:*` scripts reconciled to the single tag-driven flow
- [x] CHANGELOG records 2.0.2 tagged-but-never-published

### 4. Task Status

- [ ] Status: done — **in-progress.** Two acceptance criteria need owner access
      this environment doesn't have (and we are not publishing yet):
      1. **Credentials** — confirm `NPM_TOKEN` is present/unexpired, or migrate to
         npm trusted publishing / OIDC (recommended).
      2. **Live end-to-end proof** — optional `v2.1.0-rc.0` tag → watch the
         Actions run before the real `v2.1.0`.

---

## Merge to Main

```bash
git checkout main
git merge --no-ff task/006-publish-pipeline   # → merge commit 635ff29
```

Post-merge on `main`: build exit 0, 84 passed / 2 skipped. **No tag pushed, no
publish triggered.**

## Post-Merge / Owner follow-up (before the first real release)

- [ ] Verify `NPM_TOKEN` or switch to trusted publishing/OIDC
- [ ] When ready to ship 2.1.0: `npm version` is already at 2.1.0, so push the
      tag (`git tag v2.1.0 && git push --tags`) and watch `publish.yml` build,
      publish, and verify on npm. **Not to be done until you decide to publish.**
