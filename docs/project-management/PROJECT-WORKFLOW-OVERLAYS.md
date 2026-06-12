# Project Workflow Overlays

**Type:** Canon
**Version:** 1.0.0
**Authority:** canonical
**Verified:** 2026-06-11

---

## Purpose

Document project-specific customizations to the base `ai-project-workflow` template. This file is where _your_ project's conventions live; the template defines the defaults, this file defines the deltas.

**Rule:** If a convention is project-specific (not universal), it belongs here, not in the template's files.

---

## How to Use This File

1. **Copy this file** into your project's `docs/project-management/` directory
2. **Fill in each section** with your project's specific choice
3. **Delete sections that don't apply** (e.g., delete the "In-App Changelog" section if your project doesn't have one)
4. **Add project-specific sections** at the bottom if your project has conventions not covered below
5. **Keep it current** — when your project changes a convention, update this file

This file is explicitly mutable. The template files (`headers/`, `templates/`, etc.) should _not_ be edited in your project — customize via this overlay instead. When the template updates, you can pull the new files cleanly; your customizations stay in this one overlay doc.

---

## Package Manager

The package manager your project uses. Template defaults to generic `<pm>` placeholders; replace with your choice.

**Choice:** `npm`

- [x] `npm`
- `pnpm`
- `yarn`
- `bun`
- N/A (not a Node project)

**Impact:** Anywhere the template says `<pm> install` / `<pm> test` / `<pm> build`, use your choice.

---

## Guardrail Tools

Project-specific guardrail tools that enforce architectural rules (like a custom lint plugin, a schema validator, a constraint checker).

**Your guardrails:**

| Tool | Command | What it enforces |
| ---- | ------- | ---------------- |
| TypeScript + ESLint + Vitest | `npm run check` | Type safety, lint rules, unit tests |
| Workflow header validator | `npm run validate-headers` | Required workflow metadata shape |
| Workflow integrity tests | `npm run workflow:test` | Task index and task/workflow consistency |

If your project has no guardrail tool, delete this section.

**Impact:** Any template command referencing `<guard-tool>` or mentioning "run guard checks" uses your tools.

---

## In-App Changelog

Some projects maintain an in-app changelog (e.g., `src/changelog/vX-Y-Z.md`) separate from the root `CHANGELOG.md`. Most don't.

**Does this project have an in-app changelog?**

- [ ] Yes — location: _(e.g., `src/changelog/vX-Y-Z.md`)_
- [x] No — only root `CHANGELOG.md`

**Impact:** Task closeout checklists only include the in-app changelog step if your project has one.

---

## Canon Doc Metadata Convention

The template supports but does not require `Version:` and `Verified:` or `Last Updated:` metadata fields on Canon documents.

**Does this project require Canon metadata fields?**

- [x] Required — every Canon doc must include Version and Verified
- [ ] Recommended — included when useful, not required
- [ ] Not used — skip these fields entirely

**Impact:** Task closeout checklists include a "update canon metadata" step only if your project requires or recommends it.

---

## Status File Location

The template recommends monthly status files at `docs/project-management/status/YYYY-MM.md`.

**Your project's choice:**

- [ ] Standard: `docs/project-management/status/YYYY-MM.md`
- [ ] Alternative: _(specify path)_
- [x] Not used — status lives in `START-HERE.md` or equivalent

---

## Root Status Doc

Some projects keep a `STATUS.md` at the repo root as a quick-glance status snapshot. Others use a `START-HERE.md`. Some use neither.

**Your project's choice:**

- [ ] Root `STATUS.md` (active)
- [ ] Root `START-HERE.md` (active, replaces STATUS.md)
- [x] Neither — status lives only in monthly files

**Impact:** Task closeout checklists reference the correct doc.

---

## Prompt Authoring

The template supports both task-first execution (prompts are optional) and prompt-first execution (every task has at least one prompt).

**Your project's choice:**

- [x] Task-first — prompts are optional, tasks drive execution directly
- [ ] Prompt-first — tasks define WHAT, prompts define HOW to brief AI
- [ ] Mixed — default task-first, use prompts for complex multi-step work

**Impact:** The `prompts/` folder is either actively used, kept as a historical record, or omitted entirely.

---

## Project-Specific Templates

