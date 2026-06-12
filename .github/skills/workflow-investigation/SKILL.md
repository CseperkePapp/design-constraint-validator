---
name: workflow-investigation
description: Investigate cross-cutting issues before editing. Use for root-cause analysis, write-set mapping, and risky changes that span code and docs.
---

# Workflow Investigation

Use this skill when the task is not safely local and you need to map architecture before changing files.

## Read First

1. `START-HERE.md` or equivalent project status entrypoint (if present)
2. `docs/project-management/000-WORKFLOW-SYSTEM/DOCUMENT-TAXONOMY.md`
3. relevant task file and touched source-of-truth docs
4. the primary implementation files likely involved

## Workflow

1. Identify the affected layer(s).
2. Map the read set before editing.
3. List invariants that must survive the change.
4. Separate observed evidence from assumptions.
5. Propose or implement the smallest coherent write set.

## Guardrails

- Do not treat UI symptoms alone as root cause.
- Do not widen scope silently; create a follow-up task for out-of-scope findings.
- Keep behavior changes and documentation changes synchronized.
- Prefer reversible, low-blast-radius edits first.

## Deliverables

- concise root-cause summary
- impacted file list or write-set estimate
- key invariants at risk
- verification plan tied to touched layers
