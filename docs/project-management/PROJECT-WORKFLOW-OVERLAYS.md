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

---

## Project-Specific Conventions

Any other conventions your project uses that extend the template. Examples:

- File naming conventions
- Test file naming
- Branch naming
- Issue labeling
- Release naming

Add subsections as needed.

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

---

## Template Version in Use

**Template version:** v1.1.0
**Template source:** <https://github.com/CseperkePapp/ai-project-workflow>
**Last template sync:** 2026-06-11

When you pull template updates, update these fields.