Your project may have its own extended templates that include project-specific rules (like the template's base rules, your architectural invariants, etc.). These live in your project, _not_ in the template repo.

**Examples:**

- `templates/TEMPLATE-PROMPT-<PROJECT>.md` — prompt template with your project's base rules prepended
- `templates/TEMPLATE-TASK-<FLAVOR>.md` — task template for a specific kind of work

**List your project-specific templates here:**

| Template | Purpose | When to use |
| -------- | ------- | ----------- |
| None currently | N/A | N/A |

If you have none, delete this section.

---

## Manual Testing Checklist

The template's `TEMPLATE-TEST-AND-MERGE.md` has placeholders for manual testing. Fill in your project's specific manual test checklist.

**Your project's manual test surfaces:**

- [x] CLI commands against token + policy fixtures in `examples/`
- [ ] JSON output contract checks for all adapters
- [ ] Optional demo integration checks against `designLab-DEMO`

---

## AI Model Attribution

The template's commit message templates use `<AI-MODEL>` as a placeholder.

**Your current AI collaborators:**

- GPT-5.3-Codex (Copilot)
- Claude (as needed)

**Preferred commit co-authorship line format:**

```text
Co-Authored-By: <AI-MODEL> <noreply@<provider>.com>
```

### Collaboration Model

Work is **solo-sequential**: drive one task to merge before starting the next.
**Do not run parallel agent implementation** on concurrent branches or worktrees.

Parallel work caused real integration drift — a branch (`task/005`) cut before
TASK-007 de-committed build artifacts reintroduced `core/color.js` + compiled
test files, requiring a manual artifact-stripping merge (see
`workflows/TEST-AND-MERGE-005-oklch-contrast-bug.md`).

Codex (GPT-5.3-Codex) is still used where its skills are the right fit —
including implementation, and by default for reviews — but it must be
**deliberately scheduled for a specific task**, not run alongside other work.
Bring it in intentionally, let it finish and merge that task, then move on.

---

## Project-Specific Conventions

Any other conventions your project uses that extend the template. Examples:

- File naming conventions
- Test file naming
- Branch naming
- Issue labeling
- Release naming

Add subsections as needed.

### Branch Naming

**One branch per task. Never bundle multiple tasks on a single branch.**

- Branch name: `task/NNN-short-description`, where `NNN` is the task number and
  `short-description` is a kebab-case slug derived from the task title (drop the
  agent tag and the `dcv` prefix). Examples: `task/007-repo-hygiene`,
  `task/004-fix-tokens-flag-and-readme`.
- Base the branch on the latest `main`. If the task's `Dependencies` field names
  another task, stack the branch on that dependency's branch instead, so the
  dependency's commits are available and the two merge to `main` in order.
- Record the branch in the task doc's `**Branch:**` header field (see
  `TEMPLATE-TASK.md`) so the assignment is discoverable without `git`.
- Each task's commits stay on its own branch; the per-task `TEST-AND-MERGE` doc
  governs the merge to `main`.
- The task-tracking docs under `docs/project-management/` are owned by the
  workflow-adoption task (TASK-001). Edits to a _task doc_ (status, `Branch:`
  field, checkboxes) live on the branch that owns the ledger, while each task's
  _code_ lives on its own `task/NNN-…` branch.

> Note: the upstream `TEMPLATE-TEST-AND-MERGE.md` still shows the template
> default prefix `feature/task-NNN-…`. This project uses `task/NNN-…` — this
> overlay is the source of truth for the prefix.

### Workflow Naming

The base template uses these defaults for reusable workflow docs:

- lower-kebab-case filenames such as `release-closeout.md`
- unnumbered workflow files; numbered runs belong in `tasks/`

If your project wants stricter workflow naming or a dedicated `workflows/README.md`, record that here.

---

## Versioning of This Overlay

Track changes to your overlay so you know when your project diverged from template defaults.

| Date | Change | Reason |
| ---- | ------ | ------ |
| 2026-06-11 | Initial overlay | Project adopted ai-project-workflow v1.1.0 |
| 2026-06-12 | Added Branch Naming convention (`task/NNN-…`, one branch per task) | Codify branch-per-task discipline so it is followed |
| 2026-06-12 | Added Collaboration Model (solo-sequential; Codex scheduled, not parallel) | Parallel agent work caused integration drift; make coordination explicit |

---

## Template Version in Use

**Template version:** v1.1.0
**Template source:** <https://github.com/CseperkePapp/ai-project-workflow>
**Last template sync:** 2026-06-11

When you pull template updates, update these fields.
