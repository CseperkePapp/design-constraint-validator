# Header Template: Canon

## Purpose

Use this header for documents that are **authoritative sources of truth**.

## When to Use

- Glossaries and terminology definitions
- Type definitions and schemas
- API contracts
- Default configurations
- Project instructions (CLAUDE.md / AGENTS.md)

## Template

```markdown
# [Title]

**Type:** Canon
**Version:** X.Y.Z
**Authority:** canonical | derived | provisional
**Verified:** YYYY-MM-DD
**Supersedes:** [previous version, document, or "N/A"]

---

[Document content begins here]
```

## Example

```markdown
# Terminology Glossary

**Type:** Canon
**Version:** 1.2.0
**Authority:** canonical
**Verified:** 2026-04-20
**Supersedes:** N/A

---

## Core Terms
...
```

## Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| Type | Yes | `Canon` | Document category |
| Version | Yes | Semver `X.Y.Z` | Document version (often matches project version) |
| Authority | Yes | `canonical`, `derived`, `provisional` | How authoritative this source is |
| Verified | Yes | `YYYY-MM-DD` | Last date content was verified as accurate |
| Supersedes | Yes | Document name or `N/A` | What this replaces |

## Authority Levels

- **canonical** - This IS the source of truth. Other docs derive from this.
- **derived** - This summarizes or extracts from canonical sources.
- **provisional** - This is authoritative for now, but may change.
