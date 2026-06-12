# Header Template: Decision

## Purpose

Use this header for documents that record **choices made and their rationale**.

## When to Use

- Architecture decisions
- Technology choices
- Design pattern selections
- Breaking changes
- Algorithm changes
- Any choice that affects the project direction

## Template

```markdown
## YYYY-MM-DD: [Decision Title]

**Decision:** [What was decided - one sentence]
**Why:** [Rationale and context]
**Alternatives:** [What else was considered]
**Impact:** [What changed, who/what is affected]
**Status:** implemented | in-progress | reverted
```

## Example

```markdown
## 2026-04-20: Separate Task and Prompt Numbering

**Decision:** Tasks and prompts will have independent numbering sequences
**Why:** Multiple prompts may relate to a single task; 1:1 coupling was limiting
**Alternatives:** Keep shared numbering with sub-numbers (135a, 135b)
**Impact:** New prompt format includes explicit Task field; existing archives unchanged
**Status:** implemented
```

## Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| Date | Yes | `YYYY-MM-DD` | When decision was made |
| Decision | Yes | Free text | What was decided (one sentence) |
| Why | Yes | Free text | Rationale and context |
| Alternatives | Yes | Free text | Other options considered |
| Impact | Yes | Free text | What changed as a result |
| Status | Yes | `implemented`, `in-progress`, `reverted` | Current state |

## Usage Notes

- Decisions are typically collected in DECISION-LOG.md (reverse chronological)
- Major decisions may also have their own standalone document
- Always record alternatives even if they seem obviously inferior - future readers need context
