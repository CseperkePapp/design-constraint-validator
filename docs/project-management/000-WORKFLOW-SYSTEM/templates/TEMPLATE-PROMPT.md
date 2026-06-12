# Prompt NNN: [Prompt Name]

**Task:** [TASK-NNN](../tasks/TASK-NNN-name.md)
**Status:** active

## Source

- agent: human | Claude | ChatGPT | Gemini | mixed
- model: <!-- model-id or N/A -->

---

## Context

<!-- Background information the AI needs to complete this work -->

---

## Steps

### Step 1: [First Step]

<!-- Instructions for step 1 -->

---

### Step 2: [Second Step]

<!-- Instructions for step 2 -->

---

### Step N: Verify

<!--
Your project's package manager is defined in PROJECT-WORKFLOW-OVERLAYS.md.
Replace <pm> below with your project's actual package manager (npm/pnpm/yarn/bun).

Windows note: Command blocks use bash formatting for readability.
On Windows, run them in PowerShell; if you add bash-specific syntax
(e.g., mkdir -p, export), include a PowerShell equivalent.
-->

```bash
# Build and check for errors
<pm> build

# Run tests (if applicable)
<pm> test

# Test manually
<pm> dev
```

<!-- Manual verification steps -->

---

### Step N+1: Update Status

After implementation is verified:

1. Update task status in task file (`Status: done`, add `Completed:` date)
1. Update task index table in `docs/project-management/tasks/README.md`
1. Update prompt status in this file (`Status: used`)
1. Update prompt index table in `docs/project-management/prompts/README.md` (if your project uses prompt tracking)
1. If `docs/project-management/status/` exists, append an entry to the current month file (`YYYY-MM.md`)

Your project's overlay may define additional closeout steps — see `PROJECT-WORKFLOW-OVERLAYS.md`.

---

## Constraints

- <!-- Constraint 1 -->
- <!-- Constraint 2 -->

---

## Post-Completion Checklist

- [ ] Implementation complete and verified
- [ ] Task status updated to `done`
- [ ] Prompt status updated to `used`
- [ ] Index tables updated
- [ ] Project-specific closeout steps from PROJECT-WORKFLOW-OVERLAYS.md completed
- [ ] Commit created with proper message

---

## Commit Message Template

```text
feat: [short description]

Task NNN: [Task Name]

- [Change 1]
- [Change 2]

Co-Authored-By: <AI-MODEL> <noreply@<provider>.com>
```

<!-- Replace <AI-MODEL> with your current AI collaborator (e.g., "Claude Opus 4.7") -->
<!-- Replace <provider> with anthropic, openai, google, etc. -->
