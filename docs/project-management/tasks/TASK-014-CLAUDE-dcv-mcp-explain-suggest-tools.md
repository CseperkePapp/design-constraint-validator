# Task 014 CLAUDE: MCP `list-constraints` / `explain` / `suggest-fix` tools

**Status:** todo
**Priority:** P2
**Created:** 2026-06-12
**Effort:** M
**Dependencies:** TASK-010, TASK-012, TASK-013
**Phase:** AI Enablement
**Branch:** `task/014-mcp-explain-suggest-tools`

## Coordination

- Implementation owner: Claude.
- Review gate: Codex review sweep before merge.
- Collaboration mode: solo-sequential. Start from `main` after TASK-013 is
  merged or otherwise intentionally included as a dependency.

## Source

- agent: Claude (claude-opus-4-8)
- origin: AI-CAPABILITY-ASSESSMENT.md gaps G3 + G4 ("the product leap")

---

## Summary

Extend the `dcv-mcp` server, currently read-only `validate` / `why` / `graph`,
with three derivation-only tools that turn raw violations into actionable
guidance:

1. **`list-constraints`** - enumerate the active constraints that apply to a
   token set/config (WCAG pairs, thresholds, orders, cross-axis).
2. **`explain`** - for a given violation, or token pair plus rule, return a
   plain-English "why it failed and what it missed" (for example, "contrast
   1.24:1, needs >= 4.5:1").
3. **`suggest-fix`** - for a violation, compute a satisfying value without
   writing anything (for example, adjust a color until it clears the ratio;
   return the min/max for a threshold; propose a boundary value for a monotonic
   scale).

This is the validator-to-assistant leap. It stays read-only: tools return
suggestions, and the agent/user decides whether to apply them. Writing via
`set`/`patch` is a separate later task.

---

## Background

`mcp/tools.ts` exposes `validate`, `why`, and `graph` over the same validation
API the CLI uses. `mcp/contracts.ts` owns the Zod input schemas. The existing
constraint registry already discovers active built-in, config, order, lightness,
and cross-axis sources. The existing color helpers already parse colors,
composite alpha, calculate relative luminance, and calculate contrast.

The new tools should reuse those existing surfaces instead of duplicating
constraint discovery or color math.

## Readiness Review

- The tool names and MCP registration points are concrete:
  `mcp/tools.ts`, `mcp/contracts.ts`, `registerDcvMcpTools()`.
- Inputs should extend the current shared token/config fields from
  `tokenInputShape`: `tokens`, `tokensPath`, `constraints`, `configPath`,
  `constraintsDir`, and `breakpoint`.
- The implementation should be read-only. It may read token/config/constraint
  files supplied by the caller, but it must not write token, config, or patch
  files.
- Contrast suggestions must verify the proposed output with existing contrast
  math before returning it. If a safe CSS color cannot be parsed/serialized, the
  tool should refuse that suggestion path with a clear message.

---

## Scope

### In Scope

- `mcp/tools.ts` and `mcp/contracts.ts`: add `list-constraints`, `explain`,
  `suggest-fix` with typed input/output contracts.
- Add small internal helpers under `mcp/` if needed, but do not change
  validation semantics.
- `list-constraints`:
  - Return active constraint sources discovered for the supplied token/config
    input.
  - Include stable fields useful to agents: source type, rule id/type, involved
    token IDs, threshold/ratio/order data where available, and source path where
    applicable.
- `explain`:
  - Accept either a validation `violation` object or `{ ruleId, nodes, context }`
    plus the token/config input needed to recover values.
  - Support at least WCAG contrast, threshold/custom-threshold, and monotonic
    violations.
  - Return structured explanation text plus machine-readable facts.
- `suggest-fix`:
  - WCAG contrast: propose foreground and/or background color candidates when
    both colors are parseable and a safe CSS color can be returned. Verify each
    candidate clears the required ratio before returning it.
  - Threshold/custom-threshold: return the boundary value and comparison
    direction.
  - Monotonic/order: identify the out-of-order token(s) and return a minimal
    numeric boundary suggestion.
  - Refuse unsupported color spaces or unparseable values with explicit
    error-style output, not guessed math.
- Tests mirroring `test/mcp-tools.test.ts`: direct tool tests plus an SDK stdio
  registration/call case.
- Document the new tools in `docs/AI-GUIDE.md` MCP section.

### Out Of Scope

- Write tools (`set`/`patch` over MCP).
- New constraint types.
- Changing validation semantics or core color/constraint math.
- `.github/agents/` - TASK-015.

---

## Acceptance Criteria

- [ ] `list-constraints`, `explain`, `suggest-fix` registered and schema-typed;
      read-only (no file writes).
- [ ] `list-constraints` uses the current constraint discovery path and reports
      built-in, config, order, lightness, and cross-axis sources where present.
- [ ] `explain` covers WCAG, threshold/custom-threshold, and monotonic violations
      with structured facts and plain-English explanation.
- [ ] `suggest-fix` returns only verified suggestions; WCAG color suggestions
      genuinely clear the required ratio, and unsupported/unparseable color
      inputs are refused clearly.
- [ ] Direct MCP tool tests and SDK stdio tests cover the new tools.
- [ ] `docs/AI-GUIDE.md` MCP section documents the new tools and preserves the
      read-only/no-write distinction.
- [ ] `npm run check` and `npm run workflow:test` pass.
- [ ] Codex review report is created before merge, with findings addressed or
      explicitly deferred.

## Notes

- Prefer adjusting the foreground for contrast unless the input pins a target.
  When ambiguous, return both foreground and background options so the caller can
  choose.
- Keep returned suggestions explicit: candidate token id, old value, suggested
  value, resulting ratio/value, and why the suggestion is safe.
