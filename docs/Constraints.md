# Constraint Types

DCV supports multiple types of constraints to validate design tokens.

## Overview

| Type | Purpose | Example |
|------|---------|---------|
| **Monotonic** | Enforce ordering (h1 ≥ h2) | Typography scales, spacing |
| **WCAG** | Color contrast accessibility | Text readability |
| **Threshold** | Min/max value guards | Touch target sizes |
| **Lightness** | Color palette progression | Lightness ordering |
| **Cross-Axis** | Multi-domain relationships | Weight × size dependencies |

---

## 1. Monotonic Constraints

Enforce ordering relationships between tokens.

### Use Cases
- Typography scales (h1 ≥ h2 ≥ h3 ≥ body)
- Spacing hierarchies (xl ≥ lg ≥ md ≥ sm)
- Layout breakpoints (desktop ≥ tablet ≥ mobile)

### Configuration

**themes/typography.order.json:**
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.h3"],
    ["typography.size.h3", ">=", "typography.size.body"]
  ]
}
```

### Operators
- `>=` - Greater than or equal
- `<=` - Less than or equal

### Supported Value Types
- **Pixels** - `16px`, `24px`
- **Rems** - `1rem`, `1.5rem`
- **Unitless numbers** - `16`, `24`

### Example Tokens

```json
{
  "typography": {
    "size": {
      "h1": { "$value": "32px" },
      "h2": { "$value": "24px" },
      "h3": { "$value": "20px" },
      "body": { "$value": "16px" }
    }
  }
}
```

### Error Example

```
ERROR monotonic  typography.size.h2
  typography.size.h1 >= typography.size.h2 violated: 32px < 40px
```

---

## 2. WCAG Contrast Constraints

Validate color contrast for accessibility compliance.

### Use Cases
- Body text on backgrounds (AA = 4.5:1)
- Large text (AAA = 4.5:1, AA = 3:1)
- UI components (3:1 minimum)

### Configuration

**themes/wcag.json:**
```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.body",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text on surface (AA)"
      },
      {
        "foreground": "color.text.heading",
        "background": "color.bg.surface",
        "ratio": 7.0,
        "description": "Headings on surface (AAA)"
      },
      {
        "foreground": "color.accent.primary",
        "background": "color.bg.surface",
        "ratio": 3.0,
        "description": "UI components (AA)"
      }
    ]
  }
}
```

### WCAG Levels

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| **AA** | 4.5:1 | 3:1 | 3:1 |
| **AAA** | 7:1 | 4.5:1 | - |

**Large text** = ≥18pt regular or ≥14pt bold

### Example Tokens

```json
{
  "color": {
    "text": {
      "body": { "$value": "#1a1a1a" },
      "heading": { "$value": "#000000" }
    },
    "bg": {
      "surface": { "$value": "#ffffff" }
    },
    "accent": {
      "primary": { "$value": "#0066cc" }
    }
  }
}
```

### Error Example

```
ERROR wcag  color.text.body vs color.bg.surface
  Contrast ratio 4.5:1 required, got 3.8:1
  Body text on surface (AA)
```

### Color Formats Supported
- **Hex** - `#1a1a1a`, `#fff`
- **RGB** - `rgb(26, 26, 26)`
- **HSL** - `hsl(0, 0%, 10%)`
- **OKLCH** - `oklch(0.2 0 0)` (perceptual)

---

## 3. Threshold Constraints

Enforce min/max value guards.

### Use Cases
- Touch target sizes (≥44px WCAG, ≥48px Material)
- Maximum line lengths (≤75ch)
- Font size floors (≥12px)

### Configuration

Defined in code plugins:

```typescript
{
  id: 'control.size.min',
  op: '>=',
  valuePx: 44,
  where: 'Touch target (WCAG 2.1 / Apple HIG)'
}
```

### Example Tokens

```json
{
  "control": {
    "size": {
      "button": { "$value": "48px" },
      "checkbox": { "$value": "24px" },
      "icon-button": { "$value": "44px" }
    }
  }
}
```

