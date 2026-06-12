# Task 015 CLAUDE: Specialized repo agents (`.github/agents/`)

**Status:** todo
**Priority:** P3
**Created:** 2026-06-12
**Effort:** M
**Dependencies:** TASK-012
**Phase:** AI Enablement
**Branch:** `task/015-specialized-agents`

## Coordination

- Implementation owner: Claude.
- Review gate: Codex review sweep before merge.
- Collaboration mode: solo-sequential. This task may run after TASK-014 or
  independently once the current active implementation branch is clear.

## Source

- agent: Claude (claude-opus-4-8)
- origin: AI-CAPABILITY-ASSESSMENT.md gap G6

---

## Summary

Add two specialized agent instruction files under `.github/agents/` that codify
DCV's two recurring expert flows, so they can be invoked deliberately instead of
re-derived each time:

1. **`constraint-author`** - scaffold a new constraint plugin end-to-end.
2. **`release-captain`** - drive the tag-push release safely.

---

## Background

The process/workflow AI layer is mature (skills, ledger automation), but there
are no specialized agents (`.github/agents/` does not exist). Two flows recur
and have sharp, well-documented rules that an agent can encapsulate: authoring a
constraint plugin (engine + registry + config schema + tests, math untouched) and
running the release (tag-push only, pre-publish gates).

## Readiness Review

- `.github/agents/` does not currently exist.
- `AGENTS.md` is the repo-level onboarding surface and should link to these
  agents after they are added.
- The exact runner format is not enforced by the repo today. Use Markdown files
  with a short YAML frontmatter block only if the chosen runner expects it;
  otherwise use plain Markdown instruction files. Record the format decision in
  the task closeout.
- These agents should orchestrate existing commands and guardrails. They should
  not introduce release or validation behavior changes.

---

## Scope

### In Scope

- **`.github/agents/constraint-author.md`** - an agent that, given a constraint
  idea, scaffolds: the plugin in `core/constraints/`, registration in
  `cli/constraint-registry.ts`, any `cli/config-schema.ts` fields, a fixture, and
  a test; runs `npm run build && npm test`.
- Constraint-author guardrails:
  - Never edit `core/color.ts` or existing verified math.
  - Prefer additive changes.
  - One branch per task.
  - Include tests for the new constraint and any config discovery path.
- **`.github/agents/release-captain.md`** - an agent that runs the release
  checklist: confirm clean `main`, `npm run check`, `npm audit --omit=dev` clean,
  pre-publish blockers cleared (NPM_TOKEN/OIDC), `npm version`, push tag, watch
  `publish.yml`, and verify the published registry package.
- Release-captain guardrails:
  - Tag-push only.
  - Never run manual `npm publish`.
  - Never publish without audit and credential/provenance gates.
  - Stop and report at any missing credential or failed gate.
- Document both in `AGENTS.md`.
- Add a short `.github/agents/README.md` if useful for discovery.

### Out Of Scope

- New MCP tools (TASK-014).
- Changing validation or release behavior; agents orchestrate existing commands
  only.
- Adding a new agent runner, GitHub Action, or automation service.

---

## Acceptance Criteria

- [ ] `.github/agents/constraint-author.md` and
      `.github/agents/release-captain.md` exist with accurate tools, guardrails,
      and step lists matching the current repo.
- [ ] Each references the real commands/paths, verified against `package.json`
      scripts and the source tree.
- [ ] `AGENTS.md` lists the agents and when to use them.
- [ ] The chosen agent-file format is documented in the task closeout and does
      not conflict with existing `.github/skills/` conventions.
- [ ] Dry-run sanity: a constraint-author scaffold plan compiles/tests in a
      throwaway or documented dry-run path; a release-captain run stops at the
      credential gate without publishing.
- [ ] `npm run workflow:test` passes.
- [ ] Codex review report is created before merge, with findings addressed or
      explicitly deferred.

## Notes

- TASK-015 pairs well with TASK-014, but does not depend on it.
- Keep agent instructions short enough to be usable, but concrete enough to
  prevent release or math-safety mistakes.
