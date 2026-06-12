# Workflows

Reusable process recipes for recurring project-management work.

## Purpose

Use this folder for repeatable ways of doing work that should not be copied into every task.

Recommended standards:

- Header: `../000-WORKFLOW-SYSTEM/headers/HEADER-WORKFLOW.md`
- Template: `../000-WORKFLOW-SYSTEM/templates/TEMPLATE-WORKFLOW.md`

Best practice for each workflow file:

- say when the workflow should and should not be used
- name the required outputs for each run
- list the evidence inventory or prerequisite inputs
- include decision rules when the workflow involves judgment rather than pure mechanics
- end with concrete verification, including fallback checks when normal tooling is unavailable

## Naming

Use lower-kebab-case names:

```text
release-closeout.md
documentation-drift-audit.md
dependency-upgrade-review.md
```

Keep workflow files unnumbered. Numbered executions belong in `tasks/`.
