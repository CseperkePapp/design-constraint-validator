---
name: workflow-qa-evidence
description: Build QA checklists and verification evidence from acceptance criteria. Use for closeout, regression planning, and honest pass/fail reporting.
---

# Workflow QA Evidence

Use this skill when the work product is verification planning or test evidence capture.

## Read First

1. active task file and acceptance criteria
2. relevant test files and package scripts
3. any manual checklist template in the repo

## Workflow

1. Derive test cases directly from acceptance criteria.
2. Separate evidence into:
   - automated verification
   - manual verification
   - deferred or not run
3. Record concrete commands and outputs (or summaries) actually run.
4. Update task verification notes with truthful evidence.
5. If closeout is incomplete, state remaining gaps explicitly.

## Guardrails

- Never mark done based on assumed manual QA.
- Never claim full-suite pass if only targeted tests ran.
- Keep checklist steps reproducible by another contributor.

## Deliverables

- verification matrix or checklist
- command-level evidence summary
- task closeout notes that match evidence on disk
