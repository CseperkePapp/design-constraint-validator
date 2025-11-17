# Concepts & Terminology

Core concepts and terms used across the Design Constraint Validator (DCV) codebase and documentation.

## Design Tokens

- **Token**: A named design value, typically represented as a nested JSON object with a `$value` field.
- **Token ID**: The dot-notated identifier derived from the nesting path, e.g. `typography.size.h1` or `color.palette.brand.500`.
- **References**: Tokens may reference other tokens using `{path.to.token}` syntax. DCV resolves these references during flattening.
- **Effective token set**: The fully-resolved, flattened map of token IDs to final values after merging overrides and resolving references. This is what DCV validates.

## Constraints & Policies

- **Constraint**: A rule that must hold over one or more tokens. Constraints reason about relationships (e.g. `>=`, contrast ratios) rather than just structure.
- **Constraint types**:
  - **Monotonic**: Enforce ordering relationships between tokens (typography scales, spacing scales, lightness ramps).
  - **WCAG**: Enforce minimum contrast ratios between foreground and background token pairs.
  - **Threshold**: Enforce minimum/maximum numeric values (for example, minimum touch target size).
  - **Lightness**: Enforce perceptual lightness progression across a color scale (using OKLCH).
  - **Cross-axis**: Express multi-dimensional rules that tie together different properties (e.g. size, weight, contrast, breakpoints).
- **Policy / Policy file**: A collection of constraints that represents an accessibility standard (e.g. AA) or an organizational rule-set. In practice:
  - Constraint data is usually stored as JSON in the `themes/` directory (for example `themes/wcag.json`, `themes/typography.order.json`, `themes/cross-axis.rules.json`).
  - A “policy profile” is effectively the set of constraint JSON files DCV loads for a given validation run.

## Themes, Breakpoints, Overrides

- **Theme (tokens)**: A coherent set of tokens representing a visual theme (for example light vs dark). DCV does not compute themes; it validates whatever token set you provide.
- **Themes directory (`themes/`)**: By default, DCV expects constraint definitions under `themes/`. The name is historical; conceptually this directory holds constraints/policies, not visual themes.
- **Breakpoints**: Named responsive contexts (e.g. `sm`, `md`, `lg`) for which override token files may exist.
  - Base tokens are typically in `tokens/tokens.json` or similar.
  - Overrides live in `tokens/overrides/<breakpoint>.json`.
  - For `--all-breakpoints`, DCV merges base tokens with each override file in turn and validates each resulting effective token set separately.
- **Overrides**: Token values that replace base values at a particular breakpoint or for local experimentation (for example `tokens/overrides/local.json`).

## Engine, Graph, Plugins

- **Engine**: The core in-memory model used by DCV to validate tokens.
  - Holds the flat token map (ID → final value).
  - Maintains a directed acyclic graph (DAG) of reference dependencies between tokens.
  - Orchestrates the execution of constraint plugins over the token set.
- **Dependency graph**: A DAG whose nodes are token IDs and edges represent reference dependencies (`A → B` if `B`’s value refers to `A`).
  - Used to find all tokens affected by a change.
  - Used by `dcv graph` (dependency mode) and by `dcv why` to explain provenance.
- **Poset / Hasse diagram**:
  - A partial order (poset) is the abstract ordering induced by monotonic constraints (for example size hierarchies).
  - DCV builds posets from `.order.json` files and can export Hasse diagrams (reduced graphs that show only the essential ordering edges) via `dcv graph --hasse`.
- **Plugin (constraint plugin)**:
  - A module implementing a specific constraint kind (monotonic, WCAG, threshold, lightness, cross-axis).
  - Plugins are registered on the engine and evaluated over the token graph.
  - Plugins are pure checks: they read values and report issues but do not mutate tokens.

## Violations, Output, Receipts

- **Violation**: A specific instance where a constraint is not satisfied.
  - In JSON output: `ConstraintViolation` with `ruleId`, `level` (`error` or `warn`), `message`, and optional `nodes` (tokens) and `edges` (graph edges) for context.
  - In text output: printed as `ERROR` or `WARN` lines with rule name, token(s) and message.
- **Validation result**:
  - Summarized in JSON as `ValidationResult` (see `docs/JSON-OUTPUT.md`).
  - Contains `ok`, `counts`, `violations`, optional `warnings`, and `stats` (duration, version, timestamp).
- **Receipt**:
  - A validation result enriched with environment and input metadata (`ValidationReceipt`).
  - Includes Node/OS info, token file path and hash, constraints directory and hashes, and effective configuration (including `failOn`).
  - Generated with `dcv validate --format json --receipt <path>`.

## Defaults & Assumptions

The current implementation includes a few important defaults and conventions:

- **Token paths**
  - CLI default tokens path: `tokens/tokens.example.json` (can be overridden with `--tokens` or via config).
  - Default constraints directory: `themes/`.
  - Default overrides directory: `tokens/overrides/`.

- **Built-in constraints**
  - **Threshold**: DCV always enforces a touch target minimum on `control.size.min` using a threshold rule equivalent to:
    - `id: "control.size.min"`, `op: ">="`, `valuePx: 44`, `where: "Touch target (WCAG / Apple HIG)"`.
  - **WCAG defaults**: In addition to user-configured WCAG constraints, DCV applies a small set of built-in contrast checks for commonly named roles, for example:
    - `color.role.text.default` on `color.role.bg.surface`.
    - `color.role.accent.default` on `color.role.bg.surface`.
    - `color.role.focus.ring` on `color.role.bg.surface`.
    - These defaults only have an effect if your token IDs match the expected names.

- **Unknown IDs in constraints**
  - If a constraint file (especially cross-axis rules) references token IDs that do not exist in the token set, DCV skips those rules.
  - Unknown IDs are surfaced in debug logging and may be promoted to user-visible warnings in future versions, but they are currently non-fatal.

- **Unparseable values**
  - Monotonic and threshold plugins skip tokens whose values cannot be parsed as numbers / sizes. This avoids false positives when a non-numeric token appears in an order list.
  - WCAG contrast constraints emit warnings when colors cannot be parsed (or references cannot be resolved), because that usually indicates a data issue.

- **Incremental evaluation**
  - The engine’s `commit`/`affected` mechanism supports incremental validation (validate only changed token(s) plus dependents) and is used by commands like `dcv set`.
  - Each `dcv validate` CLI run currently performs a full validation of the effective token set for each breakpoint; there is no cross-run caching.

These defaults are intentionally conservative: they provide useful safeguards out-of-the-box while still allowing projects to add explicit constraints via JSON files and configuration.

