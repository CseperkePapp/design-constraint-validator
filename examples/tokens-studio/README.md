# Tokens Studio Integration

DCV can validate Tokens Studio-style JSON when tokens use `$value` leaves and
`{token.path}` references.

## Try This Example

```bash
npx dcv validate \
  --tokens examples/tokens-studio/tokens.json \
  --config examples/tokens-studio/dcv.config.json \
  --constraints-dir examples/tokens-studio/themes
```

## Files

```text
tokens-studio/
  tokens.json
  dcv.config.json
  themes/
    color.order.json
    spacing.order.json
    typography.order.json
```

- `dcv.config.json` contains WCAG contrast pairs.
- `themes/*.order.json` files contain tuple-based ordering constraints.

## Token Shape

```json
{
  "color": {
    "semantic": {
      "text": {
        "primary": {
          "$type": "color",
          "$value": "{color.palette.neutral.900}"
        }
      }
    }
  }
}
```

DCV resolves `{color.palette.neutral.900}` before validation.

## WCAG Config

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.semantic.text.primary",
        "background": "color.semantic.background.default",
        "ratio": 4.5
      }
    ]
  }
}
```

## Order File Format

```json
{
  "order": [
    ["typography.fontSize.heading.h1", ">=", "typography.fontSize.heading.h2"],
    ["typography.fontSize.heading.h2", ">=", "typography.fontSize.heading.h3"]
  ]
}
```

## Notes

- DCV validates a single merged token file. Merge multi-file Tokens Studio sets
  before running validation.
- The default constraints directory is `themes/`, but this example passes it
  explicitly so the command works from the repository root.

## Resources

- [Tokens Studio Documentation](https://docs.tokens.studio/)
- [DCV Configuration Guide](../../docs/Configuration.md)
- [DCV API Reference](../../docs/API.md)
