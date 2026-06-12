# Task 010 CODEX: `dcv-mcp` — MCP server exposing DCV to AI agents

**Status:** todo
**Priority:** P2
**Created:** 2026-06-11
**Effort:** L
**Dependencies:** TASK-004
**Phase:** MCP / Distribution
**Branch:** `task/010-mcp-server`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Add a `dcv-mcp` MCP server — a second bin in the existing package — exposing exactly three structured tools (`validate`, `why`, `graph`) over stdio, built as thin adapters over TASK-004's `validate()` convenience wrapper. Outputs are structured JSON so agents can program against them.

**Depends on:** TASK-004 (v2.1.0) — **do that first.** The MCP server must consume the `validate()` wrapper that task creates; building on the current seams would wrap the exact bugs being fixed. If that wrapper fell back to README-only, implementing it becomes a prerequisite step here.

**Strategic purpose:** unlock the MCP registry discovery channel (distribution checklist Phase 2) without exposing closed-source dt-core. Agents doing design-system work get token validation as tools; the listing is passive marketing that runs itself.

**Supersedes:** the Gemini-drafted prompt of 2026-06-11 — right shape, three factual errors corrected in the section below; read them to avoid the same class of mistake.

---

## Corrections to the prior draft (important)

1. **Type names.** `ThemeValidationResult` and `ValidationViolation` are types from `@decisionthemes/core` (the *other*, closed repo) — they do not exist in DCV. DCV's real public surface (`core/index.ts`): `Engine`, `ConstraintIssue` (`{ id, rule, level: 'error'|'warn', message, where? }`), `ConstraintPlugin`, `Graph`, plugin factories (`WcagContrastPlugin`, `MonotonicPlugin`, `ThresholdPlugin`, cross-axis), and color utilities. The CLI's `--format json` emits violations as `{ ruleId, level, message, nodes: string[], context: { where? } }`. Build tool outputs on these real shapes — do not invent dt-core's.
2. **`why` semantics.** In DCV, `why <tokenId>` explains **token provenance** (which aliases/edges feed a token — `core/why.ts`), not violation reasoning. Violations are already structured in `validate`'s output. The MCP tools must mirror DCV's actual capabilities: `validate` → structured violations; `why` → provenance for one token; `graph` → dependency graph. The prior draft's "why must return violation deltas" requirement is satisfied by `validate`'s response instead — see contracts below.
3. **Template location + licensing.** The structural template (`dt-mcp`) lives at `E:\GITHUB2\decisionthemesstudio\packages\dt-mcp\src\` — a different repo. Open it read-only for the *patterns* (Zod input contracts in `contracts.ts`, `ToolResponse<T>` discriminated union, `ToolExecutionError`/`ToolFailure` structured errors, server registration in `server.ts`/`tools.ts`). Note: any code copied into DCV becomes MIT — acceptable (sole author, boilerplate-level code), but copy patterns, not wholesale files. If cross-repo reading is awkward, the `@modelcontextprotocol/sdk` standard server boilerplate is simple enough to write fresh; the patterns above are the part worth keeping.

## Packaging decision (recommended): second bin in the existing package

Do **not** create a separate package/repo. Add the server as a second bin entry in `design-constraint-validator` itself:

```json
"bin": { "dcv": "cli/index.js", "design-constraint-validator": "cli/index.js", "dcv-mcp": "mcp/index.js" }
```

Rationale: one npm package, one version stream, one publish step, one thing to maintain — and `@modelcontextprotocol/sdk` + `zod` (zod is already a dependency) as the only addition. Registry listings point at the same package (`npx -y design-constraint-validator dcv-mcp`-style invocation or direct bin). Fallback to a separate package only if the SDK dependency feels too heavy for CLI-only users — in that case check first whether the SDK can be an `optionalDependency` or lazily imported so the CLI path never loads it.

## Tool contracts (exactly three tools, stdio transport)

All inputs as Zod schemas; all outputs structured JSON (never prose), so agents can program against them.

**`validate`**
- Input: `{ tokens: object } | { tokensPath: string }` (inline JSON object preferred — agents often can't share a filesystem with the server; support both), plus `{ constraints?: object, configPath?: string }` using the external-config mechanism from the fix task.
- Output: `{ ok: boolean, counts: { checked, violations, warnings }, violations: Array<{ ruleId, level, message, nodes, context }> }` — pass DCV's JSON result through; add fields only if the engine already provides them (e.g. actual vs. required ratio is currently embedded in `message` — if cheap, ALSO surface it as `context.actual` / `context.required` numbers so agents can auto-correct without parsing strings; this is the one genuinely valuable enrichment, do it at the engine result-shaping level, not by regexing messages).
- Behavior: empty/no matching constraints must return an explicit `{ ok: true, counts: { checked: 0 ... }, note: "no constraints matched" }` — never a silent pass (the candidates-set gotcha from the fix task applies here identically).

**`why`**
- Input: `{ tokenId: string } + tokens/constraints` as above.
- Output: structured provenance from `core/why.ts` — the token's value, its alias/dependency chain, and edges. Unknown token → structured error naming near-miss suggestions if the CLI's existing suggestion logic is reusable.

**`graph`**
- Input: tokens as above; `{ format?: 'json' }` — return the nodes/edges JSON the CLI's `graph --format json` produces (agents want JSON; mermaid is a human format, skip it or make it optional).

**Errors:** every failure (unparseable tokens, bad schema, engine throw) returns the structured error shape from the dt-mcp pattern — `{ ok: false, error: { code, message, details? } }` — never a thrown stack trace over stdio.

## Execution steps

1. Read the fix-task deliverables first (`validate()` wrapper signature, external config mechanism) — the MCP tools are thin adapters over them. If they're thick, something is wrong; stop and reconcile.
2. Read `dt-mcp` source in the other repo for the contracts/error/server patterns (read-only).
3. Scaffold `mcp/` directory in the DCV repo: `index.ts` (entry + stdio transport), `contracts.ts` (Zod schemas), `tools.ts` (the three adapters). Remember the repo commits compiled `.js` — wire `mcp/` into `npm run build` and verify the bin runs the rebuilt output.
4. Tests, mirroring the clean-room philosophy: drive the server through the MCP SDK's client (or raw JSON-RPC over stdio) — one test per tool with inline tokens containing a known violation (`#888888` on `#999999`, ratio ≈ 1.3:1), plus the no-constraints explicit-note case and one structured-error case. dt-mcp's `__tests__` show the harness pattern.
5. `server.json` for the official MCP registry (name, description from distribution-checklist Blurb B, stdio transport, install command) — commit it; actual registry submission stays a checklist item (Phase 2.1), not part of this task.
6. README: one new section, "Use from AI agents (MCP)", with the Claude Desktop / generic client config snippet — verified by actually configuring it once.
7. Version: minor bump (new bin + exports). Publish rides the normal release flow.

## Acceptance criteria

- [ ] `dcv-mcp` bin starts, speaks MCP over stdio, lists exactly three tools with schemas.
- [ ] `validate` with inline tokens + inline constraints returns structured violations for the known-bad pair; numeric `context.actual`/`context.required` present if implemented at engine level.
- [ ] No-matching-constraints returns the explicit note — verified that it cannot silently pass.
- [ ] `why` returns real provenance for an aliased token; unknown token → structured error.
- [ ] `graph` returns nodes/edges JSON for inline tokens.
- [ ] All tool tests green; CLI tests from the fix task still green; math untouched.
- [ ] README MCP section verified against a real client once.
- [ ] `server.json` committed; registry submission left for distribution checklist Phase 2.

---

*Sequencing reminder: fix task (v2.1.0) → this task → distribution checklist Phase 2 (official MCP registry first — mcp.directory and others auto-ingest from it — then mcp.so, Smithery, Glama, awesome-mcp-servers).*
