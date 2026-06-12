# Examples

CLI-focused examples demonstrating Design Constraint Validator features.

## Directories

### `minimal/`

The simplest working example.

- `tokens.json`: Basic color, typography, and control tokens.
- `dcv.config.json`: WCAG contrast policy.
- `themes/typography.order.json`: Typography hierarchy.

```bash
cd examples/minimal
npx dcv validate --tokens tokens.json
```

### `tokens-studio/`

Tokens Studio-style `$type` / `$value` token data with DCV constraint examples.

```bash
npx dcv validate \
  --tokens examples/tokens-studio/tokens.json \
  --config examples/tokens-studio/dcv.config.json \
  --constraints-dir examples/tokens-studio/themes
```

### `style-dictionary/`

Guide for using Style Dictionary token exports. DCV expects `$value` token
leaves, so Style Dictionary `value` fields should be normalized before
validation.

See [style-dictionary/README.md](style-dictionary/README.md).

### `dtcg/`

DTCG (Design Tokens Community Group) examples, including structured color and
dimension values.

```bash
npx dcv validate \
  --tokens examples/dtcg/figma-export.tokens.json \
  --config examples/dtcg/dcv.config.json \
  --constraints-dir __none__
```

### `advanced-constraints/`

Advanced cross-axis constraint examples.

See [advanced-constraints/README.md](advanced-constraints/README.md).

### `failing/`

Intentionally broken token files for testing validation output.

```bash
npx dcv validate --tokens examples/failing/contrast-fail.tokens.json --fail-on off
npx dcv validate --tokens examples/failing/monotonicity-fail.tokens.json --fail-on off
```

### `patches/`

Patch and override examples.

```bash
npx dcv patch --overrides examples/patches/basic-override.json
```

## Common Commands

```bash
dcv why typography.size.body --format table
dcv graph --format mermaid --hasse typography > graph.mmd
dcv build --format css --tokens examples/minimal/tokens.json
```

For full CLI documentation, see [../docs/CLI.md](../docs/CLI.md).
