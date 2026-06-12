# Task 001: Adopt AI Project Workflow In DCV

**Status:** in-progress
**Priority:** P2
**Created:** 2026-06-11
**Updated:** 2026-06-11
**Effort:** M
**Dependencies:** none
**Phase:** Workflow Adoption
**Branch:** `task/001-adopt-ai-project-workflow`

## Source

- agent: human + copilot
- model: GPT-5.3-Codex

---

## Summary

Adopt and operationalize the AI project workflow system in `design-constraint-validator`, including template surfaces, automation scripts, and working usage conventions for ongoing tasks.

---

## Background

The repository previously had no `docs/project-management/` workflow surface. The workflow kernel and automation assets have now been imported and need to be treated as active operating infrastructure.

---

## Scope

### In Scope

- Validate that the workflow structure is correctly installed.
- Configure project-specific overlay conventions.
- Enable hooks and verify automation commands run.
- Establish the first tracked adoption task and task index row.

### Out of Scope

- Retrofitting historical project work into new task files.
- Full policy redesign for every section in the overlay.
- Workflow-specific CI policy changes outside the optional automation workflow.

---

## Acceptance Criteria

- [x] `docs/project-management/` structure is present and aligned to template.
- [x] Workflow automation scripts and tests run in this repository.
- [x] Git hooks path is configured to `.githooks`.
- [x] Overlay decisions are finalized with project-specific values.
- [x] Task index includes this task as an active entry.
- [x] Portable workflow skills are installed under `.github/skills/` and documented for contributors.

---

## Documentation & Versioning Impact

### Always review on closeout

- [ ] This task file (`Status`, `Completed`, completion notes, verification)
- [x] `docs/project-management/tasks/README.md`
- [ ] Your project's status doc (`START-HERE.md`, `STATUS.md`, or whatever your overlay names)

### Update if this task changes them

- [x] Root `package.json` and any affected workspace package versions
- [ ] `CHANGELOG.md`
- [ ] `DECISION-LOG.md`
- [x] Canon/reference docs, including any `Version:` / `Verified:` metadata your project tracks
- [ ] Wiki/contributor docs

---

## Implementation Notes

The workflow kernel lives in `docs/project-management/000-WORKFLOW-SYSTEM/` and should be treated as imported template content. Project-specific conventions belong in `docs/project-management/PROJECT-WORKFLOW-OVERLAYS.md`.

Portable workflow skills are installed in `.github/skills/workflow-investigation/`, `.github/skills/workflow-qa-evidence/`, and `.github/skills/workflow-docs-sync/`. Discoverability notes are in `docs/AI-GUIDE.md`.

---

## Verification Notes

- Automated:
  - `npm run workflow:typecheck`
  - `npm run workflow:test`
  - `npm run validate-headers`
- Manual:
  - Verified `git config core.hooksPath` is set to `.githooks`
  - Verified workflow skill folders exist under `.github/skills/`
- Deferred / Not Run:
  - None

---

## Related

- `docs/project-management/PROJECT-WORKFLOW-OVERLAYS.md`
- `docs/project-management/tasks/README.md`
- `scripts/validate-headers.ts`
