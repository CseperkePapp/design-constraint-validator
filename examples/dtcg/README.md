# DTCG Integration

DCV reads DTCG-style tokens with `$value`, `$type`, references, and selected
structured values.

The committed fixture is:

- `figma-export.tokens.json`
- `dcv.config.json`

## Try This Example

```bash
npx dcv validate \
  --tokens examples/dtcg/figma-export.tokens.json \
  --config examples/dtcg/dcv.config.json \
  --constraints-dir __none__
```

`--constraints-dir __none__` keeps this example focused on config-backed WCAG
and threshold rules.

## Config Shape

WCAG and threshold rules live in `dcv.config.json`:

```json
{
  "constraints": {
    "enableBuiltInWcagDefaults": false,
    "enableBuiltInThreshold": false,
    "wcag": [
      {
        "foreground": "color.text",
        "background": "color.bg",
        "ratio": 4.5,
        "description": "Body text on surface"
      }
    ],
    "thresholds": [
      {
        "id": "size.touch",
        "op": ">=",
        "valuePx": 44,
        "where": "Touch target"
      }
    ]
  }
}
```

## Supported DTCG Inputs

| Feature | Support |
|---------|---------|
| `$value` token leaves | Supported |
| `$type` metadata | Preserved and used where relevant |
| `{alias.path}` references | Resolved |
| Structured sRGB colors | Normalized for color checks |
| Non-sRGB color spaces | Reported as unparseable rather than coerced |
| Structured dimensions | Normalized for threshold checks |
| `$extensions` | Preserved |
| Composite values | Parsed, but not broadly constraint-validated |

## Example Token Shape

```json
{
  "color": {
    "text": {
      "$type": "color",
      "$value": "#111111"
    },
    "bg": {
      "$type": "color",
      "$value": "#ffffff"
    }
  },
  "size": {
    "touch": {
      "$type": "dimension",
      "$value": {
        "value": 44,
        "unit": "px"
      }
    }
  }
}
```

## Order Files

If you add scale constraints to a DTCG project, use tuple-based order files in
the constraints directory:

```json
{
  "order": [
    ["dimension.fontSize.3xl", ">=", "dimension.fontSize.2xl"],
    ["dimension.fontSize.2xl", ">=", "dimension.fontSize.base"]
  ]
}
```

Run with:

```bash
npx dcv validate --tokens tokens.json --config dcv.config.json --constraints-dir themes
```

## CI Example

```yaml
name: Validate DTCG Tokens
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx dcv validate --tokens tokens.json --config dcv.config.json --format json --output validation-results.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: validation-results
          path: validation-results.json
```

## Resources

- [DTCG Specification](https://tr.designtokens.org/format/)
- [DCV Configuration Guide](../../docs/Configuration.md)
- [DCV JSON Output Schema](../../docs/JSON-OUTPUT.md)
