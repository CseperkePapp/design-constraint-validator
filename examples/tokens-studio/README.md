# Tokens Studio Integration

DCV natively supports Tokens Studio JSON format using `$type` and `$value` syntax.

> **🎨 Figma Users:** Tokens Studio is a Figma plugin that lets you manage design tokens directly in Figma. DCV validates these tokens to ensure consistency and accessibility. Export from Tokens Studio → validate with DCV → sync back to Figma!

## Quick Start

1. **Export tokens from Tokens Studio** (Figma plugin)
2. **Validate with DCV:**

```bash
npx design-constraint-validator validate --tokens tokens.json
```

**Note:** DCV looks for constraint files in a `themes/` directory (see below)

## Example Token File

```json
{
  "color": {
    "palette": {
      "primary": {
        "100": { "$type": "color", "$value": "#e3f2fd" },
        "500": { "$type": "color", "$value": "#2196f3" },
        "900": { "$type": "color", "$value": "#0d47a1" }
      }
    },
    "semantic": {
      "text": { "$type": "color", "$value": "{color.palette.primary.900}" },
      "background": { "$type": "color", "$value": "{color.palette.primary.100}" }
    }
  },
  "typography": {
    "fontSize": {
      "heading": {
        "h1": { "$type": "dimension", "$value": "32px" },
        "h2": { "$type": "dimension", "$value": "24px" },
        "h3": { "$type": "dimension", "$value": "20px" }
      },
      "body": { "$type": "dimension", "$value": "16px" }
    }
  }
}
```

## Constraint Validation

DCV uses a `themes/` directory structure for constraint definitions:

```
your-project/
├── tokens.json                    # Your Tokens Studio export
└── themes/
    ├── typography.order.json      # Typography hierarchy
    ├── color.order.json           # Color scale ordering
    ├── spacing.order.json         # Spacing scale
    └── wcag.json                  # Accessibility constraints
```

### Monotonic Scale Check

**themes/typography.order.json:**
```json
{
  "order": [
    "typography.fontSize.heading.h1",
    "typography.fontSize.heading.h2",
    "typography.fontSize.heading.h3",
    "typography.fontSize.body"
  ],
  "direction": "decreasing"
}
```

### WCAG Contrast Check

**themes/wcag.json:**
```json
{
  "constraints": [{
    "type": "wcag",
    "level": "AA",
    "context": "normal",
    "pairs": [
      {
        "fg": "color.semantic.text",
        "bg": "color.semantic.background"
      }
    ]
  }]
}
```

## Token References

DCV automatically resolves Tokens Studio references:

```json
{
  "color": {
    "base": { "$type": "color", "$value": "#2196f3" },
    "text": { "$type": "color", "$value": "{color.base}" }
  }
}
```

No additional configuration needed - references are resolved during validation.

## Multi-File Tokens (Coming Soon)

Tokens Studio supports multi-file token sets. DCV currently validates single merged files. For multi-file workflows:

1. Merge token sets before validation, or
2. Use Tokens Studio's "Export All" to create a single JSON file

We're exploring native multi-file support - feedback welcome!

## Troubleshooting

### Issue: Token not found

**Error:** `Could not resolve token color.semantic.text`

**Solution:** Ensure token IDs match the nested path structure:
- `color.semantic.text` maps to `{ "color": { "semantic": { "text": { ... } } } }`

### Issue: Type mismatch

**Error:** `Expected dimension, got color`

**Solution:** Verify `$type` values match constraint expectations:
- Color constraints require `$type: "color"`
- Dimension/spacing constraints require `$type: "dimension"`

## Resources

- [Tokens Studio Documentation](https://docs.tokens.studio/)
- [DCV Configuration Guide](../../docs/CONFIGURATION.md)
- [Complete Examples](../../examples/)
