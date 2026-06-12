# Header Template: Question

## Purpose

Use this header for documents that track **open investigations and unknowns**.

## When to Use

- Open questions being researched
- Investigation documents
- Blocking issues being analyzed
- Technical unknowns

## Template

```markdown
# [Question Title]

**Type:** Question
**Status:** open | investigating | blocked | resolved
**Opened:** YYYY-MM-DD
**Blocking:** [what this blocks, or "Nothing"]
**Resolved:** YYYY-MM-DD [when closed, or remove if open]

---

[Question context and investigation notes]
```

## Example

```markdown
# Why does the build succeed locally but fail in CI?

**Type:** Question
**Status:** investigating
**Opened:** 2026-04-20
**Blocking:** Release pipeline

---

## Observations
...
```

## Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| Type | Yes | `Question` | Document category |
| Status | Yes | `open`, `investigating`, `blocked`, `resolved` | Investigation state |
| Opened | Yes | `YYYY-MM-DD` | When question was raised |
| Blocking | Yes | Free text or "Nothing" | What depends on this answer |
| Resolved | Conditional | `YYYY-MM-DD` | Required when Status is `resolved` |

## Status Progression

1. **open** - Question identified, not yet being worked
2. **investigating** - Actively researching
3. **blocked** - Investigation stuck on external dependency
4. **resolved** - Answer found (document the answer in content)
