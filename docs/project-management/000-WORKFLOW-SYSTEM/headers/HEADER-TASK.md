# Header Template: Task

## Purpose

Use this header for **task specifications** - discrete units of work to be done.

## When to Use

- Feature implementation tasks
- Bug fix tasks
- Refactoring tasks
- Documentation tasks
- Any bounded unit of work

See [TASK-SCOPE-GUIDELINES.md](../TASK-SCOPE-GUIDELINES.md) for guidance on task sizing and parent/subtask relationships.

## Template (Standalone Task)

```markdown
# Task NNN: [Name]

**Status:** planning | future | todo | in-progress | on-hold | done | blocked | cancelled
**Priority:** P0 | P1 | P2 | P3 | P4
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD [optional]
**Completed:** YYYY-MM-DD [when done, or remove if not done]
**Effort:** S | M | L | XL | -- [optional; add a short note if needed]
**Dependencies:** none | TASK-NNN | TASK-NNN, TASK-NNN.N | free text [optional]
**Phase:** N | free text [optional; use when your repo groups tasks into named/numbered phases]

## Source
- agent: human | Claude | ChatGPT | Gemini | mixed
- model: [model-id or N/A]

---

## Summary

[Brief description of what this task accomplishes]

## Scope

[What's included]

## Non-Goals

[What's explicitly excluded]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

## Template (Parent Task with Subtasks)

```markdown
# Task NNN: [Parent Name]

**Status:** planning | future | todo | in-progress | on-hold | done | blocked | cancelled
**Priority:** P0 | P1 | P2 | P3 | P4
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD [optional]
**Completed:** YYYY-MM-DD [when done, or remove if not done]
**Effort:** S | M | L | XL | -- [optional; add a short note if needed]
**Dependencies:** none | TASK-NNN | TASK-NNN, TASK-NNN.N | free text [optional]
**Phase:** N | free text [optional; use when your repo groups tasks into named/numbered phases]

## Source
- agent: human | Claude | ChatGPT | Gemini | mixed
- model: [model-id or N/A]

---

## Summary

[What this initiative achieves overall]

## Subtasks

| ID | Subtask | Status |
| -- | ------- | ------ |
| NNN.1 | [Subtask 1](TASK-NNN.1-name.md) | todo |
| NNN.2 | [Subtask 2](TASK-NNN.2-name.md) | todo |

## Background

[Shared context for all subtasks - subtasks reference this, don't repeat it]
```

## Template (Subtask)

```markdown
# Task NNN.N: [Subtask Name]

**Status:** planning | future | todo | in-progress | on-hold | done | blocked | cancelled
**Priority:** P0 | P1 | P2 | P3 | P4
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD [optional]
**Parent:** [TASK-NNN](TASK-NNN-name.md)
**Effort:** S | M | L | XL | -- [optional; add a short note if needed]
**Dependencies:** none | TASK-NNN | TASK-NNN, TASK-NNN.N | free text [optional]
**Phase:** N | free text [optional; use when your repo groups tasks into named/numbered phases]

## Source
- agent: human | Claude | ChatGPT | Gemini | mixed
- model: [model-id or N/A]

---

## Summary

[What this subtask delivers]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
```

Note: Subtasks don't repeat Background - it lives in the parent task.

## Field Definitions

| Field | Required | Values | Description |
| ----- | -------- | ------ | ----------- |
| Task Number | Yes | `NNN` or `NNN.N` | Sequential; subtasks use decimal |
| Status | Yes | `planning`, `future`, `todo`, `in-progress`, `on-hold`, `done`, `blocked`, `cancelled` | Current state |
| Priority | Yes | `P0`, `P1`, `P2`, `P3`, `P4` | Project priority scale |
| Created | Yes | `YYYY-MM-DD` | When task was created |
| Updated | No | `YYYY-MM-DD` | Last material revision to the task spec |
| Completed | Conditional | `YYYY-MM-DD` | Required when `done` |
| Parent | Subtasks only | Link to parent | Required for subtasks |
| Effort | No | `S`, `M`, `L`, `XL`, `--` (+ optional short note) | Estimated scope/effort |
| Dependencies | No | task ids, comma-separated task ids, `none`, or free text | Work that must land first or baseline assumptions |
| Phase | No | number or free text | Optional planning grouping, for example `7` or `Launch Prep` |
| Source.agent | Yes | `human`, `Claude`, `ChatGPT`, `Gemini`, `mixed` | Who wrote this |
| Source.model | Yes | Model ID or `N/A` | Specific model if AI |

## Completion Reminder

On task closeout, review what else needs updating. The exact list depends on your project — see your project's `PROJECT-WORKFLOW-OVERLAYS.md` for the full closeout checklist. Universal items:

- Update the task file: `Status: done`, add `Completed:` date
- Update the task index (`tasks/README.md`)
- Update the project's status doc (START-HERE.md, STATUS.md, or equivalent — your project's overlay names it)
- Update `CHANGELOG.md` if shipped behavior changed
- Update `DECISION-LOG.md` if architecture or durable guidance changed

Project-specific closeout steps (in-app changelog, canon doc metadata, wiki pages, guardrail runs, etc.) are documented in each project's overlay.

## Task Numbering

- **Parent tasks:** `TASK-NNN` (e.g., TASK-006)
- **Subtasks:** `TASK-NNN.N` (e.g., TASK-006.1, TASK-006.2)
- **Max depth:** 2 levels (parent + subtask only)
- Numbers are never reused, even after archival
- Check `tasks/README.md` for next available number

## Optional Agent Assignment Marker (Preference)

You may flag the *preferred* agent for a task by adding `CLAUDE` or `CODEX`
immediately after the number, in both the filename and the H1 title:

- **Filename:** `TASK-NNN-CLAUDE-name.md` or `TASK-NNN-CODEX-name.md`
  (subtasks: `TASK-NNN.N-CODEX-name.md`)
- **Title:** `# Task NNN CLAUDE: [Name]` or `# Task NNN CODEX: [Name]`

This is a **preference, not a rule**: the marker records who *should* pick the
task up, but any agent (or a human) may implement it regardless. Nothing
enforces or blocks a mismatch, and the marker is optional — omit it entirely
when there is no preference.

Notes:

- The marker rides through the lifecycle prefixes unchanged
  (`TASK-042-CLAUDE-name.md` → `DONE-TASK-042-CLAUDE-name.md`).
- Recognized markers are uppercase `CLAUDE` and `CODEX`. A leading token that is
  not a recognized marker is treated as part of the task name.
- The task **id is still the number** — the index ID column, dependencies, and
  cross-references use `NNN` / `NNN.N` and are unaffected by the marker.
