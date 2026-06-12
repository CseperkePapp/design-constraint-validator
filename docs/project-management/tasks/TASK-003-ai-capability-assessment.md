# Task 003: AI Capability Assessment For DCV

**Status:** planning
**Priority:** P2
**Created:** 2026-06-11
**Updated:** 2026-06-11
**Completed:** <!-- YYYY-MM-DD when done -->
**Parent:** <!-- remove if standalone -->
**Effort:** M
**Dependencies:** TASK-002
**Phase:** Assessment
**Branch:** `task/003-ai-capability-assessment`

## Source

- agent: human + copilot
- model: GPT-5.3-Codex

---

## Summary

Assess which AI supports would most improve quality and delivery speed in DCV, including tools, MCP surfaces, skills, agents, and workflow automation.

---

## Background

DCV now has baseline workflow automation, reusable skills, and assessment starter templates. The next step is a structured AI capability assessment to prioritize high-value additions and avoid scattered improvements.

---

## Scope

### In Scope

- Inventory existing AI supports in repo
- Identify high-impact gaps
- Propose prioritized adoption roadmap

### Out of Scope

- Full implementation of all recommendations
- Non-AI roadmap planning

---

## Acceptance Criteria

- [ ] Current-state AI capability inventory is documented.
- [ ] Gaps are ranked by impact and implementation effort.
- [ ] A phased recommendation plan is produced.

---

## Documentation & Versioning Impact

### Always review on closeout

- [ ] This task file (`Status`, `Completed`, completion notes, verification)
- [ ] `docs/project-management/tasks/README.md`
- [ ] Project status surface (if used)

### Update if this task changes them

- [ ] Root `package.json` and any affected package versions
- [ ] `CHANGELOG.md`
- [ ] `DECISION-LOG.md`
- [ ] Canon/reference docs and templates touched by the selected recommendations
- [ ] Wiki/contributor docs

---

## Implementation Notes

Starter templates available:

- `docs/project-management/000-WORKFLOW-SYSTEM/templates/starter-packs/TEMPLATE-TASK-AI-CAPABILITY-ASSESSMENT.md`
- `docs/project-management/000-WORKFLOW-SYSTEM/templates/starter-packs/TEMPLATE-PROMPT-AI-CAPABILITY-ASSESSMENT.md`

Candidate focus areas:

- workflow guardrails and validation automation
- AI-facing docs quality and discoverability
- MCP tool surface for agent-assisted workflows
- specialized repo skills and agents

---

## AI Context Load Analysis

### Pre-read file budget

| Category | Files | Lines (approx) |
| -------- | ----- | -------------- |
| Task docs | `TASK-002`, task index | ~220 |
| Source files to modify | this task file, possible follow-up tasks | ~200 |
| Source files to understand | `docs/AI-GUIDE.md`, `.github/skills/`, `package.json` | ~450 |
| **Total** | | ~870 |

### Risk flags

- [x] **Source-of-truth scattering**
- [ ] **Prop/API discovery**
- [ ] **Cross-cutting contracts**
- [ ] **Many implementation steps**
- [ ] **Guardrail amnesia**
- [ ] **Missing components**

### Mitigations

- Use one inventory table covering tools, MCP, skills, agents, and workflows.
- Convert recommendations into explicit follow-up tasks to preserve traceability.

---

## Verification Notes

- Deferred / Not Run:
  - Assessment execution pending

---

## Related

- `docs/project-management/tasks/TASK-002-repo-review-and-task-sequencing.md`
- `docs/project-management/000-WORKFLOW-SYSTEM/templates/starter-packs/README.md`
