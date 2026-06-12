# DCV AI Capability Assessment

**Task:** [TASK-003](tasks/DONE-TASK-003-ai-capability-assessment.md)
**Date:** 2026-06-12
**Author:** Claude (claude-opus-4-8)
**Status:** complete

Structured assessment of which AI supports would most improve quality and delivery
speed in DCV, scored by impact vs. adoption cost. Inventory reflects the repo after
TASK-001…011.

---

## 1. Current-state inventory

| Category | What exists today | Maturity |
| --- | --- | --- |
| **MCP server** | `dcv-mcp` (`mcp/`) — `validate`, `why`, `graph` over stdio; registry metadata in `server.json` (TASK-010) | New, working, **read-only** |
| **Programmatic API** | `validate()` exported from the package root; structured `{ok, counts, violations, warnings}` (TASK-004) | New, tested |
| **Repo skills** (`.github/skills/`) | `workflow-investigation`, `workflow-qa-evidence`, `workflow-docs-sync` — process discipline | Established |
| **Workflow automation** | `scripts/` (`sync-task-index`, `validate-headers`, `rename-done-tasks`) + `task-workflow-integrity` tests + `workflow-automation-ci.yml` | Established, CI-enforced |
| **AI-facing docs** | `docs/AI-GUIDE.md`; `000-WORKFLOW-SYSTEM/` (taxonomy, operating agreement, scope guidelines, headers, templates, starter-packs) | Strong |
| **Specialized agents** (`.github/agents/`) | — none — | **Gap** |
| **Root agent onboarding** (`AGENTS.md` / `CLAUDE.md`) | — none — | **Gap** |
| **MCP write/fix surface** | — none (tools are read-only) — | **Gap** |

**Read:** the *process/workflow* AI layer is mature (skills, ledger automation,
CI-enforced integrity, rich templates). The *product* AI layer is newer and
read-only (MCP validate/why/graph). The biggest leverage is (a) making the repo
trivially onboard-able for any coding agent, and (b) turning DCV's MCP surface
from "report problems" into "help fix them."

---

## 2. Gaps ranked by impact × effort

| # | Capability | Impact | Effort | Notes |
| --- | --- | --- | --- | --- |
| G1 | Root **`AGENTS.md`** (agent onboarding: build/test, branch-per-task convention, MCP, where the ledger lives) | High | **Low** | Any agent (incl. Codex) wastes context rediscovering conventions each session |
| G2 | **AI-GUIDE MCP section** — how to connect `dcv-mcp` (Claude Desktop config + SDK) now that it ships | High | **Low** | The server exists but isn't documented for agent users |
| G3 | MCP **`list-constraints` / `explain`** tools — enumerate active constraints; plain-English "why this failed + what would satisfy it" | High | Low–Med | Turns raw violations into actionable guidance for agents |
| G4 | MCP **`suggest-fix`** tool — given a violation, propose token value(s) that satisfy it (e.g. nudge a color to hit contrast) | High | **Med** | Biggest product leap: validator → assistant. Reuses `set`/contrast math |
| G5 | MCP **write tools** (`set`/`patch`) behind explicit opt-in | Med | Med | Lets agents apply fixes; needs a safety/confirmation contract |
| G6 | **`.github/agents/`** — e.g. `constraint-author` (scaffold a new plugin + test) and `release-captain` (drive the tag-push release) | Med | Med | Codifies the two recurring expert flows |
| G7 | **PR validation bot** — comment DCV results on PRs touching tokens | Med | High | Strategic; depends on a hosted token source |

Out: speculative ML constraint inference, non-AI roadmap items.

---

## 3. Phased adoption roadmap

**Phase 1 — Quick wins (low effort, do first):** G1 `AGENTS.md`, G2 AI-GUIDE MCP
section, G3 MCP `list-constraints`/`explain`. All low-risk docs/additive-tool work;
each independently shippable; rollback = delete the file/tool.

**Phase 2 — Medium lifts (the product leap):** G4 `suggest-fix` (the headline
capability), then G5 write tools behind an opt-in flag, then G6 specialized agents.
Sequence G4 before G5 so suggestion is proven before granting write access.
Rollback per tool/agent; MCP tools are independently registrable.

**Phase 3 — Strategic:** G7 PR bot — only after a hosted/credential story exists
(ties to the same publishing/secret work as the v2.1.0 release).

---

## 4. Recommended follow-up tasks (traceability)

These convert the roadmap into discrete, schedulable tasks (numbers are the next
free slots after TASK-011):

- **TASK-012 (S, P2):** Add root `AGENTS.md` + an AI-GUIDE MCP-setup section (G1+G2).
- **TASK-013 (M, P2):** MCP `list-constraints` + `explain` + `suggest-fix` tools (G3+G4), read-only/derivation only.
- **TASK-014 (M, P3):** Opt-in MCP write tools (`set`/`patch`) with a confirmation contract (G5).
- **TASK-015 (M, P3):** `.github/agents/` — `constraint-author` and `release-captain` (G6).

Recommended order: 012 → 013 → 014/015. None block the v2.1.0 release; all are
post-release enhancements. Phase 1 (012, parts of 013) are the highest value-to-cost.
