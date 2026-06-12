# Prompt: Test and Merge Task 012

**Task:** [DONE-TASK-012](../tasks/DONE-TASK-012-CLAUDE-agents-md-and-mcp-docs.md)
**Status:** done
**Branch:** `task/012-agents-md-and-mcp-docs`
**Merged:** 2026-06-12 → `main` (`--no-ff`)

## Source

- agent: Claude (claude-opus-4-8)

## Verification

- [x] `npm run check` (typecheck + lint + build + test) → exit 0, 79 passed / 1 skipped
- [x] `npm run workflow:test` → 19 passed (TASK-012 added to the README index)
- [x] Docs-only; no source/behavior changes

## What landed

- Root `AGENTS.md`: agent onboarding (commands, build-before-CLI-tests gotcha,
  branch-per-task + solo-sequential conventions, ledger location, commit-msg
  task-ref hook, tag-push release, MCP pointer).
- `docs/AI-GUIDE.md`: new "MCP Server (dcv-mcp)" section + corrected the stale
  Programmatic API example to the real `validate({ tokensPath, configPath })` API.

First of the AI-CAPABILITY-ASSESSMENT Phase-1 quick wins (G1+G2). No publish, no tag.
