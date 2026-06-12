# Task Scope Guidelines

**Type:** Canon
**Version:** 1.0.0
**Authority:** canonical
**Verified:** 2026-04-20

---

## Purpose

Define what constitutes a task, when to create subtasks, and how to scope work appropriately.

---

## Task Hierarchy

Tasks can have **one level of subtasks** (no deeper nesting):

```
TASK-006: Parent Task Name
├── TASK-006.1: First Subtask
├── TASK-006.2: Second Subtask
└── TASK-006.3: Third Subtask
```

### Numbering Rules

- **Parent tasks:** `TASK-NNN` (e.g., TASK-006)
- **Subtasks:** `TASK-NNN.N` (e.g., TASK-006.1, TASK-006.2)
- **Maximum depth:** 2 levels (parent + subtask)
- **Subtask limit:** Recommended max 9 subtasks per parent (NNN.1 through NNN.9)

If a subtask needs its own subtasks, promote it to a full task.

---

## When to Create a Parent Task

Create a **parent task** when:

1. **Multiple related deliverables** - Work naturally breaks into 2+ distinct pieces
2. **Shared context** - Subtasks share background, goals, or constraints
3. **Sequential or parallel work** - Subtasks can be done in order or independently
4. **Single initiative** - All subtasks serve one larger goal

### Parent Task Characteristics

- Has its own Summary and Background sections
- May or may not have its own implementation (can be "container only")
- Status is `done` when all subtasks are `done`
- Links to all subtasks in a "Subtasks" section

---

## When to Create a Subtask

Create a **subtask** when work:

1. **Belongs to a parent** - Clearly part of a larger initiative
2. **Is independently completable** - Can be done and verified on its own
3. **Has distinct deliverables** - Different output than siblings
4. **Shares context** - Would repeat parent's Background if standalone

### Subtask Characteristics

- References parent via `Parent:` field
- Inherits context from parent (doesn't repeat Background)
- Has its own Acceptance Criteria
- Can be completed independently of siblings

---

## When to Keep Tasks Flat

Keep tasks **flat** (no subtasks) when:

1. **Truly independent** - No shared context or initiative
2. **Small scope** - Single deliverable, few files
3. **Different timelines** - Would be done weeks/months apart
4. **Different owners** - Different people would do each

---

## Task Scope Heuristics

### Right-Sized Task

A well-scoped task typically:

- Can be completed in **1-3 sessions**
- Has **3-7 acceptance criteria**
- Touches **1-10 files** (rough guideline)
- Has a **clear "done" state**

### Too Big (Split It)

Consider splitting if:

- More than **10 acceptance criteria**
- Would take **more than a week**
- Has **unrelated deliverables**
- Could be done by different people independently

### Too Small (Combine It)

Consider combining if:

- Just **1-2 acceptance criteria**
- Takes **less than 30 minutes**
- Is **always done with** another task
- Has **no standalone value**

---

## Example: Workflow System Tasks

### Before (Flat)
```
TASK-002: Header validation lint script
TASK-003: Copilot instructions investigation
TASK-004: Global status file design
```

### After (Hierarchical)
```
TASK-006: Workflow System Refinement
├── TASK-006.1: Header validation lint script
├── TASK-006.2: Copilot instructions investigation
└── TASK-006.3: Global status file design
```

**Why group these?**
- All relate to workflow system
- Share context from Task 000
- Same initiative (refining the workflow)
- Can be done independently but serve one goal

---

## File Naming

### Parent Tasks
```
TASK-006-workflow-refinement.md
```

### Subtasks
```
TASK-006.1-header-lint.md
TASK-006.2-copilot-investigation.md
TASK-006.3-status-file.md
```

---

## Index Table Format

```markdown
## Active Tasks

| ID | Task | Priority | Status |
| -- | ---- | -------- | ------ |
| 006 | [Workflow Refinement](TASK-006-workflow-refinement.md) | P2 | in-progress |
| 006.1 | ↳ [Header lint](TASK-006.1-header-lint.md) | P4 | todo |
| 006.2 | ↳ [Copilot investigation](TASK-006.2-copilot-investigation.md) | P4 | todo |
| 006.3 | ↳ [Status file](TASK-006.3-status-file.md) | P2 | todo |
```

The `↳` prefix visually indicates subtasks.

---

## Parent Task Header

```markdown
# Task NNN: [Parent Task Name]

**Status:** in-progress
**Priority:** P2
**Created:** YYYY-MM-DD

## Source
- agent: human
- model: N/A

---

## Summary

[What this initiative achieves]

## Subtasks

| ID | Subtask | Status |
| -- | ------- | ------ |
| NNN.1 | [Subtask 1](TASK-NNN.1-name.md) | todo |
| NNN.2 | [Subtask 2](TASK-NNN.2-name.md) | todo |

## Background

[Shared context for all subtasks]
```

---

## Subtask Header

```markdown
# Task NNN.N: [Subtask Name]

**Status:** todo
**Priority:** P2
**Created:** YYYY-MM-DD
**Parent:** [TASK-NNN](TASK-NNN-name.md)

## Source
- agent: human
- model: N/A

---

## Summary

[What this subtask delivers]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```

Note: Subtasks reference parent but don't repeat Background (it's in parent).
