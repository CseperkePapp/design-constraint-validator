# Task 002: Repository Review And Task Sequencing

**Status:** todo
**Priority:** P1
**Created:** 2026-06-11
**Updated:** 2026-06-11
**Completed:** <!-- YYYY-MM-DD when done -->
**Parent:** <!-- remove if standalone -->
**Effort:** M
**Dependencies:** TASK-001
**Phase:** Assessment
**Branch:** `task/002-repo-review-and-task-sequencing`

## Source

- agent: human + copilot
- model: GPT-5.3-Codex

---

## Summary

Perform a baseline repository review and establish the recommended execution order for the current draft task backlog.

---

## Background

DCV is already a working repository but has multiple draft tasks with different urgency, dependencies, and risk levels. Sequencing needs to be explicit before implementation starts.

---

## Scope

### In Scope

- Review current repository state and workflow surfaces
- Rank draft tasks by urgency, dependency, and release impact
- Record numbered backlog order

### Out of Scope

- Implementing all identified fixes
- Full architecture redesign

---

## Acceptance Criteria

- [x] Draft tasks are numbered in a recommended execution sequence.
- [x] Sequencing rationale is documented in this task file.
- [x] Follow-up execution tasks are ready to start from the ordered backlog.

---

## Documentation & Versioning Impact

### Always review on closeout

- [ ] This task file (`Status`, `Completed`, completion notes, verification)
- [x] `docs/project-management/tasks/README.md`
- [ ] Project status surface (if used)

### Update if this task changes them

- [ ] Root `package.json` and any affected package versions
- [ ] `CHANGELOG.md`
- [ ] `DECISION-LOG.md`
- [x] Canon/reference docs and templates touched for workflow use
- [ ] Wiki/contributor docs

---

## Implementation Notes

Initial recommended order established:

1. DRAFT-TASK-004: fix tokens flag and README parity
2. DRAFT-TASK-005: OKLCH contrast bug
3. DRAFT-TASK-006: publish pipeline reliability
4. DRAFT-TASK-007: repo hygiene
5. DRAFT-TASK-008: DTCG stable compliance
6. DRAFT-TASK-009: adapters/poset audit
7. DRAFT-TASK-010: MCP server

Why this order:

- 004 and 005 remove immediate correctness/usability blockers.
- 006 ensures future releases are actually publishable.
- 007 reduces implementation friction for subsequent tasks.
- 008 and 009 expand confidence and compatibility.
- 010 depends on 004 and is highest value after foundational fixes.

---

## AI Context Load Analysis

### Pre-read file budget

| Category | Files | Lines (approx) |
| -------- | ----- | -------------- |
| Task docs | `tasks/README.md`, draft tasks, `TASK-001` | ~900 |
| Source files to modify | `tasks/README.md`, this task file | ~140 |
| Source files to understand | `README.md`, `package.json` | ~360 |
| **Total** | | ~1400 |

### Risk flags

- [x] **Source-of-truth scattering**
- [ ] **Prop/API discovery**
- [ ] **Cross-cutting contracts**
- [ ] **Many implementation steps**
- [ ] **Guardrail amnesia**
- [ ] **Missing components**

### Mitigations

- Keep sequencing evidence and rationale in one task file.
- Apply only minimal write set: draft renames + task index + two starter execution tasks.

---

## Verification Notes

- Automated:
  - `git status --short`
  - `npm run validate-headers`
- Manual:
  - Reviewed draft task content and dependency notes before ordering
- Deferred / Not Run:
  - No code-level implementation checks (planning task)

---

## Related

- `docs/project-management/tasks/TASK-001-adopt-ai-project-workflow.md`
- `docs/project-management/tasks/DRAFT-TASK-004-dcv-fix-tokens-flag-and-readme.md`
- `docs/project-management/tasks/DRAFT-TASK-010-dcv-mcp-server.md`
