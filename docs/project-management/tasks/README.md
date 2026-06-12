# Tasks

Use this as the recommended task index shape when adopting the workflow automation kit.

**Next task:** 011

## Active Tasks

| ID | Task | Priority | Status |
| -- | ---- | -------- | ------ |
| 001 | [Adopt AI project workflow in DCV](TASK-001-adopt-ai-project-workflow.md) | P2 | in-progress |
| 002 | [Repository review and task sequencing](TASK-002-repo-review-and-task-sequencing.md) | P1 | todo |
| 003 | [AI capability assessment for DCV](TASK-003-ai-capability-assessment.md) | P2 | planning |
| 004 | [DCV v2.1.0 — make the published package usable (CLAUDE)](TASK-004-CLAUDE-dcv-fix-tokens-flag-and-readme.md) | P1 | in-progress |
| 005 | [Fix OKLCH→sRGB conversion (CODEX)](TASK-005-CODEX-dcv-oklch-contrast-bug.md) | P1 | in-progress |
| 006 | [Diagnose & fix silent release pipeline (CODEX)](TASK-006-CODEX-dcv-publish-pipeline.md) | P1 | in-progress |
| 007 | [Repo hygiene — de-commit build artifacts (CODEX)](DONE-TASK-007-CODEX-dcv-repo-hygiene.md) | P2 | done |
| 008 | [DTCG 2025.10 stable-spec compliance (CLAUDE)](TASK-008-CLAUDE-dcv-dtcg-stable-compliance.md) | P2 | todo |
| 009 | [Audit adapters, poset, receipts (CLAUDE)](TASK-009-CLAUDE-dcv-adapters-poset-audit.md) | P3 | todo |
| 010 | [dcv-mcp MCP server (CODEX)](TASK-010-CODEX-dcv-mcp-server.md) | P2 | todo |

## Completed Tasks

| ID | Task | Priority | Status |
| -- | ---- | -------- | ------ |

## Creating A New Task

1. Get the next task number (currently: **011**)
1. Copy the canonical task template into `docs/project-management/tasks/`
1. Add the task to the Active Tasks table
1. Run `npm run workflow:test` after task/index edits
