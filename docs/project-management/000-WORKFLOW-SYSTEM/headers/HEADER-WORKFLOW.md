# Header Template: Workflow

## Purpose

Use this header for **workflow documents** - reusable process recipes for recurring kinds of project work.

## When to Use

- Repeatable audit workflows
- Release or closeout workflows
- Review/checklist workflows
- Process recipes that should be referenced by multiple tasks

## Template

```markdown
# Workflow: [Name]

**Type:** Workflow
**Status:** draft | active | retired | superseded
**Version:** X.Y.Z
**Owner:** human | Claude | ChatGPT | Gemini | Codex | mixed
**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD

---

## Purpose

[What recurring work this workflow supports]

## When To Use

[Trigger conditions, boundaries, and explicit not-for cases]

## Required Outputs

[Required task docs, reports, decisions, or other artifacts each run must produce]

## Evidence / Inputs

[Required context, files, tools, preconditions, or evidence inventory]

## Steps

1. [Step]
1. [Step]
1. [Step]

## Decision Rules

[Rules or heuristics that help the runner choose between valid paths]

## Verification

[Concrete checks plus fallback checks if tooling is unavailable]

## Related

[Linked tasks, reports, docs, or workflows]
```

## Field Definitions

| Field | Required | Values | Description |
| ----- | -------- | ------ | ----------- |
| Type | Yes | `Workflow` | Declares the document kind |
| Status | Yes | `draft`, `active`, `retired`, `superseded` | Current workflow state |
| Version | Yes | semantic-ish version or local workflow version | Increment when the process materially changes |
| Owner | Yes | source name | Person or agent responsible for maintaining the workflow |
| Created | Yes | `YYYY-MM-DD` | When the workflow was created |
| Updated | Yes | `YYYY-MM-DD` | Last material revision |

## Authoring Guidance

- State both use-cases and non-goals. A reusable workflow should say what it is for and what should use a task, skill, agent, or other surface instead.
- Name the required outputs up front. If every run should create a task file, report, checklist, or decision record, say so explicitly.
- Treat inputs as evidence, not just prerequisites. Name the files, tools, or artifacts a runner should examine before making recommendations.
- Add decision rules when judgment is involved. This keeps repeated runs aligned instead of relying on unstated operator preference.
- Make verification concrete. Prefer direct artifact/link checks and runnable commands; if tooling may be unavailable, tell the runner what honest fallback check to record.
