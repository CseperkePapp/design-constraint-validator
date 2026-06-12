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

## ⚠️ Pre-publish blocker (carry to v2.1.0 release)

`npm audit --omit=dev` reports **1 high-severity vulnerability**: `picomatch
<=2.3.1` (ReDoS / glob-injection), pulled in transitively by
`@modelcontextprotocol/sdk`. **Resolve before tagging v2.1.0** (e.g. `npm audit
fix`, an override, or an SDK bump that drops the vulnerable transitive). Codex
intentionally did not run `npm audit fix`. Tracked in TASK-006 owner follow-ups
and the release-plan note.

## Post-merge

`main`: build exit 0, 79 passed / 1 skipped. Version kept at 2.1.0. No publish,
no tag. `main` stays local per the owner's preference.
