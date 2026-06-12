# Document Taxonomy

**Type:** Canon
**Version:** 1.0.1
**Authority:** canonical
**Verified:** 2026-06-11
**Supersedes:** N/A

---

## Purpose

Define how to categorize all project documentation into a coherent taxonomy that supports AI-assisted workflows, provenance tracking, and clear information architecture.

> **Reusable scope:** This taxonomy is part of the portable workflow kernel. The categories, header expectations, and decision tree below are intended to work across projects. Examples are illustrative, not required filenames.

---

## The Taxonomy

```text
PROJECT
├── Intent          WHY   - goals, vision, desired outcomes
├── Canon           TRUTH - authoritative definitions, sources of truth
├── Questions       OPEN  - investigations, unknowns, blockers
├── Decisions       CHOSE - choices made + rationale
├── Experiments     TRY   - explorations, prototypes, trials
└── Outputs         DONE  - tasks, prompts, deliverables
```

---

## Category Details

> **Note on examples:** The example tables below are illustrative. Actual document names vary by project — your project's Canon docs might be `GLOSSARY.md`, `API-REFERENCE.md`, `SCHEMA.md`, `types.ts`, or anything else that serves as authoritative source of truth. The category — not the filename — is what matters.

### Intent

**Question answered:** "What are we trying to achieve?"

**Purpose:** Documents that define goals, vision, principles, and desired outcomes. These establish the "north star" for the project.

**Characteristics:**

- Define what success looks like
- Establish constraints and boundaries
- Rarely change once established
- Often referenced by other documents

**Examples:**

| Document | Why It's Intent |
| -------- | --------------- |
| CORE-PRINCIPLE.md | Defines the sacred architectural invariants |
| Future roadmaps | Define where the project is going |
| Feature specs (high-level) | Define what a feature should achieve |
| Project vision docs | Define the overall purpose |

**Header template:** [HEADER-INTENT.md](headers/HEADER-INTENT.md)

---

### Canon

**Question answered:** "What is the authoritative definition of X?"

**Purpose:** Documents that serve as sources of truth. When there's a disagreement about terminology, types, or conventions, Canon documents are the final word.

**Characteristics:**

- Versioned explicitly
- Rarely duplicated (one source of truth)
- Other documents derive from these
- Changes require careful consideration

**Examples:**

| Document | Why It's Canon |
| -------- | -------------- |
| GLOSSARY.md | Authoritative terminology definitions |
| types.ts or schema.ts | Authoritative type/schema definitions |
| API-REFERENCE.md | Authoritative API surface |
| CLAUDE.md / AGENTS.md | Authoritative AI collaboration instructions |
| DEFAULTS.md | Authoritative default values |

**Header template:** [HEADER-CANON.md](headers/HEADER-CANON.md)

---

### Questions

**Question answered:** "What don't we know yet?"

**Purpose:** Documents that track open investigations, unknowns, and blockers. These make uncertainty explicit and trackable.

**Characteristics:**

- Have a clear status (open → investigating → resolved)
- Track what they're blocking
- Get resolved and closed (not deleted)
- May spawn tasks or decisions when resolved

**Examples:**

| Document | Why It's a Question |
| -------- | ------------------- |
| open-questions.md | Collection of unresolved unknowns |
| Investigation docs | Deep dives into specific unknowns |
| "Why does X happen?" docs | Technical mysteries being explored |

**Header template:** [HEADER-QUESTION.md](headers/HEADER-QUESTION.md)

---

### Decisions

**Question answered:** "What did we choose and why?"

**Purpose:** Documents that record choices made, their rationale, alternatives considered, and impact. These provide historical context for future maintainers.

**Characteristics:**

- Record the decision, not just the outcome
- Include alternatives that were rejected
- Explain the "why" not just the "what"
- Never deleted (even if decision is reverted)

**Examples:**

| Document | Why It's a Decision |
| -------- | ------------------- |
| DECISION-LOG.md | Chronological decision record |
| Architecture Decision Records (ADRs) | Formal decision documentation |
| "Why we chose X over Y" docs | Technology/approach choices |

**Header template:** [HEADER-DECISION.md](headers/HEADER-DECISION.md)

---

### Experiments

**Question answered:** "What are we trying to find out?"

**Purpose:** Documents that track explorations, prototypes, and trials. These capture learning from things we tried, regardless of outcome.

**Characteristics:**

- Have a hypothesis being tested
- Have a clear outcome (success/failure/inconclusive)
- May lead to decisions or production code
- Valuable even when they fail (learning captured)

