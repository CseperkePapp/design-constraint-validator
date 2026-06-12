# Concepts & Terminology

Core terms used across Design Constraint Validator (DCV).

## Design Tokens

- **Token**: A named design value, typically represented as a nested JSON object
  with a `$value` field.
- **Token ID**: Dot-notated identifier derived from nesting, such as
  `typography.size.h1` or `color.palette.brand.500`.
- **Reference**: A token value that points at another token using
  `{path.to.token}` syntax.
- **Effective token set**: The fully resolved, flattened map of token IDs to
  final values after references, overrides, themes, or breakpoint overlays have
  been applied.

## Constraints & Policies

- **Constraint**: A rule over one or more tokens. Constraints reason about
  relationships, such as ordering, contrast, and minimum sizes.
- **Policy**: A collection of constraints representing a standard or
  organizational rule set.
- **Config constraints**: WCAG and custom threshold policies in
  `dcv.config.json` under `constraints`.
- **Constraint directory**: Directory for order and cross-axis files. The
  default is `themes/`, a historical name that means "constraint policy files"
  in DCV.

Common constraint types:

- **Monotonic**: Ordering relationships for typography, spacing, layout, or
  other scales.
- **WCAG**: Minimum contrast ratios between foreground/background token pairs.
- **Threshold**: Minimum or maximum numeric values, such as touch target size.
- **Lightness**: Perceptual lightness ordering across color scales.
- **Cross-axis**: Multi-property rules tying together size, weight, contrast,
  breakpoints, or other dimensions.

## Themes, Breakpoints, Overrides

- **Theme tokens**: Visual theme overlays, such as light or dark token values.
  DCV validates the token set it is given; it does not compute visual themes.
- **`themes/` directory**: Default directory for order and cross-axis constraint
  files, not visual themes. Use `--constraints-dir` to point at another policy
  directory such as `constraints/`.
- **Breakpoints**: Named responsive contexts (`sm`, `md`, `lg`) with optional
  override token files.
- **Overrides**: Token values that replace base values for a breakpoint or local
  experiment.

## Engine, Graph, Plugins

- **Engine**: The core in-memory validator. It stores flat token values, tracks
  reference dependency edges, and runs registered constraint plugins.
- **Dependency graph**: Directed graph where nodes are token IDs and edges
  represent references.
- **Poset / Hasse diagram**: A partial order induced by monotonic constraints.
  `dcv graph --hasse` can export reduced order diagrams.
- **Plugin**: A pure constraint checker with an `id` and
  `evaluate(engine, candidates)` method. Plugins read token values and report
  issues; they do not mutate tokens.

## Violations, Output, Receipts

- **Violation**: A specific failed constraint. JSON violations use `ruleId`,
  `level`, `message`, optional `nodes`, optional `edges`, and optional
  `context`.
- **CLI validation result**: `dcv validate --format json` returns `ok`,
  `counts`, `violations`, optional `warnings`, optional `note`, `stats`, and
  `dcv` package metadata.
- **Programmatic validation result**: `validate()` returns `ok`, `counts`,
  `violations`, `warnings`, and optional `note`. It does not add CLI-only
  `stats` or `dcv` metadata.
- **Receipt**: A validation result enriched with environment and input metadata.
  Generate one with:

```bash
dcv validate --format json --receipt validation.receipt.json
```

Receipt hash values are `sha256:` plus the first 16 hex characters of the file
digest. Constraint hashes cover `.json` files in the active constraints
directory. Config-file constraints are not currently included in
`constraintHashes`.

## Defaults & Assumptions

- **Token path**: CLI validation defaults to `tokens/tokens.example.json`.
  Override with `--tokens` or the positional token path.
- **Constraint directory**: Defaults to `themes/`. Override with
  `--constraints-dir`.
- **Override directory**: Breakpoint token overrides default to
  `tokens/overrides/`.
- **Built-in threshold**: Enabled by default. Enforces
  `control.size.min >= 44px` with `where: "Touch target (WCAG / Apple HIG)"`.
  Disable with `constraints.enableBuiltInThreshold: false`.
- **Built-in WCAG defaults**: Enabled by default for common role token IDs such
  as `color.role.text.default` on `color.role.bg.surface`. Disable with
  `constraints.enableBuiltInWcagDefaults: false`.
- **Unknown IDs**: Constraint rules that reference missing token IDs are skipped
  or reported as warnings depending on the constraint type.
- **Unparseable values**: Monotonic and threshold checks skip values they cannot
  parse numerically. WCAG contrast reports warnings for unparseable colors.
- **Incremental engine support**: `Engine.commit()` and `Engine.affected()` can
  evaluate changed tokens plus dependents. Each `dcv validate` CLI run performs
  a full validation of the effective token set for each selected breakpoint.

## `--fail-on` Values

`dcv validate --fail-on` accepts:

- `off`: Always exit `0` after reporting issues.
- `warn`: Exit `1` when warnings or errors are present.
- `error`: Exit `1` only when error-level violations are present.

Earlier docs may mention `"never"` or a config-file `failOn` option. The current
runtime uses the CLI flag, and the non-blocking value is `off`.

## JSON Field Names

Canonical validation JSON field names:

- `ruleId`: Constraint identifier, such as `wcag-contrast`, `threshold`, or
  `monotonic`.
- `level`: `error` or `warn`.
- `message`: Human-readable description.
- `nodes`: Token IDs involved in the issue.
- `edges`: Graph edges involved in the issue, when available.
- `context`: Rule-specific structured metadata. WCAG contrast uses
  `actual` and `required`.

Older examples may have used `kind`/`severity`; the current JSON shape uses
`ruleId`/`level`.

## Policy vs Constraints vs Themes

- **Constraints** are individual rules.
- **Policy** is a collection of rules.
- **Config policy** includes `constraints.wcag` and `constraints.thresholds`.
- **Constraint files** include order and cross-axis JSON files.
- **Themes directory** is the default constraint-file directory despite its
  historical name.

## Manifest

In DCV, a manifest usually means a CSS variable mapping file used by
`dcv build --mapper`. It maps token IDs to generated CSS variable names.

```json
{
  "color.brand.primary": "--brand-primary",
  "typography.size.h1": "--heading-xl"
}
```

## Related Docs

- [Configuration](./Configuration.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
- [API Reference](./API.md)
- [CLI Reference](./CLI.md)
