# Header Template: Report

## Purpose

Use this header for **report documents** - written outputs from a task run, audit, review, investigation, or retrospective.

## When to Use

- Audit findings
- Review reports
- Research summaries
- Closeout reports produced by a numbered task
- Recommendation documents that are output artifacts rather than active tasks

## Template

```markdown
# Report NNN: [Name]

**Type:** Report
**Status:** draft | review | final | superseded
**Task:** [TASK-NNN](../tasks/TASK-NNN-name.md) | none
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD [optional]
**Author:** human | Claude | ChatGPT | Gemini | Codex | mixed
**Model:** model-id | N/A

---

## Purpose

[What this report records and why it exists]

## Scope

[What was examined]

## Findings

[Key observations, ordered by importance]

## Recommendations

[Recommended follow-up work, if any]

## Evidence

[Files, commands, screenshots, artifacts, or sources reviewed]
```

## Field Definitions

| Field | Required | Values | Description |
| ----- | -------- | ------ | ----------- |
| Report Number | Yes | `NNN`, `NNN.N`, or source task number | Matches the related task when useful; reports do not allocate task numbers |
| Type | Yes | `Report` | Declares the document kind |
| Status | Yes | `draft`, `review`, `final`, `superseded` | Current report state |
| Task | No | task link or `none` | Numbered task that produced the report, if applicable |
| Created | Yes | `YYYY-MM-DD` | When the report was created |
| Updated | No | `YYYY-MM-DD` | Last material revision |
| Author | Yes | source name | Who produced the report |
| Model | Yes | model id or `N/A` | AI model if applicable |