**Examples:**

| Document | Why It's an Experiment |
| -------- | ---------------------- |
| Prototype READMEs | Document what the prototype tested |
| Research spikes | Time-boxed investigations |
| A/B test documentation | Comparison experiments |
| "What if we tried X?" docs | Exploratory work |

**Header template:** [HEADER-EXPERIMENT.md](headers/HEADER-EXPERIMENT.md)

---

### Outputs

**Question answered:** "What work needs to be done / was done?"

**Purpose:** Documents that represent work artifacts — things to be done (tasks), instructions for AI (prompts), and deliverables.

**Characteristics:**

- Have clear status (todo → done)
- Are actionable or were actioned
- Get archived when complete
- Include provenance (who created them)

**Sub-types:**

| Sub-type | Purpose | Header |
| -------- | ------- | ------ |
| **Task** | Define a unit of work | [HEADER-TASK.md](headers/HEADER-TASK.md) |
| **Prompt** | Instructions for AI execution | [HEADER-PROMPT.md](headers/HEADER-PROMPT.md) |
| **Brief** | Structured brief for human execution | [HEADER-BRIEF.md](headers/HEADER-BRIEF.md) |
| **Report** | Written output from a task run | [HEADER-REPORT.md](headers/HEADER-REPORT.md) |
| **Workflow** | Reusable recurring process recipe | [HEADER-WORKFLOW.md](headers/HEADER-WORKFLOW.md) |

**Examples:**

| Document | Why It's an Output |
| -------- | ------------------ |
| Task specs | Define work to be done |
| Prompts | Actionable briefs for AI |
| Generated configs | Produced artifacts |
| Completion reports | Record of finished work |

---

## Decision Tree: How to Categorize a Document

```text
Is this document defining goals, vision, or constraints?
├── YES → Intent
└── NO ↓

Is this document the authoritative source for some definition?
├── YES → Canon
└── NO ↓

Is this document tracking something we don't know yet?
├── YES → Question
└── NO ↓

Is this document recording a choice that was made?
├── YES → Decision
└── NO ↓

Is this document exploring or testing something?
├── YES → Experiment
└── NO ↓

Is this document a task, prompt, or deliverable?
├── YES → Output
└── NO → Consider if it needs to exist, or which category fits best
```

---

## Category Relationships

Documents often reference each other across categories:

```text
Intent ──────────────────────────────────────────────────────────┐
   │                                                             │
   │ "We want to achieve X"                                      │
   ↓                                                             │
Questions ────────────────────────────────────────────────────┐  │
   │                                                          │  │
   │ "How do we achieve X?"                                   │  │
   ↓                                                          │  │
Experiments ──────────────────────────────────────────────┐   │  │
   │                                                      │   │  │
   │ "We tried approach A and B"                          │   │  │
   ↓                                                      │   │  │
Decisions ────────────────────────────────────────────┐   │   │  │
   │                                                  │   │   │  │
   │ "We chose approach A because..."                 │   │   │  │
   ↓                                                  │   │   │  │
Outputs (Tasks/Prompts) ──────────────────────────┐   │   │   │  │
   │                                              │   │   │   │  │
   │ "Implement approach A"                       │   │   │   │  │
   ↓                                              │   │   │   │  │
Canon ←───────────────────────────────────────────┴───┴───┴───┴──┘
   │
   │ Implementation becomes the new source of truth
   │ which informs future Intent
   ↓
(cycle continues)
```

---

## Provenance Requirements by Category

| Category | Provenance Required? | Why |
| -------- | -------------------- | --- |
| Intent | Optional | Usually human-authored, stable |
| Canon | Optional | Versioned, authorship less critical |
| Questions | Optional | Focus is on the question, not who asked |
| Decisions | Recommended | Useful to know who decided |
| Experiments | Recommended | Useful to know who ran the experiment |
| Outputs (Task/Prompt) | **Required** | Critical to track human vs AI authorship |

---

## Migration Notes

### Existing Documents

Existing documents (especially in archives) don't need to be migrated to new headers. The taxonomy applies to:

1. New documents going forward
1. Documents being actively revised
1. Documents in `docs/project-management/`

### When Categories Overlap

Some documents could fit multiple categories. Use this priority:

1. If it defines what we want → **Intent**
1. If it's the authoritative reference → **Canon**
1. If it records a choice → **Decision**
1. If it's exploring unknowns → **Question** or **Experiment**
1. If it's actionable work → **Output**

When truly ambiguous, pick the category that answers "what will someone look for when they need this document?"