### Error Example

```
ERROR threshold  control.size.checkbox
  Touch target should be ≥ 44px, got 24px
  Touch target (WCAG 2.1 / Apple HIG)
```

### Common Thresholds

| Guideline | Minimum Size |
|-----------|--------------|
| **WCAG 2.1** | 44×44px |
| **Material Design** | 48×48px |
| **iOS HIG** | 44×44pt |
| **Android** | 48×48dp |

---

## 4. Lightness Constraints

Enforce color palette progression based on perceptual lightness.

### Use Cases
- Color scales (50 → 100 → 200 → ... → 900)
- Ensuring darker shades are actually darker
- Perceptual consistency

### Configuration

**themes/color.order.json:**
```json
{
  "order": [
    ["color.palette.brand.50", ">=", "color.palette.brand.100"],
    ["color.palette.brand.100", ">=", "color.palette.brand.200"],
    ["color.palette.brand.200", ">=", "color.palette.brand.300"],
    ["color.palette.brand.300", ">=", "color.palette.brand.400"],
    ["color.palette.brand.400", ">=", "color.palette.brand.500"]
  ]
}
```

### Example Tokens

```json
{
  "color": {
    "palette": {
      "brand": {
        "50": { "$value": "oklch(0.95 0.05 280)" },
        "100": { "$value": "oklch(0.90 0.08 280)" },
        "200": { "$value": "oklch(0.80 0.12 280)" },
        "300": { "$value": "oklch(0.70 0.15 280)" },
        "400": { "$value": "oklch(0.60 0.18 280)" },
        "500": { "$value": "oklch(0.50 0.20 280)" }
      }
    }
  }
}
```

### How It Works

Uses **OKLCH** (perceptual color space) L channel:
- L=1.0 → white
- L=0.5 → mid
- L=0.0 → black

Converts hex/rgb to OKLCH automatically.

---

## 5. Cross-Axis Constraints

Multi-domain relationships (advanced).

### Use Cases
- "Light font weights require larger sizes"
- "Small text requires higher contrast"
- "Dense layouts need more spacing"

### Configuration

**themes/cross-axis.rules.json:**
```json
{
  "rules": [
    {
      "when": {
        "id": "typography.weight.body",
        "op": "<=",
        "value": 400
      },
      "require": {
        "id": "typography.size.body",
        "op": ">=",
        "value": "16px"
      },
      "description": "Light weights need larger sizes for readability"
    }
  ]
}
```

### Example Tokens

```json
{
  "typography": {
    "weight": {
      "body": { "$value": 300 }
    },
    "size": {
      "body": { "$value": "14px" }
    }
  }
}
```

### Error Example

```
ERROR cross-axis  typography.size.body
  When typography.weight.body ≤ 400, typography.size.body must be ≥ 16px
  Got: weight=300, size=14px
  Light weights need larger sizes for readability
```

---

## Combining Constraints

You can use multiple constraint types together:

```
project/
├── tokens.json
└── themes/
    ├── wcag.json           # Color contrast
    ├── typography.order.json  # Typography scales
    ├── spacing.order.json     # Spacing hierarchy
    ├── color.order.json       # Color lightness
    └── cross-axis.rules.json  # Multi-domain rules
```

All constraints are validated together in one pass.

---

## Constraint Severity

Constraints can be:
- **error** - Validation fails (exit code 1)
- **warn** - Validation passes but shows warning

Control with `--fail-on`:

```bash
dcv validate --fail-on error   # Only fail on errors (default)
dcv validate --fail-on warn    # Fail on warnings too
dcv validate --fail-on off     # Never fail (reporting only)
```

---

## Custom Constraints

Coming soon: Plugin API for custom constraint types.

---

## Next Steps

- **[CLI Reference](./CLI.md)** - Command options
- **[Configuration](./Configuration.md)** - Customize paths
- **[Architecture](./Architecture.md)** - How constraints are validated
