# AGENTS.md — working in this repo

Onboarding for AI coding agents (Claude, Codex, etc.). Read this first; it saves
you from rediscovering the conventions every session. Human contributors: see
[CONTRIBUTING.md](CONTRIBUTING.md).

## What DCV is

`design-constraint-validator` (DCV) is a CLI + library that validates design
tokens against **mathematical constraints** — WCAG contrast (with alpha
compositing), monotonic type/lightness scales, thresholds, cross-axis rules. The
engine math lives in `core/` and is verified; treat `core/color.ts` and
`core/constraints/*` as load-bearing.

## Commands

```bash
npm ci                  # install (CI uses --ignore-scripts)
npm run build           # tsc → emits .js/.d.ts next to sources
npm test                # vitest (excludes compiled **/*.test.js)
npm run lint            # eslint
npm run typecheck       # tsc --noEmit
npm run check           # typecheck + lint + build + test (the full gate)
```

> Task-ledger integrity checks live in the maintainer's local-only
> workflow-automation system (`src/`, `scripts/` — gitignored) and are not part
> of the public gate. The tracked `.githooks/pre-push` runs them only when those
> files are present, so external clones are unaffected.

## Critical gotchas

- **Build before tests that spawn the CLI.** Compiled `.js` is **gitignored**
  (not committed). `test/clean-room.test.ts` and the CLI tests run
  `node cli/index.js`, which doesn't exist until `npm run build`. `npm run check`
  and CI build first; a bare `npm test` on a clean tree will fail those. When in
  doubt, `npm run build` first.
- **Don't commit build artifacts.** `cli/**`, `core/**`, `adapters/**`, `mcp/**`,
  `test/**`, `scripts/**`, `src/**` `.js`/`.d.ts`/`.map` are ignored by design
  (the only intentional tracked JS is `eslint.config.js` and `tokens/tokens.schema.*`).
- **Commits need a task reference.** A `commit-msg` hook requires `TASK-NNN` in the
  message (or an escape tag like `[no-task: …]`). Hooks live in `.githooks`
  (`git config core.hooksPath .githooks`).
- End commit messages with the project co-author line, e.g.
  `Co-Authored-By: <model> <noreply@<provider>.com>`.

## Workflow conventions (one branch per task)

- **One branch per task**, never bundle tasks: `task/NNN-short-description`. Base
  on latest `main`, or stack on a dependency's branch. See
  `docs/project-management/PROJECT-WORKFLOW-OVERLAYS.md` → Branch Naming.
- **Solo-sequential**: drive one task to merge before the next; no parallel agent
  implementation on concurrent branches. Codex is brought in deliberately for a
  scoped task or review — see PROJECT-WORKFLOW-OVERLAYS.md → Collaboration Model.
- The **task ledger** is `docs/project-management/tasks/` (active + `DONE-TASK-…`
  for completed). Update status, check acceptance boxes, and run
  `npm run task:sync` + `npm run rename-done-tasks` on closeout. Each task gets a
  `docs/project-management/workflows/TEST-AND-MERGE-NNN-*.md` record at merge.
- The full workflow system lives under `docs/project-management/000-WORKFLOW-SYSTEM/`.

## Releasing

Tag-push only: `npm version <patch|minor|major>` → `git push --tags` triggers
`.github/workflows/publish.yml` (build, check, publish with provenance, then
verify on the registry). Never `npm publish` by hand. See [RELEASE.md](RELEASE.md).

## MCP server

DCV ships an MCP server (`dcv-mcp`, `mcp/`) exposing six read-only tools over
stdio: `validate`, `why`, `graph`, and the derivation tools `list-constraints`,
`explain`, and `suggest-fix` (violations → verified suggestions, no writes).
Setup and the agent loop are documented in
[docs/AI-GUIDE.md](docs/AI-GUIDE.md#mcp-server-dcv-mcp).

## Specialized agents

Two recurring expert flows are codified as agent playbooks in
[.github/agents/](.github/agents/) (plain Markdown + `name`/`description`
frontmatter, mirroring `.github/skills/`):

- **[constraint-author](.github/agents/constraint-author.md)** — scaffold a new
  constraint plugin end-to-end (core plugin → registry → schema → fixture → test).
  Guardrail: never touches `core/color.ts`/verified math; additive only.
- **[release-captain](.github/agents/release-captain.md)** — drive an npm release
  via the tag-push flow. Guardrail: tag-push only, never `npm publish` by hand,
  never tag without maintainer approval, stop at any failed gate.

## Where to read more

- [docs/AI-GUIDE.md](docs/AI-GUIDE.md) — commands, JSON schema, MCP, programmatic API
- [docs/CLI.md](docs/CLI.md), [docs/Configuration.md](docs/Configuration.md),
  [docs/Constraints.md](docs/Constraints.md), [docs/Adapters.md](docs/Adapters.md)
- [docs/project-management/AI-CAPABILITY-ASSESSMENT.md](docs/project-management/AI-CAPABILITY-ASSESSMENT.md) — AI roadmap
