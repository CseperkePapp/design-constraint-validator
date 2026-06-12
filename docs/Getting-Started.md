# Getting Started

This guide gets a small token file validating with WCAG and typography-order
constraints.

## Installation

```bash
npm install -D design-constraint-validator
```

One-off use is also available:

```bash
npx dcv --help
```

## Prerequisites

- Node.js 18 or newer.
- A JSON token file using nested `$value` token leaves.

## First Validation

### 1. Create `tokens.json`

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

### 2. Create `dcv.config.json`

WCAG and custom threshold policies live in config:

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

### 3. Create `themes/typography.order.json`

`themes/` is the default directory for order and cross-axis constraint files.

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

### 4. Validate

Because this quickstart uses a root `tokens.json`, pass it explicitly:

```bash
npx dcv validate --tokens tokens.json
```

Passing output:

```text
validate: 0 error(s), 0 warning(s)
```

## Understanding Failures

Change `typography.size.h2` to `40px` and run validation again:

```bash
npx dcv validate --tokens tokens.json
```

Example failure:

```text
validate: 1 error(s), 0 warning(s)
ERROR monotonic  typography.size.h1|typography.size.h2 - typography.size.h1 >= typography.size.h2 violated: 32 vs 40
```

The validator tells you the rule type, involved token IDs, and the comparison
that failed.

## Useful Commands

```bash
# Explain token provenance
dcv why typography.size.h1 --tokens tokens.json

# Visualize dependencies
dcv graph --tokens tokens.json --format mermaid > graph.mmd

# Machine-readable validation
dcv validate --tokens tokens.json --format json --output validation.json

# Report issues without failing the command
dcv validate --tokens tokens.json --fail-on off
```

## Configuration Basics

Use config for constraint policy:

```json
{
  "constraints": {
    "enableBuiltInThreshold": true,
    "enableBuiltInWcagDefaults": true,
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

Use CLI flags for runtime paths and output:

```bash
dcv validate --tokens design-tokens.json --constraints-dir constraints
dcv validate --config packages/tokens/dcv.config.json
```

See [Configuration](./Configuration.md) for the current config contract.

## Common Issues

### Cannot find token file

Pass the token file explicitly:

```bash
dcv validate --tokens path/to/tokens.json
```

### No active constraint references tokens

Add WCAG/threshold rules that reference your token IDs, or point
`--constraints-dir` at the directory containing your order/cross-axis files.

### Validation fails but should not block CI yet

```bash
dcv validate --fail-on off --format json --output validation.json
```

## Next Steps

- [Constraints Guide](./Constraints.md)
- [CLI Reference](./CLI.md)
- [Configuration](./Configuration.md)
- [API Reference](./API.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
