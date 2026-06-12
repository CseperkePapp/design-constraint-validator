# Task NNN: [Task Name] <!-- optional agent preference: write "# Task NNN CLAUDE: ..." or "# Task NNN CODEX: ..." and mirror it in the filename (TASK-NNN-CLAUDE-name.md). Soft preference only — any agent may still implement it. -->

**Status:** planning | future | todo | in-progress | on-hold | done | blocked | cancelled
**Priority:** P0 | P1 | P2 | P3 | P4
**Created:** YYYY-MM-DD
**Updated:** <!-- YYYY-MM-DD when materially revised; remove if unused -->
**Completed:** <!-- YYYY-MM-DD when done -->
**Parent:** <!-- [TASK-NNN](TASK-NNN-name.md) if this is a subtask; remove if standalone -->
**Effort:** S | M | L | XL | -- <!-- optional; add a short note if needed -->
**Dependencies:** none | TASK-NNN | TASK-NNN, TASK-NNN.N | free text <!-- optional -->
**Phase:** <!-- optional; use when your repo groups tasks into named or numbered phases -->
**Branch:** `task/NNN-short-description` <!-- REQUIRED. Every task is implemented on its own branch — never bundle multiple tasks on one branch. Create from latest `main`, or stack on a dependency's branch when `Dependencies` names one. See PROJECT-WORKFLOW-OVERLAYS.md → "Branch Naming". -->

## Source

- agent: human | Claude | ChatGPT | Gemini | mixed
- model: <!-- model-id or N/A -->

---

## Summary

<!-- Brief description of what this task accomplishes (1-3 sentences) -->

---

## Background

<!-- Context: What exists now? Why is this task needed? -->

---

## Scope

### In Scope

- <!-- What's included -->
- <!-- ... -->

### Out of Scope

- <!-- What's explicitly excluded -->
- <!-- ... -->

---

## Acceptance Criteria

- [ ] <!-- Criterion 1 -->
- [ ] <!-- Criterion 2 -->
- [ ] <!-- Criterion 3 -->

---

## Documentation & Versioning Impact

Plan the closeout surfaces before implementation starts. Remove lines only when they are provably not applicable.

### Always review on closeout

- [ ] This task file (`Status`, `Completed`, completion notes, verification)
- [ ] `docs/project-management/tasks/README.md`
- [ ] Your project's status doc (`START-HERE.md`, `STATUS.md`, or whatever your overlay names — see `PROJECT-WORKFLOW-OVERLAYS.md`)

### Update if this task changes them

- [ ] Root `package.json` and any affected workspace package versions
- [ ] `CHANGELOG.md`
- [ ] `DECISION-LOG.md`
- [ ] Canon/reference docs, including any `Version:` / `Verified:` metadata your project tracks
- [ ] Wiki/contributor docs

### Project-specific closeout steps

<!--
Your project's PROJECT-WORKFLOW-OVERLAYS.md defines additional closeout steps.
Common project-specific steps:
- In-app changelog entries (src/changelog/vX-Y-Z.md)
- Guardrail tool runs
- Export/storage schema version verification
- Project-specific docs updates

Copy the relevant items from your overlay's closeout checklist into this task.
-->

---

## Implementation Notes

<!-- Technical notes, approach suggestions, relevant files -->

---

## Risks To Control

<!-- Optional. Add only when the task has known technical, sequencing, UX, or migration risks. Remove if unused. -->

- <!-- Risk -->

---

## Open Questions

<!-- Optional. Add only when unresolved questions remain after scoping. Remove if unused. -->

- <!-- Question -->

---

## AI Context Load Analysis

> **Purpose:** Assess whether an AI agent can execute this task without losing critical context.
> Run this analysis before starting implementation. If context load is high, split the task or add a quick-reference section.

### Pre-read file budget

<!-- List all files the AI must read before writing any code. Group by category. -->

| Category | Files | Lines (approx) |
| -------- | ----- | -------------- |
| Task docs | <!-- this task + parent --> | <!-- ~ --> |
| Source files to modify | <!-- list --> | <!-- ~ --> |
| Source files to understand | <!-- list --> | <!-- ~ --> |
| **Total** | | |

<!-- If total exceeds ~3,000 lines, consider splitting the task or adding a quick-reference anchor. -->

### Risk flags

<!-- Check each risk and note severity (low/medium/high) if applicable. Delete rows that don't apply. -->

- [ ] **Source-of-truth scattering** — Must the AI synthesize info from 3+ files that partially overlap?
- [ ] **Prop/API discovery** — Must the AI read many components to learn their interfaces?
- [ ] **Cross-cutting contracts** — Does this task touch navigation, routing, or shared hooks used by other features?
- [ ] **Many implementation steps** — More than 6 sequential steps that could lose coherence under compression?
- [ ] **Guardrail amnesia** — Are there files the AI must NOT modify that it will be tempted to touch?
- [ ] **Missing components** — Does the plan assume components exist that actually don't?

### Mitigations

<!-- For each high-severity risk, describe the mitigation. Common options: -->
<!-- - Add an "AI Execution Quick Reference" section with condensed lookup tables -->
<!-- - Split into Phase A / Phase B with explicit checkpoint -->
<!-- - Pre-resolve ambiguous data (e.g., build the canonical mapping before coding) -->
<!-- - List "DO NOT MODIFY" files explicitly in a reference block -->

---

## AI Execution Quick Reference

<!-- Optional for context-heavy tasks. Use this when an AI should be able to execute from a compressed summary instead of rereading many files. Remove if unused. -->

- Canonical files:
  - <!-- source-of-truth files -->
- Invariants to preserve:
  - <!-- must-not-break rules -->
- Planned touch points:
  - <!-- likely files/modules to edit -->
- Do not modify:
  - <!-- guardrail files or areas -->

---

## Verification Notes

Record what was actually verified before closing the task.

- Automated:
  - <!-- commands run -->
- Manual:
  - <!-- click-throughs / UI checks -->
- Deferred / Not Run:
  - <!-- anything intentionally skipped or blocked -->

---

## Post-Completion Updates

After implementation and verification, update the project-facing docs and release metadata that this task changed.

**Universal:**

- Update this task file: `Status`, `Completed`, and any completion notes
- Record the actual verification performed in `Verification Notes`
- Update `docs/project-management/tasks/README.md`
- Update your project's status doc if the task changes current status, pending items, active tracks, or contributor guidance
- Update `CHANGELOG.md` if shipped behavior or release metadata changed
- Update `DECISION-LOG.md` if the task changes architecture, accepted policy, or other durable guidance

**Project-specific:**

See your project's `PROJECT-WORKFLOW-OVERLAYS.md` for additional closeout steps (in-app changelog, canon doc metadata, version-bearing surfaces, wiki docs, etc.).

---

## Related

- <!-- Related tasks, decisions, or documentation -->
