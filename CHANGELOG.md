# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## [Unreleased]

## [2.1.1] - 2026-06-13

> **Security/behavior fix.** The validator now **fails closed** on malformed
> input instead of silently passing it. If you relied on the previous lenient
> handling of non-object token roots, this is a behavior change — a repo and
> examples search found no legitimate callers depending on it.

### Security

- **MCP server and library reject malformed validator input.** Inline `tokens`
  with a non-object root (`null`, arrays, strings, numbers, booleans) and
  malformed `constraints` payloads now return a clear structured error instead of
  being coerced into an empty token set that passed validation. This closes a gap
  where an untrusted MCP caller could get a false `ok: true` from garbage input.
  The same root-cause fix applies to the programmatic `validate()` and
  `flattenTokens()` paths.
- **Public `validate({ constraints })` now schema-validates inline constraints**
  through the same Zod config schema used by the CLI and MCP. Malformed inline
  constraints (e.g. an invalid threshold operator like `op: "~="`) previously
  slipped through the public API and could silently change validation semantics;
  they now throw a descriptive error.

### Fixed

- **WCAG backdrop token ids resolve correctly.** Transparent-background contrast
  compositing treated any id beginning with a CSS color prefix (`rgb`, `hsl`, …)
  as a color literal, so a valid token id like `rgb.backdrop` produced an
  unparseable-color warning instead of resolving. Literal detection now requires
  real CSS color syntax (`rgb(`, `hsl(`, `oklch(`, `#…`, exact `transparent`).
- **`--theme` overlays merge correctly.** `dcv build --theme <name>` (and the
  same path in `dcv set --theme`) flattened tokens *before* applying the nested
  theme overlay, emitting base values plus invalid CSS like
  `--color: [object Object];`. Theme overlays are now merged onto the token tree
  before flattening, matching breakpoint-overlay behavior.
- **Theme-aware commands fail closed on a bad theme.** `validate`, `build`, and
  `set` shared no theme loader and silently ignored a missing
  `tokens/themes/<name>.json`, swallowed invalid JSON, or accepted a non-object
  theme file — validating base tokens as if the requested theme applied. They now
  use one shared loader that errors clearly on a missing, malformed, or
  non-object theme file.
- The `dcv-mcp` server's runtime handshake reported a hardcoded `2.1.0`; it now
  derives its version from `package.json`, so it can't drift from the release.
- Stabilized a flaky CLI test that could intermittently fail the release gate
  (`npm run check`) on cold `tsx` startup under parallel load. Test-only — no
  product behavior changed.
- `server.json` (MCP registry manifest) is pinned to the package version by a
  regression test, so the manifest can no longer drift from `package.json`.

## [2.1.0] - 2026-06-12

> **Note on 2.0.2:** `v2.0.2` was tagged and committed but **never published to npm**
> — the publish workflow triggered on `release: published`, while the release
> scripts only pushed a tag and never created a GitHub Release, so nothing ran.
> npm `latest` stayed at 2.0.1. The 2.0.2 changes (supply-chain CI hardening) ship
> here in 2.1.0; 2.0.2 will not be published as its own version.

### Release process

- Publishing is now **tag-push driven**: pushing a `vX.Y.Z` tag runs
  `.github/workflows/publish.yml`, which builds, runs checks, publishes with
  provenance, and then **polls the npm registry to confirm the version is live**
  (failing the run if not). This removes the silent-failure gap that stranded
  2.0.2 and replaces the manual "now run npm publish" step.

### Fixed

- `--tokens` / the positional tokens path is now honored. Previously it was parsed
  into the receipt but never used, so the CLI always validated the bundled example
  tokens — a foreign tokens file was silently ignored.
- A missing or invalid **explicit** tokens path now exits non-zero with a clear
  error (`Tokens file not found: …`) instead of silently validating an empty set.
- Token resolution distinguishes a genuine reference cycle from a still-unresolved
  `{ref}` placeholder in the fixpoint guard.
- zod v4 compatibility (`ZodError.errors` → `.issues`).
- **OKLCH→sRGB contrast** corrected — `oklch()` colors now compute their true WCAG
  contrast (previously the conversion was wrong, under-reporting contrast).
- **Mixed hex/OKLCH lightness scales** no longer produce false pass/fail.
  `monotonic-lightness` returned raw OKLCH perceptual L for `oklch()` but relative
  luminance for hex — two scales; now everything routes through one luminance scale.
- **Alias reference matching** escapes ref IDs before building replacement regexes
  (`{color.text}` no longer over-matches `{colorXtext}`) and accepts underscores.
- `FlatToken.raw` preserves the original `$value` (including DTCG structured
  objects); the normalized form lives in `FlatToken.value`.

### Added

- Programmatic `validate()` API exported from the package root
  (`import { validate } from 'design-constraint-validator'`), returning
  `{ ok, counts, violations, warnings, note? }`. Accepts inline `tokens` /
  `constraints` or `tokensPath` / `configPath`.
- `validate [tokens-path]` positional (alias for `--tokens`) and a
  `--constraints-dir` option.
- Coverage note: when validated tokens are referenced by no active constraint,
  the result says so instead of reporting a misleading "pass".
- **DTCG 2025.10 stable-spec support** — structured color objects
  (`{ colorSpace, components, alpha, hex }`) and structured dimensions
  (`{ value, unit }`) are normalized at ingestion; `{alias.path}` references and
  `$extensions` passthrough are handled; non-sRGB color spaces emit an explicit
  warning instead of silently doing wrong math. Figma's native export validates.
- **`dcv-mcp` MCP server** — a Model Context Protocol server exposing read-only
  `validate` / `why` / `graph` tools over stdio, with registry metadata in
  `server.json`. Adds the `dcv-mcp` bin and `./mcp` package export.
- **`--config <path>`** option and JSON config discovery
  (`dcv.config.json` → `.dcvrc.json` → `package.json` `"dcv"`). `.js` config files
  are rejected with a clear message (JSON only). `backdrop` is supported in WCAG
  config rules.
- Structured WCAG context in JSON output (`actual` / `required` ratios,
  `involvedTokens`) so consumers don't have to parse human-readable messages.

### Changed

- README Quick Start and Programmatic API rewritten so every command and code
  sample runs as written from an empty directory (verified in a clean room).
- All reference docs (`docs/API.md`, `JSON-OUTPUT.md`, `AI-GUIDE.md`, `CLI.md`,
  `Concepts.md`, `Configuration.md`, …) brought into parity with the real sync
  `validate({…})` API, the current `Engine.evaluate()` plugin model, and the
  current JSON output shape. Examples moved their WCAG config into
  `dcv.config.json` (obsolete `themes/wcag.json` removed); Tokens Studio order
  files use the tuple format the loader actually reads.

### Security

- Removed the unused `fast-glob` dependency, which transitively pulled a
  high-severity `picomatch ≤2.3.1` ReDoS advisory. Production `npm audit` is clean.

### Packaging & CI

- Build artifacts (`.js` / `.d.ts` / `.map`) are no longer committed next to their
  `.ts` sources; the published tarball still ships built output via the `files`
  allowlist + `prepublishOnly`.
- CI builds before running tests (clean checkouts no longer fail the
  CLI-spawning tests); the workflow-automation CI is hardened (SHA-pinned actions,
  `npm ci --ignore-scripts`).

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
