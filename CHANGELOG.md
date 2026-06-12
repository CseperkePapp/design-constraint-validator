# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## [Unreleased]

## [2.1.0] - 2026-06-12

### Fixed

- `--tokens` / the positional tokens path is now honored. Previously it was parsed
  into the receipt but never used, so the CLI always validated the bundled example
  tokens — a foreign tokens file was silently ignored.
- A missing or invalid **explicit** tokens path now exits non-zero with a clear
  error (`Tokens file not found: …`) instead of silently validating an empty set.
- Token resolution distinguishes a genuine reference cycle from a still-unresolved
  `{ref}` placeholder in the fixpoint guard.
- zod v4 compatibility (`ZodError.errors` → `.issues`).

### Added

- Programmatic `validate()` API exported from the package root
  (`import { validate } from 'design-constraint-validator'`), returning
  `{ ok, counts, violations, warnings, note? }`. Accepts inline `tokens` /
  `constraints` or `tokensPath` / `configPath`.
- `validate [tokens-path]` positional (alias for `--tokens`) and a
  `--constraints-dir` option.
- Coverage note: when validated tokens are referenced by no active constraint,
  the result says so instead of reporting a misleading "pass".

### Changed

- README Quick Start and Programmatic API rewritten so every command and code
  sample runs as written from an empty directory (verified in a clean room).

### Packaging

- Build artifacts (`.js` / `.d.ts` / `.map`) are no longer committed next to their
  `.ts` sources; the published tarball still ships built output via the `files`
  allowlist + `prepublishOnly`.

## Earlier (unreleased prep)

- Initial public release preparation
- Types: generate and publish `.d.ts` files
- Packaging: correct main/types/exports and runtime deps
- Docs: CI behavior with `--fail-on off`, release process docs

## 1.0.0 - 2025-11-01
### Added
- CLI commands: `validate`, `graph`, `why`, `build`, `set`, `patch`, `patch:apply`
- Core engine and constraint plugins (WCAG, monotonic, threshold, cross-axis, lightness)
- Programmatic API (`core/index.js`)
- Examples (`examples/minimal`, `examples/failing`, `examples/patches`) — available in GitHub repo

### Changed
- Rebrand to DCV (Design Constraint Validator)

### Notes
- CI demonstrates expected violations with `--fail-on off`.
