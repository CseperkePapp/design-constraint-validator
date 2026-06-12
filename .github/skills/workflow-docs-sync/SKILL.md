---
name: workflow-docs-sync
description: Update docs while preserving repo canon and status accuracy. Use for task docs, overlays, architecture notes, and closeout synchronization.
---

# Workflow Docs Sync

Use this skill when documentation is the main deliverable or when code changes require synchronized doc updates.

## Read First

1. active task file
2. `docs/project-management/tasks/README.md`
3. source-of-truth docs being changed
4. project status surface (`START-HERE.md`/`STATUS.md`) if present

## Workflow

1. Confirm current behavior before editing docs.
2. Reuse repository terminology consistently.
3. Update status surfaces together on closeout:
   - task file
   - task index
   - status entrypoint when contributor guidance/current status changed
4. Record only verification that actually happened.
5. If docs carry metadata fields (`Version`, `Verified`, `Last Updated`), refresh them when required.

## Guardrails

- Do not present transitional state as final architecture.
- Do not invent verification results.
- Keep deferred work explicit.

## Deliverables

- updated docs with consistent terminology
- synchronized task and status surfaces
- explicit verification notes and remaining gaps
