# Task 011 CODEX: DCV - system code review remediation

**Status:** done
**Priority:** P1
**Created:** 2026-06-12
**Completed:** 2026-06-12
**Effort:** M
**Dependencies:** TASK-004, TASK-006, TASK-009
**Phase:** Review remediation
**Branch:** `task/011-system-code-review-remediation`

## Source

- agent: human + Codex
- model: GPT-5 Codex

---

## Summary

Address the system-level findings from the 2026-06-12 Codex code review sweep.
The review found no reason to stop the completed TASK-009 merge, but it did find
several integration risks that should be handled as a scheduled remediation task
rather than uncoordinated parallel edits.

---

## Context

The review covered the implemented DCV task series across core validation, CLI
commands, adapters, workflow automation, publishing, tests, and task docs. The
highest-risk issues are at system boundaries:

- release automation still has manual-release remnants after TASK-006;
- CLI configuration docs/types promise options and file formats the command
  surface does not actually support;
- local publish lifecycle order can run tests before compiled CLI artifacts
  exist;
- token alias parsing is narrower than the token schema and replacement regexes
  are not escaped;
- workflow automation CI is less hardened than the main CI;
- DTCG normalization changed the meaning of `FlatToken.raw`.

## Scope

1. **Release flow cleanup**
   - Remove or rewrite `.github/workflows/release-reminder.yml` so it no longer
     instructs manual `npm publish` or says automated publishing is disabled.
   - Update `RELEASE.md` to describe `.github/workflows/publish.yml`, the
     tag-driven flow, and the current owner follow-ups.
   - Decide whether `.github/workflows/sbom.yml` should remain release-event
     driven or align with the tag-driven release flow.

2. **CLI/config contract**
   - Register `--config` where documented, or remove the documentation claim.
   - Decide whether `dcv.config.js` is supported. If yes, implement ESM loading;
     if no, remove it from discovery/docs.
   - Add tests for `dcv validate --config <path>`, `.dcvrc.json`, and
     `package.json` `"dcv"` fallback.
   - Review whether config schema should preserve supported WCAG fields such as
     `backdrop`.

3. **Publish lifecycle order**
   - Make `prepublishOnly` safe from a clean checkout now that compiled source
     artifacts are not committed.
   - Avoid relying on previously built ignored files for tests that spawn
     `cli/index.js`.

4. **Alias/ref parser hardening**
   - Bring `core/flatten.ts` reference matching into alignment with
     `tokens/tokens.schema.ts` alias syntax, including underscores.
   - Escape reference IDs before building replacement regexes.
   - Add regression tests for IDs like `{foo_bar}` and similar IDs such as
     `{foo.bar}` / `{fooXbar}` in the same value.

5. **Raw value semantics**
   - Decide whether `FlatToken.raw` should preserve the original `$value` object
     for DTCG inputs or be documented/renamed as normalized raw.
   - Update `why` output/tests/docs to match the chosen semantics.

6. **Workflow hardening**
   - Pin actions in `.github/workflows/workflow-automation-ci.yml` to SHAs, like
     the main CI.
   - Use `npm ci --ignore-scripts` unless workflow automation explicitly needs
     install scripts.

7. **Small cleanup candidates**
   - Either implement/remove the experimental `dcv graph diff` intercept that
     points at missing `scripts/graph-diff.ts`.
   - Fix `core/image-export.ts` command discovery for Windows `dot.exe`, or
     document the graceful fallback limitation.

## Out of scope

- New features such as the MCP server.
- Changing validation semantics unrelated to the listed findings.
- Publishing `v2.1.0`; this task should prepare the repo, not tag or publish.

## Acceptance criteria

- [x] Release docs and workflows describe one coherent release path.
- [x] `--config` behavior is either implemented and tested or removed from docs.
- [x] `dcv.config.js` support is either implemented and tested or removed from docs.
- [x] `prepublishOnly` works from a clean checkout without preexisting ignored
      build artifacts.
- [x] Alias parsing supports the documented/schema-valid reference syntax and
      no longer over-replaces unescaped dot-containing IDs.
- [x] `FlatToken.raw` semantics are explicit and covered by tests/docs.
- [x] Workflow automation CI follows the same action-pinning and install-script
      posture as main CI, or the exception is documented.
- [x] Findings are verified with targeted tests plus `npm run workflow:test`.

---

## Resolution (2026-06-12, Codex)

- Added the documented `--config` CLI option and pinned explicit config,
  missing-config failure, `.dcvrc.json`, and `package.json` `"dcv"` discovery
  with clean-room tests.
- Chose JSON-only config for the synchronous CLI/API boundary; removed
  `dcv.config.js` from discovery and updated docs accordingly.
- Preserved `backdrop` through config validation.
- Made `npm run check` build before tests while excluding generated `.test.js`
  files, so `prepublishOnly` no longer depends on stale ignored build output and
  tests still run once.
- Hardened alias parsing: underscores now match the schema, and reference IDs are
  escaped before replacement.
- Restored `FlatToken.raw` to mean the original `$value`, including structured
  DTCG objects, while `value` remains the normalized engine value.
- Hardened workflow automation CI to pinned actions and `npm ci --ignore-scripts`.
- Aligned SBOM generation with version tags and documented release/SBOM behavior.
- Removed the dead `dcv graph diff` intercept for the missing `scripts/graph-diff.ts`
  helper, and fixed Windows `.exe` lookup for graph image export.

Verification:

```bash
npm run check
npm run workflow:test
```
