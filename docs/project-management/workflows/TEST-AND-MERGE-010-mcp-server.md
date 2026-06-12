# Prompt: Test and Merge Task 010

**Task:** [DONE-TASK-010](../tasks/DONE-TASK-010-CODEX-dcv-mcp-server.md)
**Status:** done
**Branch:** `task/010-mcp-server`
**Merged:** 2026-06-12 → `main` (merge commit, `--no-ff`)

## Source

- implementation: Codex (GPT-5.3-Codex)
- verification + landing: Claude (claude-opus-4-8)

---

## Verification (before landing)

- [x] `npm run build` → exit 0
- [x] `npm test` → 13 files, 79 passed, 1 skipped (+8 MCP tests)
- [x] `npm run lint` → exit 0
- [x] `npm run workflow:test` → 19 passed
- [x] `npx vitest run test/mcp-tools.test.ts test/mcp-server.test.ts` → 8 passed
      (direct tool calls + official MCP SDK stdio-client round trip)
- [x] `server.json` validates against the MCP registry schema (per implementer)
- [x] `npm pack --dry-run` includes `mcp/index.js` + `server.json`
- [x] No compiled `mcp/**` artifacts tracked (gitignored)
- [x] Diffs reviewed: MCP tools are read-only (`validate`/`why`/`graph`), no
      shell/exec/fs-write surface; core engine/wcag/json-output changes are
      additive metadata only (color math unchanged)

## What landed

- `mcp/`: stdio MCP server exposing `validate`, `why`, `graph`.
- `package.json`: `dcv-mcp` bin, `./mcp` export, `@modelcontextprotocol/sdk` dep,
  `mcpName`, `mcp/` + `server.json` packaged.
- `server.json`: MCP registry metadata.
- `engine.ts`/`wcag.ts`/`json-output.ts`: structured WCAG context
  (`actual`/`required`, `involvedTokens`) surfaced from engine metadata.

## Supply-chain note (RESOLVED)

Running `npm audit --omit=dev` during this verification surfaced **1 high-severity
vulnerability**: `picomatch <=2.3.1` (ReDoS). **Correction:** it was **not** from
the MCP SDK (which uses the safe `picomatch@4.x`) — it came transitively from
**`fast-glob`**, an unused direct dependency present since the project's start
(`fast-glob` → `micromatch` → `picomatch@2.3.1`).

**Fixed** by removing the unused `fast-glob` dependency (branch
`task/006-drop-unused-fast-glob`). Nothing imports `fast-glob`; the only glob
usage is `scripts/validate-headers.ts` via the separate `glob` package.
`npm audit --omit=dev` now reports **0 vulnerabilities**.

## Post-merge

`main`: build exit 0, 79 passed / 1 skipped. Version kept at 2.1.0. No publish,
no tag. `main` stays local per the owner's preference.
