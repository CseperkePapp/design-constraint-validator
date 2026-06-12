# Prompt: Test and Merge Task NNN

**Task:** [TASK-NNN](../tasks/TASK-NNN-name.md)
**Status:** active
**Branch:** `feature/task-NNN-description`

## Source

- agent: human
- model: N/A

---

## Pre-Merge Checklist

### 1. Build Verification

<!--
Your project's package manager is defined in PROJECT-WORKFLOW-OVERLAYS.md.
Replace <pm> below with your project's actual package manager (npm/pnpm/yarn/bun).
Your project's guardrail tools (if any) are also listed in the overlay.
-->

```bash
# Clean build
<pm> build

# Run tests
<pm> test

# Run project-specific guardrail tools (if any — see PROJECT-WORKFLOW-OVERLAYS.md)
# <pm> <guard-tool>
```

### 2. Manual Testing

<!--
Your project's manual testing surfaces are defined in PROJECT-WORKFLOW-OVERLAYS.md.
Common surfaces: web UI (multiple browsers), CLI commands, mobile app, API endpoints.
Replace the placeholders below with your project's surfaces.
-->

- [ ] **[Surface 1]** (e.g., web UI in `<pm> dev` → localhost:PORT)
  - [ ] Feature works as expected
  - [ ] No regressions in related areas
  - [ ] Console has no errors

- [ ] **[Surface 2]** (e.g., second UI mode, CLI, etc.)
  - [ ] Feature works as expected
  - [ ] Cross-surface consistency verified (if applicable)
  - [ ] No regressions in related areas

### 3. Documentation Verification

- [ ] Relevant docs updated
- [ ] Changelog entry accurate (`CHANGELOG.md`)
- [ ] Reference docs updated if needed
- [ ] Project-specific doc surfaces from `PROJECT-WORKFLOW-OVERLAYS.md` covered

### 4. Task Status

Verify task file is complete:

- [ ] Status: done
- [ ] Completed date added
- [ ] All acceptance criteria checked

---

## Create Pull Request

```bash
# Ensure all changes are committed
git status

# Push to remote
git push -u origin feature/task-NNN-description

# Create PR
gh pr create --title "Task NNN: [Description]" --body "$(cat <<'EOF'
## Summary

- [1-3 bullet points describing what this PR does]

## Changes

- [Change 1]
- [Change 2]

## Testing

- [ ] Build passes
- [ ] Manual testing on [Surface 1]
- [ ] Manual testing on [Surface 2]

## Task

See: `docs/project-management/tasks/TASK-NNN-name.md`

---

Co-Authored-By: <AI-MODEL> <noreply@<provider>.com>
EOF
)"
```

<!-- Replace <AI-MODEL> and <provider> with your current AI collaborator — see PROJECT-WORKFLOW-OVERLAYS.md -->

---

## Merge to Main

After PR is approved (or for solo development):

```bash
# Switch to main (or master, or whatever your project uses)
git checkout main

# Pull latest
git pull origin main

# Merge feature branch
git merge feature/task-NNN-description

# Push
git push origin main

# Delete feature branch (optional)
git branch -d feature/task-NNN-description
git push origin --delete feature/task-NNN-description
```

---

## Post-Merge

- [ ] Verify main builds: `<pm> build`
- [ ] Tag release if version was incremented: `git tag vX.Y.Z && git push --tags`

### Archive Completed Work

After merge is complete, archive the task and prompt files:

```bash
# Move completed task to archive
mv docs/project-management/tasks/TASK-NNN-name.md docs/project-management/archive/tasks/

# Move used prompts to archive (if your project tracks prompts)
mv docs/project-management/prompts/pNNN-tNNN-name.md docs/project-management/archive/prompts/

# Update index tables in both README.md files
```

**Important:** Only archive after merge to main. Archived files represent the final, shipped state.
