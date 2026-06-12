# Header Template: Intent

## Purpose

Use this header for documents that define **goals, vision, and desired outcomes**.

## When to Use

- Architecture principles
- Future plans and roadmaps
- Feature specifications (high-level)
- Project vision documents

## Template

```markdown
# [Title]

**Type:** Intent
**Goal:** [What this achieves - one sentence]
**Constraints:** [What this must NOT violate - or "None"]
**Status:** active | draft | superseded
**Updated:** YYYY-MM-DD

---

[Document content begins here]
```

## Example

```markdown
# Core Principle - Data Integrity First

**Type:** Intent
**Goal:** Define the invariants that any change to the data layer must preserve
**Constraints:** No data loss on schema migrations; no silent type coercion
**Status:** active
**Updated:** 2026-04-20

---

## The Invariants
...
```

## Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| Type | Yes | `Intent` | Document category |
| Goal | Yes | Free text | Single sentence describing what this achieves |
| Constraints | Yes | Free text or "None" | What this document protects or must not violate |
| Status | Yes | `active`, `draft`, `superseded` | Current state |
| Updated | Yes | `YYYY-MM-DD` | Last modification date |
