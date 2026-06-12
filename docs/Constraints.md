# Constraint Types

DCV validates relationships between design tokens. Constraints can come from
`dcv.config.json` or from order/cross-axis JSON files in the constraints
directory.

## Overview

| Type | Configured In | Purpose |
|------|---------------|---------|
| Monotonic | `<axis>.order.json` | Enforce ordering such as `h1 >= h2` |
| WCAG | `dcv.config.json` | Enforce foreground/background contrast |
| Threshold | `dcv.config.json` | Enforce min/max numeric values |
| Lightness | `color.order.json` | Enforce color lightness progression |
| Cross-axis | `cross-axis.rules.json` | Enforce multi-property rules |

The default constraints directory is `themes/`. Use `--constraints-dir` to use
another directory name.

## Monotonic Constraints

Monotonic rules enforce ordering relationships between tokens.

Example `themes/typography.order.json`:

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.h3"],
    ["typography.size.h3", ">=", "typography.size.body"]
  ]
}
```

Operators:

- `>=`: Left token must be greater than or equal to the right token.
- `<=`: Left token must be less than or equal to the right token.

Supported values include `px`, `rem`, and unitless numbers.

Example failure:

```text
ERROR monotonic  typography.size.h1|typography.size.h2 - typography.size.h1 >= typography.size.h2 violated: 32 vs 40
```

## WCAG Contrast Constraints

WCAG contrast rules live in `dcv.config.json` under `constraints.wcag`.

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.body",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text on surface"
      },
      {
        "foreground": "color.text.heading",
        "background": "color.bg.surface",
        "ratio": 7,
        "description": "Headings on surface"
      }
    ]
  }
}
```

Fields:

- `foreground`: Foreground color token ID.
- `background`: Background color token ID.
- `ratio`: Minimum ratio. Defaults to `4.5` when omitted.
- `description`: Optional label surfaced as `context.where`.
- `backdrop`: Optional token ID or color literal for transparent background
  compositing.

Supported color inputs include hex, RGB, HSL, OKLCH, OKLAB, and `transparent`
where the parser can resolve them.

WCAG JSON violations include:

```json
{
  "ruleId": "wcag-contrast",
  "level": "error",
  "message": "Contrast 1.24:1 < 4.5:1",
  "nodes": ["color.text.body", "color.bg.surface"],
  "context": {
    "where": "Body text on surface",
    "actual": 1.24,
    "required": 4.5
  }
}
```

DCV also enables a small set of built-in WCAG checks for common role token IDs.
Disable those defaults with:

```json
{
  "constraints": {
    "enableBuiltInWcagDefaults": false
  }
}
```

## Threshold Constraints

Threshold rules live in `constraints.thresholds`.

```json
{
  "constraints": {
    "thresholds": [
      {
        "id": "control.size.min",
        "op": ">=",
        "valuePx": 44,
        "where": "Touch target"
      },
      {
        "id": "layout.container.max",
        "op": "<=",
        "valuePx": 1440,
        "where": "Maximum content width"
      }
    ]
  }
}
```

Fields:

- `id`: Token ID to check.
- `op`: `">="` or `"<="`.
- `valuePx`: Numeric pixel threshold.
- `where`: Optional label surfaced as `context.where`.

DCV enables a built-in touch target threshold by default:

```json
{
  "id": "control.size.min",
  "op": ">=",
  "valuePx": 44,
  "where": "Touch target (WCAG / Apple HIG)"
}
```

Disable it with:

```json
{
  "constraints": {
    "enableBuiltInThreshold": false
  }
}
```

## Lightness Constraints

Color lightness ordering uses `themes/color.order.json` and the same `order`
shape as monotonic constraints.

```json
{
  "order": [
    ["color.palette.brand.50", ">=", "color.palette.brand.100"],
    ["color.palette.brand.100", ">=", "color.palette.brand.200"],
    ["color.palette.brand.200", ">=", "color.palette.brand.300"]
  ]
}
```

The lightness plugin compares parsed OKLCH lightness where available and falls
back to an approximation for hex colors.

## Cross-Axis Constraints

Cross-axis constraints enforce relationships between different token domains.

Example `themes/cross-axis.rules.json`:

```json
{
  "rules": [
    {
      "id": "readable-light-text",
      "when": {
        "id": "typography.weight.body",
        "test": "v <= 400"
      },
      "require": {
        "id": "typography.size.body",
        "test": "v >= 16",
        "msg": "Light body text needs at least 16px size"
      }
    },
    {
      "id": "accessible-touch-targets",
      "when": {
        "id": "typography.size.button",
        "test": "v < 18"
      },
      "require": {
        "id": "control.size.min",
        "test": "v >= 44",
        "msg": "Small button text requires a larger tap target"
      }
    }
  ]
}
```

Breakpoint-specific files are also supported:

- `themes/cross-axis.sm.rules.json`
- `themes/cross-axis.md.rules.json`
- `themes/cross-axis.lg.rules.json`

## Combining Constraints

Typical project structure:

```text
project/
  tokens.json
  dcv.config.json
  themes/
    typography.order.json
    spacing.order.json
    color.order.json
    cross-axis.rules.json
```

Run validation:

```bash
dcv validate --tokens tokens.json
```

Use a differently named policy directory:

```bash
dcv validate --tokens tokens.json --constraints-dir constraints
```

## Severity And Exit Behavior

Most built-in constraints report `error`. Some warnings can appear for
unparseable WCAG color inputs or custom plugins.

Control exit behavior with:

```bash
dcv validate --fail-on error
dcv validate --fail-on warn
dcv validate --fail-on off
```

## Programmatic Use

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json',
  constraintsDir: './themes'
});
```

## Related Docs

- [Configuration](./Configuration.md)
- [CLI Reference](./CLI.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
- [API Reference](./API.md)
