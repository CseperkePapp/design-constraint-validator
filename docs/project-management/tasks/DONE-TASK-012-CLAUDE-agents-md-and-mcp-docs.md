# Task 012 CLAUDE: Agent onboarding — root AGENTS.md + AI-GUIDE MCP setup

**Status:** done
**Priority:** P2
**Created:** 2026-06-12
**Completed:** 2026-06-12
**Effort:** S
**Dependencies:** TASK-003, TASK-010
**Phase:** AI Enablement
**Branch:** `task/012-agents-md-and-mcp-docs`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Phase-1 quick wins from the AI capability assessment (G1 + G2): add a root
`AGENTS.md` so any coding agent onboards the repo's conventions without
rediscovering them each session, and document the shipped `dcv-mcp` MCP server in
`docs/AI-GUIDE.md`.

See [AI-CAPABILITY-ASSESSMENT.md](../AI-CAPABILITY-ASSESSMENT.md).

---

## Scope

### In scope

- Root `AGENTS.md`: what DCV is; build/test/lint/check commands; the
  branch-per-task convention; where the ledger lives; key gotchas (gitignored
  build artifacts → build before CLI-spawning tests, commit-msg task-ref hook,
  co-author line); MCP server pointer.
- `docs/AI-GUIDE.md`: an MCP section — what `dcv-mcp` exposes (validate / why /
  graph), client config (post-publish `npx` form + local-dev form), noting the
  package publishes at v2.1.0.

### Out of scope

- New MCP tools (G3/G4 → TASK-013), `.github/agents/` (G6 → TASK-015),
  any code changes.

---

## Acceptance Criteria

- [x] Root `AGENTS.md` exists and accurately states commands, branch convention,
      ledger location, and the real gotchas.
- [x] `AI-GUIDE.md` documents the MCP server (tools + client setup), with the
      not-yet-published caveat called out.
- [x] No source/behavior changes; `npm run check` + `npm run workflow:test` green.

---

## Verification Notes

- Automated: `npm run check`, `npm run workflow:test`.
- Manual: commands in AGENTS.md spot-checked against package.json scripts.
