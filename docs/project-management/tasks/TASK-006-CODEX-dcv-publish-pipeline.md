# Task 006 CODEX: DCV — diagnose and fix the silent release pipeline

**Status:** todo
**Priority:** P1
**Created:** 2026-06-11
**Effort:** S
**Dependencies:** none
**Phase:** DCV v2.1.0
**Branch:** `task/006-publish-pipeline`

## Source

- agent: human + Claude
- model: claude-opus-4-8

---

## Summary

Diagnose why v2.0.2 was tagged and committed but never reached npm, then converge on exactly **one** canonical release flow (with a registry-verification step) so a release can never silently fail to publish again.

**Sequencing:** must land **before** the v2.1.0 release from TASK-004 — otherwise that release may silently not happen the same way v2.0.2 didn't. Effort is mostly reading; the fix is likely small.

---

## Context (verified 2026-06-11)

- npm `latest` for `design-constraint-validator` is **2.0.1** (published 2025-11-21).
- The repo has tags `v2.0.0`, `v2.0.1`, `v2.0.2` — **v2.0.2 was tagged and committed ("2.0.2", "chore: prepare for v2.0.2 release", release notes) but never reached npm.**
- `.github/workflows/` contains `publish.yml` plus `ci.yml`, `sbom.yml`, `release-reminder.yml`, `semantic-pr.yml` — so publish automation *exists* and didn't fire (or fired and failed) for 2.0.2.
- The package's release scripts (`release:patch` etc.) end with `echo '⚠️ Now run: npm publish'` — suggesting the intended flow may be manual-after-tag, with `publish.yml` possibly added later and never reconciled with that flow.

## Scope

1. **Read `publish.yml`:** what triggers it (tag push? release creation? manual dispatch?), what credentials it expects (`NPM_TOKEN` secret — does it exist in repo settings? has it expired? npm classic token vs granular/trusted publishing?).
2. **Check the GitHub Actions history** for the v2.0.2 tag push: did the workflow run and fail (red run = read the log), or never trigger (wrong event filter, e.g. expects `release: published` but only a tag was pushed)?
3. **Decide ONE canonical release flow** and delete the other half: either (a) tag push → `publish.yml` does everything (preferred: zero manual steps, fits the no-recurring-admin constraint — consider npm **trusted publishing / OIDC** so no long-lived token can expire silently), or (b) fully manual `npm publish` and delete/disable `publish.yml` so it can't half-exist. Update the `release:*` script echo lines to match whichever flow wins.
4. **Resolve 2.0.2's limbo:** the unpublished tag's content (supply-chain CI hardening) will ride into the next release — fine. Decide whether 2.0.2 ever publishes (recommend: no — skip to 2.1.0 from the fix task, note it in CHANGELOG: "2.0.2 was tagged but never published; its changes ship in 2.1.0").
5. **Add a success check** to the chosen flow: a final workflow step that polls the npm registry for the just-published version and fails loudly if absent — releases must never silently not happen again.

## Out of scope

The actual 2.1.0 release content (fix task), provenance/SLSA attestations beyond what trusted publishing gives for free, changing the SBOM workflow.

## Acceptance criteria

- [ ] Root cause for the missing 2.0.2 publish identified and written down (one paragraph in the task notes or CHANGELOG).
- [ ] Exactly one release flow exists; the other is deleted, not dormant.
- [ ] Credentials story verified working (or migrated to trusted publishing/OIDC).
- [ ] Registry-verification step in the workflow proves future releases land or fail loudly.
- [ ] Dry-run or test release demonstrates the flow end-to-end (a `2.1.0-rc.0` to a dist-tag is an acceptable proof if you don't want to burn a version number).
