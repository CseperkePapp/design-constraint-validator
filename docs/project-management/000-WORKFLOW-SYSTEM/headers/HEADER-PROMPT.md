# Header Template: Prompt

## Purpose

Use this header for **AI prompts** - actionable briefs for AI assistants.

## When to Use

**Only create prompts when you want an AI to execute work.**

Create a prompt when:

- You want an **AI assistant to execute** the work (not a human)
- The task requires **structured context** (background, constraints, verification)
- You need a **reusable execution brief** that can be run multiple times
- The work is **complex enough** that free-form chat would lose context

Do NOT create a prompt when:

- A human will complete the task manually
- The task is simple enough to describe in conversation
- You're just documenting what needs to be done (that's what tasks are for)

**Key distinction:**

- **Task/Subtask** = WHAT needs to be done (specification)
- **Prompt** = HOW to tell AI to do it (execution brief)

## Template

```markdown
# Prompt NNN: [Name]

**Task:** [TASK-NNN](path/to/task.md) [or "Standalone" if no parent task]
**Status:** active | used | superseded

## Source
- agent: human | Claude | ChatGPT | mixed
- model: [model-id or N/A]

---

## Context

[Background information the AI needs]

## Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Constraints

- [Constraint 1]
- [Constraint 2]

## Verification

[How to verify the work is complete]
```

## Example

```markdown
# Prompt 042: Add Dark Mode Toggle

**Task:** [TASK-017](../tasks/TASK-017-dark-mode.md)
**Status:** active

## Source
- agent: human
- model: N/A

---

## Context

The app currently supports only light mode. Users have requested a dark mode toggle.
Current state: theme is hardcoded in `src/theme.ts`.

## Steps

1. Extract theme values into CSS variables
2. Create a `ThemeToggle` component with a button that swaps a `data-theme` attribute
3. Add dark mode values as `[data-theme="dark"]` overrides
4. Persist selection to localStorage
5. Test with keyboard navigation and reduced-motion preferences

## Constraints

- No JavaScript beyond toggle logic; all visual changes via CSS
- Must respect `prefers-color-scheme` as initial default
- No hardcoded colors in component files

## Verification

- [ ] Build passes
- [ ] Toggle works in multiple browsers
- [ ] Selection persists across page reload
- [ ] Keyboard accessible (Enter/Space)
```

## Field Definitions

| Field | Required | Values | Description |
| ----- | -------- | ------ | ----------- |
| Prompt Number | Yes | `pNNN` | Sequential prompt number |
| Task | Yes | Link to task or "Standalone" | Parent task this prompt serves |
| Status | Yes | `active`, `used`, `superseded` | Current state |
| Source.agent | Yes | `human`, `Claude`, `ChatGPT`, `Gemini`, `mixed` | Who wrote this |
| Source.model | Yes | Model ID or `N/A` | Specific model if AI |

## Relationship to Tasks

- **One task can have multiple prompts** (e.g., investigation prompt, then implementation prompt)
- **Prompts explicitly link to their parent task** via the Task field
- **Standalone prompts** are allowed for utility/reusable prompts (e.g., code review prompt)

## Prompt Numbering

**Format:** `pNNN-tNNN-stN-title.md`

- `pNNN` - Sequential prompt number (p000, p001, p002...)
- `tNNN` - Task number reference
- `stN` - Subtask number (optional, omit if parent task)
- `title` - Descriptive name (kebab-case)

**Examples:**

- `p042-t017-dark-mode-toggle.md` - Prompt 42, for Task 017
- `p043-t018-st2-error-boundary.md` - Prompt 43, for Task 018.2
- `p044-standalone-code-review.md` - Prompt 44, standalone

Check `prompts/README.md` for next available number.
