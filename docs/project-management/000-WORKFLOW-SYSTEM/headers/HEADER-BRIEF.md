# Header Template: Brief

## Purpose

Use this header for documents that provide a **structured execution brief for humans**.

A Brief is similar to a Prompt (context + steps), but it is **not** written for AI execution.

## When to Use

- Human-executed tasks that still need structure
- Multi-step work where handoff/checklists matter
- Work that may be paused/resumed by a human later

## Template

```markdown
# Brief NNN: [Brief Name]

**Task:** [TASK-NNN](../tasks/TASK-NNN-name.md)
**Status:** active | used | superseded
**Updated:** YYYY-MM-DD

---

## Context

<!-- Background a human needs to execute this work -->

---

## Steps

1. <!-- Step 1 -->
1. <!-- Step 2 -->

---

## Acceptance Criteria

- [ ] <!-- criterion 1 -->
- [ ] <!-- criterion 2 -->
```

## Usage Notes

- Briefs are optional.
- Briefs do not need a Source section (they are assumed human-authored).
