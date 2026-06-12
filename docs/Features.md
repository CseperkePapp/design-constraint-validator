# Features & Complete Guide

Design Constraint Validator (DCV) validates relationships between design tokens:
accessibility contrast, ordering, thresholds, cross-property rules, and token
dependency provenance.

## Your First Validation

### 1. Install

```bash
npm install -D design-constraint-validator
```

### 2. Create `tokens.json`

```json
{
  "color": {
    "text": { "$value": "#1a1a1a" },
    "background": { "$value": "#ffffff" }
  },
  "typography": {
    "size": {
      "h1": { "$value": "32px" },
      "h2": { "$value": "24px" },
      "body": { "$value": "16px" }
    }
  },
  "control": {
    "size": {
      "min": { "$value": "44px" }
    }
  }
}
```

### 3. Create `dcv.config.json`

WCAG and threshold rules are configured under `constraints`.

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text",
        "background": "color.background",
        "ratio": 4.5,
        "description": "Body text on background"
      }
    ]
  }
}
```

### 4. Create `themes/typography.order.json`

`themes/` is the default constraint directory for order and cross-axis files.

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

### 5. Validate

```bash
npx dcv validate --tokens tokens.json
```

Passing output:

```text
validate: 0 error(s), 0 warning(s)
```

If `typography.size.h2` is changed to `40px`, the monotonic rule fails:

```text
validate: 1 error(s), 0 warning(s)
ERROR monotonic  typography.size.h1|typography.size.h2 - typography.size.h1 >= typography.size.h2 violated: 32 vs 40
```

See [examples/minimal/](../examples/minimal/) for a working setup.

## Constraint Types

### Monotonic Ordering

Order files live in the constraints directory:

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["spacing.xl", ">=", "spacing.lg"]
  ]
}
```

### WCAG Contrast

WCAG rules live in `dcv.config.json`:

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.role.text.default",
        "background": "color.role.bg.surface",
        "ratio": 4.5
      }
    ]
  }
}
```

WCAG violations include structured `context.actual` and `context.required` in
JSON output.

### Threshold Rules

Custom thresholds live in `constraints.thresholds`:

```json
{
  "constraints": {
    "thresholds": [
      {
        "id": "control.size.min",
        "op": ">=",
        "valuePx": 44,
        "where": "Touch target"
      }
    ]
  }
}
```

DCV also enables a built-in touch-target threshold by default. Disable it with
`constraints.enableBuiltInThreshold: false`.

### Lightness Ordering

`themes/color.order.json` uses the same `order` format and compares parsed color
lightness:

```json
{
  "order": [
    ["color.palette.brand.100", ">=", "color.palette.brand.200"],
    ["color.palette.brand.200", ">=", "color.palette.brand.300"]
  ]
}
```

### Cross-Axis Constraints

Cross-axis files express multi-property rules:

```json
{
  "rules": [
    {
      "id": "accessible-touch-targets",
      "when": { "id": "typography.size.button", "test": "v < 18" },
      "require": {
        "id": "control.size.min",
        "test": "v >= 44",
        "msg": "Small button text requires larger tap targets"
      }
    }
  ]
}
```

Use `themes/cross-axis.rules.json` for global rules and
`themes/cross-axis.md.rules.json` for breakpoint-specific rules.

## CLI Commands

### Validate

```bash
dcv validate --tokens tokens.json
dcv validate --breakpoint md
dcv validate --all-breakpoints --summary table
dcv validate --fail-on warn
dcv validate --format json --output validation.json
```

### Graph

```bash
dcv graph --format mermaid > graph.mmd
dcv graph --hasse typography --format dot > typography.dot
dcv graph --format json > graph.json
```

JSON dependency graph output uses string nodes and tuple edges:

```json
{
  "nodes": ["typography.size.body", "typography.size.h2"],
  "edges": [["typography.size.body", "typography.size.h2"]]
}
```

### Why

```bash
dcv why typography.size.h1 --format json
```

### Build

```bash
dcv build --format css --output tokens.css
dcv build --all-formats
```

### Set And Patch

```bash
dcv set typography.size.h1=36px
dcv patch --overrides tokens/overrides/md.json
dcv patch:apply patches/md-patch.json --output tokens-md.json
```

`patch:apply` is a pure transform. Run `dcv validate` separately on the output.

## Programmatic API

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json',
  constraintsDir: './themes'
});

console.log(result.counts);

if (!result.ok) {
  for (const violation of result.violations) {
    console.error(`[${violation.ruleId}] ${violation.message}`);
  }
  process.exitCode = 1;
}
```

Available root exports:

```ts
export { Engine, validate } from 'design-constraint-validator';
export type {
  ConstraintIssue,
  ConstraintPlugin,
  Graph,
  TokenId,
  TokenValue,
  ValidateInput,
  ValidateResult
} from 'design-constraint-validator';
```

Use subpath imports for lower-level helpers and plugin factories. See
[API.md](./API.md).

## Use Cases

- Design system validation in CI.
- Accessibility checks for color token pairs.
- Typography, spacing, layout, and color-order safeguards.
- Multi-breakpoint validation with token overrides.
- Token dependency and provenance inspection.
- Machine-readable reports for dashboards and agents.

## FAQ

### How does the tool find my tokens and constraints?

By default:

- Tokens: `tokens/tokens.example.json`.
- Order/cross-axis constraints: `.json` files in `themes/`.
- WCAG and custom thresholds: `dcv.config.json` in the current working
  directory, or a file passed with `--config`.

Use `--tokens` and `--constraints-dir` to point at project-specific paths.

### Can I use this with existing tokens?

Yes, if they can be represented as nested JSON with `$value` token leaves. DCV
supports `{token.path}` references and common DTCG-style token objects.

### Does `dcv validate` cache incremental results?

No. The engine supports incremental evaluation through `commit()` and
`affected()`, but each CLI validation run performs a full validation for the
selected token set and breakpoint(s).

### What breakpoints are supported?

The built-in breakpoint names are `sm`, `md`, and `lg`. Use override files under
`tokens/overrides/` and validate with `--breakpoint md` or `--all-breakpoints`.

### Can I use this in CI/CD?

Yes:

```yaml
name: Validate Design Tokens
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx dcv validate --fail-on warn
```

Use `--fail-on off` for report-only adoption.

## Related Docs

- [Getting Started](./Getting-Started.md)
- [Constraints](./Constraints.md)
- [CLI Reference](./CLI.md)
- [Configuration](./Configuration.md)
- [API Reference](./API.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
