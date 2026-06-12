# Header Template: Experiment

## Purpose

Use this header for documents that track **explorations, prototypes, and trials**.

## When to Use

- Prototype implementations
- Feature explorations
- Performance experiments
- A/B test documentation
- Research spikes
- "What if" investigations

## Template

```markdown
# [Experiment Title]

**Type:** Experiment
**Hypothesis:** [What we're testing - one sentence]
**Status:** active | concluded | abandoned
**Started:** YYYY-MM-DD
**Ended:** YYYY-MM-DD [when concluded/abandoned, or remove if active]
**Outcome:** pending | success | failure | inconclusive

---

[Experiment details, methodology, findings]
```

## Example

```markdown
# Dark mode via CSS variables only

**Type:** Experiment
**Hypothesis:** Dark mode can be implemented entirely through CSS variable swaps, with zero JavaScript logic beyond the toggle
**Status:** concluded
**Started:** 2026-03-01
**Ended:** 2026-03-15
**Outcome:** success

---

## Approach
...
```

## Field Definitions

| Field | Required | Values | Description |
|-------|----------|--------|-------------|
| Type | Yes | `Experiment` | Document category |
| Hypothesis | Yes | Free text | What we're testing (one sentence) |
| Status | Yes | `active`, `concluded`, `abandoned` | Experiment state |
| Started | Yes | `YYYY-MM-DD` | When experiment began |
| Ended | Conditional | `YYYY-MM-DD` | Required when not `active` |
| Outcome | Yes | `pending`, `success`, `failure`, `inconclusive` | Result |

## Outcome Definitions

- **pending** - Experiment still running
- **success** - Hypothesis confirmed, approach adopted
- **failure** - Hypothesis disproven, approach rejected
- **inconclusive** - Not enough data or blocked by external factors
