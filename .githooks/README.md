# Git Hooks

Repo-owned git hooks for the optional workflow automation kit.

Not active until you point git at this folder:

```bash
git config core.hooksPath .githooks
```

## `commit-msg`

Rejects commits that do not reference a task or an explicit audited escape.

Accepted patterns:

- `TASK-123`
- `DONE-TASK-123.1`
- `[no-task: short reason]`

## `pre-push`

Runs a fast local pre-flight for the workflow automation layer:

1. `npx tsc -p tsconfig.workflow-automation.json --noEmit`
1. `npx tsx scripts/validate-headers.ts`
1. `npx vitest run src/__tests__/task-workflow-integrity.test.ts src/__tests__/sync-task-index.test.ts`

Skip once when needed with `git push --no-verify`.