# DTCG (Design Tokens Community Group) Integration

DCV fully supports the [DTCG specification](https://tr.designtokens.org/format/) using `$type`, `$value`, and `$description` properties.

## Quick Start

1. **Export tokens in DTCG format**
2. **Validate with DCV:**

```bash
npx design-constraint-validator validate --tokens tokens.json
```

**Note:** DCV looks for constraint files in a `themes/` directory (see below)

## DTCG Format Overview

The Design Tokens Community Group (DTCG) specification standardizes token format:

- ✅ `$type` - Token type (color, dimension, fontFamily, etc.)
- ✅ `$value` - Token value
- ✅ `$description` - Human-readable description
- ✅ References using `{token.path}` syntax

## Example Token File

DTCG-compliant tokens:

```json
{
  "color": {
    "blue": {
      "$type": "color",
      "100": { "$value": "#dbeafe" },
      "200": { "$value": "#bfdbfe" },
      "500": { "$value": "#3b82f6" },
      "700": { "$value": "#1d4ed8" },
      "900": { "$value": "#1e3a8a" }
    },
    "semantic": {
      "primary": {
        "$type": "color",
        "$value": "{color.blue.500}",
        "$description": "Primary brand color"
      },
      "text": {
        "$type": "color",
        "$value": "#1a1a1a",
        "$description": "Default text color"
      },
      "background": {
        "$type": "color",
        "$value": "#ffffff",
        "$description": "Default background"
      }
    }
  },
  "dimension": {
    "spacing": {
      "$type": "dimension",
      "0": { "$value": "0rem" },
      "1": { "$value": "0.25rem" },
      "2": { "$value": "0.5rem" },
      "4": { "$value": "1rem" },
      "8": { "$value": "2rem" },
      "16": { "$value": "4rem" }
    },
    "fontSize": {
      "$type": "dimension",
      "xs": { "$value": "0.75rem", "$description": "12px" },
      "sm": { "$value": "0.875rem", "$description": "14px" },
      "base": { "$value": "1rem", "$description": "16px" },
      "lg": { "$value": "1.125rem", "$description": "18px" },
      "xl": { "$value": "1.25rem", "$description": "20px" },
      "2xl": { "$value": "1.5rem", "$description": "24px" },
      "3xl": { "$value": "2rem", "$description": "32px" }
    }
  },
  "fontWeight": {
    "$type": "fontWeight",
    "light": { "$value": "300" },
    "normal": { "$value": "400" },
    "medium": { "$value": "500" },
    "semibold": { "$value": "600" },
    "bold": { "$value": "700" }
  },
  "duration": {
    "$type": "duration",
    "fast": { "$value": "150ms" },
    "normal": { "$value": "300ms" },
    "slow": { "$value": "500ms" }
  }
}
```

## DCV Compatibility

DCV is **fully DTCG-compliant**:

- ✅ `$type` property recognized and preserved
- ✅ `$value` property used for validation
- ✅ `$description` preserved in metadata
- ✅ Token references `{path.to.token}` resolved automatically
- ✅ Nested type inheritance (e.g., `color.$type` applies to all children)

## Constraint Validation

### Project Structure

```
your-project/
├── tokens.json                    # DTCG tokens
└── themes/
    ├── typography.order.json      # Font size hierarchy
    ├── color.order.json           # Color lightness scale
    ├── spacing.order.json         # Spacing scale
    └── wcag.json                  # Accessibility constraints
```

### Color Lightness Scale

**themes/color.order.json:**
```json
{
  "order": [
    "color.blue.100",
    "color.blue.200",
    "color.blue.500",
    "color.blue.700",
    "color.blue.900"
  ],
  "direction": "decreasing",
  "property": "lightness"
}
```

**Validates:** Blue scale darkens consistently

### Typography Scale

**themes/typography.order.json:**
```json
{
  "order": [
    "dimension.fontSize.3xl",
    "dimension.fontSize.2xl",
    "dimension.fontSize.xl",
    "dimension.fontSize.lg",
    "dimension.fontSize.base",
    "dimension.fontSize.sm",
    "dimension.fontSize.xs"
  ],
  "direction": "decreasing"
}
```

**Validates:** Font sizes decrease properly

### Spacing Scale

**themes/spacing.order.json:**
```json
{
  "order": [
    "dimension.spacing.0",
    "dimension.spacing.1",
    "dimension.spacing.2",
    "dimension.spacing.4",
    "dimension.spacing.8",
    "dimension.spacing.16"
  ],
  "direction": "increasing"
}
```

**Validates:** Spacing increases consistently

### WCAG Contrast

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

## DTCG Type Support

DCV validates these DTCG types:

| DTCG Type | DCV Support | Validation |
|-----------|-------------|------------|
| `color` | ✅ Full | Contrast, lightness, monotonic |
| `dimension` | ✅ Full | Thresholds, monotonic, cross-axis |
| `fontWeight` | ✅ Full | Thresholds, monotonic |
| `duration` | ✅ Full | Thresholds, monotonic |
| `fontFamily` | ✅ Parsed | Basic validation |
| `number` | ✅ Full | Thresholds, monotonic |
| `cubicBezier` | ⚠️ Parsed | Limited validation |
| `strokeStyle` | ⚠️ Parsed | Limited validation |
| `border` | ⚠️ Parsed | Limited validation |
| `transition` | ⚠️ Parsed | Limited validation |
| `shadow` | ⚠️ Parsed | Limited validation |
| `gradient` | ⚠️ Parsed | Limited validation |
| `typography` | ⚠️ Parsed | Limited validation |

## Token References

DTCG uses `{token.path}` for references (no `.value` suffix needed):

```json
{
  "color": {
    "base": {
      "blue": {
        "$type": "color",
        "$value": "#3b82f6"
      }
    },
    "semantic": {
      "primary": {
        "$type": "color",
        "$value": "{color.base.blue}"
      }
    }
  }
}
```

DCV resolves `{color.base.blue}` → `#3b82f6` automatically.

## Type Inheritance

DTCG supports type inheritance. DCV respects this:

```json
{
  "color": {
    "$type": "color",
    "primary": { "$value": "#3b82f6" },
    "secondary": { "$value": "#6366f1" }
  }
}
```

Both `color.primary` and `color.secondary` inherit `$type: "color"`.

## Composite Tokens

DTCG supports composite tokens (objects as values):

```json
{
  "shadow": {
    "elevation-1": {
      "$type": "shadow",
      "$value": {
        "offsetX": "0px",
        "offsetY": "1px",
        "blur": "2px",
        "spread": "0px",
        "color": "#00000026"
      }
    }
  },
  "typography": {
    "heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{fontFamily.sans}",
        "fontSize": "{dimension.fontSize.2xl}",
        "fontWeight": "{fontWeight.bold}",
        "lineHeight": "1.2"
      }
    }
  }
}
```

DCV parses composite tokens and can validate referenced values.

## Groups and Collections

DTCG supports token groups with metadata:

```json
{
  "color": {
    "$type": "color",
    "$description": "Brand color palette",
    "primary": {
      "$description": "Primary brand colors",
      "500": {
        "$value": "#3b82f6",
        "$description": "Main brand color"
      }
    }
  }
}
```

DCV preserves descriptions and uses them in validation reports.

## CI/CD Integration

**GitHub Actions example:**

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
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate DTCG tokens
        run: npx design-constraint-validator validate --tokens tokens.json --format json --output validation-results.json
      
      - name: Check exit code
        run: |
          if [ $? -eq 0 ]; then
            echo "✓ All constraints satisfied"
          else
            echo "✗ Validation failed"
            exit 1
          fi
      
      - name: Upload validation results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-results
          path: validation-results.json
```

## Toolchain Integration

DCV works alongside DTCG tooling:

```
Design Tool (Figma, etc.)
    ↓ export
DTCG Tokens (tokens.json)
    ↓ validate
DCV (constraint validation)
    ↓ transform
Token Transformer / Theo / Style Dictionary
    ↓ build
Platform Outputs (CSS, iOS, Android)
```

**Add DCV as validation step:**

```json
{
  "scripts": {
    "validate": "dcv validate --tokens tokens.json",
    "build": "npm run validate && token-transformer tokens.json",
    "test": "npm run validate"
  }
}
```

## Example: Complete DTCG Setup

**tokens.json:**
```json
{
  "$schema": "https://tr.designtokens.org/format/",
  "color": {
    "$type": "color",
    "gray": {
      "50": { "$value": "#f9fafb" },
      "900": { "$value": "#111827" }
    },
    "blue": {
      "500": { "$value": "#3b82f6" }
    },
    "semantic": {
      "text": { "$value": "{color.gray.900}" },
      "background": { "$value": "{color.gray.50}" },
      "primary": { "$value": "{color.blue.500}" }
    }
  },
  "dimension": {
    "$type": "dimension",
    "fontSize": {
      "h1": { "$value": "2rem" },
      "h2": { "$value": "1.5rem" },
      "body": { "$value": "1rem" }
    }
  }
}
```

**themes/typography.order.json:**
```json
{
  "order": [
    "dimension.fontSize.h1",
    "dimension.fontSize.h2",
    "dimension.fontSize.body"
  ],
  "direction": "decreasing"
}
```

**themes/wcag.json:**
```json
{
  "constraints": [{
    "type": "wcag",
    "level": "AA",
    "context": "normal",
    "pairs": [
      { "fg": "color.semantic.text", "bg": "color.semantic.background" }
    ]
  }]
}
```

**Run validation:**
```bash
npx design-constraint-validator validate --tokens tokens.json
```

**Expected output:**
```
✓ Monotonic constraints passed
✓ WCAG AA contrast passed
✓ All constraints satisfied
```

## Troubleshooting

### Issue: Type not recognized

**Error:** `Unknown type: myCustomType`

**Solution:** DCV validates standard DTCG types. Custom types are parsed but not validated.

### Issue: Reference not resolved

**Error:** `Could not resolve token {color.primary}`

**Solution:** Ensure the referenced token exists:
```json
{
  "color": {
    "primary": { "$value": "#3b82f6" }  // ✅ Exists
  },
  "semantic": {
    "main": { "$value": "{color.primary}" }  // ✅ Resolves
  }
}
```

### Issue: Composite token validation

**Warning:** `Limited validation for composite type 'shadow'`

**Note:** DCV validates simple types fully. Composite types (shadow, typography, border) are parsed but have limited constraint validation.

## Migration from Other Formats

### From Style Dictionary:
```json
// Style Dictionary
{ "color": { "primary": { "value": "#3b82f6" } } }

// DTCG
{ "color": { "$type": "color", "primary": { "$value": "#3b82f6" } } }
```

### From Tokens Studio:
```json
// Tokens Studio
{ "color": { "primary": { "$type": "color", "$value": "#3b82f6" } } }

// DTCG (same!)
{ "color": { "$type": "color", "primary": { "$value": "#3b82f6" } } }
```

Tokens Studio format is DTCG-compliant!

## Resources

- [DTCG Specification](https://tr.designtokens.org/format/)
- [DTCG GitHub](https://github.com/design-tokens/community-group)
- [DCV Configuration Guide](../../docs/CONFIGURATION.md)
- [Complete Examples](../../examples/)
