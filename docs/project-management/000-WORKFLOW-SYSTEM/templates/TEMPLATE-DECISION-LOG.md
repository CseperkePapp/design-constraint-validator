# Decision Log

Use this file when your project wants one shared reverse-chronological log instead of many standalone ADR files.

## Entry Shape

```markdown
## YYYY-MM-DD: [Decision Title]

**Decision:** [What was decided - one sentence]
**Why:** [Rationale and context]
**Alternatives:** [What else was considered]
**Impact:** [What changed, who or what is affected]
**Status:** implemented | in-progress | reverted
```

## Example

```markdown
## 2026-06-11: Use unnumbered workflow files

**Decision:** Reusable workflow docs will use lower-kebab-case filenames and no numeric sequence.
**Why:** Workflow docs describe recurring processes, while numbered task files represent specific executions.
**Alternatives:** Number workflows like tasks or store the process steps inside each task file.
**Impact:** `workflows/` stays scannable and execution history remains in `tasks/`.
**Status:** implemented
```

## Notes

- Keep entries reverse chronological when practical
- Use one sentence for `Decision:` whenever possible
- Prefer one shared log unless the project truly benefits from standalone ADR files
