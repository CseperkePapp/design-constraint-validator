# Repo agents

Specialized agent instruction files for DCV's two recurring expert flows. Each is
a plain Markdown file with a short YAML frontmatter block (`name`, `description`),
mirroring the `.github/skills/*/SKILL.md` convention. No runner enforces a
specific schema; these are human- and agent-readable playbooks that orchestrate
the repo's existing commands and guardrails — they do not add automation.

| Agent | Use when |
|-------|----------|
| [constraint-author](constraint-author.md) | Adding a new constraint plugin (new rule family) end-to-end. |
| [release-captain](release-captain.md) | Cutting an npm release via the tag-push flow. |

Both encode hard guardrails (constraint-author never edits verified color math;
release-captain never runs `npm publish` and never tags without approval). Read
the file before acting.
