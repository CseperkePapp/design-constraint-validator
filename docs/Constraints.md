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

## 5. Cross-Axis Constraints ⚡

**Multi-property conditional rules** - enforce relationships between different token properties.

### What Makes Cross-Axis Special?

Unlike other validators that check tokens in isolation, cross-axis constraints validate **combinations** of properties:

| Single-Property Check | Cross-Axis Check |
|----------------------|------------------|
| ✅ Font size ≥ 14px | ✅ **IF** weight ≤ 400 **THEN** size ≥ 16px |
| ✅ Touch target ≥ 44px | ✅ **IF** text size < 18px **THEN** target ≥ 44px |
| ✅ Contrast ≥ 4.5:1 | ✅ **IF** on mobile **THEN** contrast ≥ 7:1 |

This enables **sophisticated design system governance** that standard validators can't achieve.

---

### Real-World Use Cases

#### 1. Typography Readability
**Rule:** Light font weights need larger sizes for legibility

**themes/cross-axis.rules.json:**
```json
{
  "rules": [
    {
      "id": "readable-light-text",
      "when": {
        "id": "typography.weight.body",
        "test": "(v) => v <= 400"
      },
      "require": {
        "id": "typography.size.body",
        "test": "(v) => v >= 16",
        "msg": "(v, ctx) => `Light weight (${ctx.get('typography.weight.body')}) requires size ≥16px, got ${v}px`"
      }
    }
  ]
}
```

**Tokens that violate:**
```json
{
  "typography": {
    "weight": { "body": { "$value": 300 } },
    "size": { "body": { "$value": "14px" } }
  }
}
```

**Error:**
```
ERROR cross-axis  typography.size.body
  Light weight (300) requires size ≥16px, got 14px
```

---

#### 2. Accessible Touch Targets
**Rule:** Small button text requires larger tap targets (WCAG 2.5.5 + Apple HIG)

```json
{
  "rules": [
    {
      "id": "touch-target-accessibility",
      "when": {
        "id": "typography.size.button",
        "test": "(v) => v < 18"
      },
      "require": {
        "id": "control.size.min",
        "test": "(v) => v >= 44",
        "msg": "() => `Button text <18px requires ≥44px touch target for accessibility`"
      }
    }
  ]
}
```

---

#### 3. Responsive Contrast
**Rule:** Mobile screens need higher contrast due to outdoor viewing

```json
{
  "rules": [
    {
      "id": "mobile-high-contrast",
      "contrast": {
        "text": "color.text.body",
        "bg": "color.bg.default",
        "min": "(bp) => bp === 'sm' ? 7 : 4.5",
        "ratio": "(text, bg, ctx) => calculateContrast(text, bg)"
      }
    }
  ]
}
```

---

#### 4. Heading Emphasis
**Rule:** Headings must be visually distinct from body text

```json
{
  "rules": [
    {
      "id": "heading-emphasis",
      "when": {
        "id": "typography.size.h2",
        "test": "(v, ctx) => v - ctx.getPx('typography.size.body') < 4"
      },
      "require": {
        "id": "typography.weight.h2",
        "test": "(v, ctx) => v >= ctx.get('typography.weight.body') + 200",
        "msg": "() => `Small heading size delta requires heavier weight for emphasis`"
      }
    }
  ]
}
```

---

#### 5. Dense Layout Spacing
**Rule:** Tighter line-height needs more paragraph spacing

```json
{
  "rules": [
    {
      "id": "compensate-tight-leading",
      "when": {
        "id": "typography.lineHeight.body",
        "test": "(v) => v < 1.4"
      },
      "require": {
        "id": "spacing.paragraph",
        "test": "(v, ctx) => v >= ctx.getPx('typography.size.body') * 1.5",
        "msg": "() => `Tight line-height (<1.4) requires larger paragraph spacing for readability`"
      }
    }
  ]
}
```

---

### Syntax Reference

**Basic Structure:**
```typescript
{
  id: string;              // Unique identifier
  level?: "error" | "warn"; // Severity (default: "error")
  when: {
    id: string;            // Token to test
    test: string | Function; // Condition (JS function)
  };
  require: {
    id: string;            // Token to validate
    test: string | Function; // Validation (JS function)
    msg: string | Function;  // Error message
  };
}
```

**Available in test functions:**
- `v` - Current token value (parsed as number)
- `ctx.get(id)` - Get any token value
- `ctx.getPx(id)` - Get dimension as pixels
- `ctx.bp` - Current breakpoint (if any)

---

### Breakpoint-Specific Rules

Cross-axis constraints can vary by breakpoint:

**themes/cross-axis.sm.rules.json:** (mobile-only)
```json
{
  "rules": [
    {
      "id": "mobile-touch-targets",
      "when": { "id": "typography.size.body", "test": "v => v < 16" },
      "require": { 
        "id": "control.size.min", 
        "test": "v => v >= 48",
        "msg": "() => `Mobile requires ≥48px touch targets (Apple HIG)`"
      }
    }
  ]
}
```

**themes/cross-axis.lg.rules.json:** (desktop)
```json
{
  "rules": [
    {
      "id": "desktop-dense-ui",
      "when": { "id": "layout.density", "test": "v => v === 'compact'" },
      "require": { 
        "id": "spacing.padding",
        "test": "v => v >= 12",
        "msg": "() => `Compact layouts need minimum 12px padding`"
      }
    }
  ]
}
```

---

### Why Cross-Axis Matters

**Without cross-axis validation:**
```
✅ Font weight 300 - Valid
✅ Font size 12px - Valid
❌ Together? Unreadable! (But passes validation)
```

**With cross-axis validation:**
```
✅ Font weight 300
✅ Font size 16px
✅ Combination valid - Readable!

OR

❌ Font weight 300 + Font size 12px
ERROR: Light weight requires ≥16px size
```

**Real Impact:**
- 🎯 Catches **subtle design bugs** before production
- 📱 Enforces **responsive best practices** automatically
- ♿ Validates **accessibility combinations** (not just isolated checks)
- 📚 Documents **design intent** in code (no more wiki pages)

---

### Advanced Example: Complete Mobile Ruleset

**themes/cross-axis.sm.rules.json:**
```json
{
  "rules": [
    {
      "id": "mobile-readable-body",
      "when": { "id": "typography.weight.body", "test": "v => v < 500" },
      "require": { 
        "id": "typography.size.body",
        "test": "v => v >= 16",
        "msg": "() => `Mobile body text with light weight needs ≥16px`"
      }
    },
    {
      "id": "mobile-touch-buttons",
      "when": { "id": "typography.size.button", "test": "v => v < 18" },
      "require": {
        "id": "control.size.button",
        "test": "v => v >= 44",
        "msg": "() => `Mobile buttons <18px text need ≥44px tap target`"
      }
    },
    {
      "id": "mobile-high-contrast",
      "contrast": {
        "text": "color.text.secondary",
        "bg": "color.bg.default",
        "min": "() => 7",
        "ratio": "(t, b, ctx) => calculateContrast(t, b)"
      },
      "level": "warn"
    }
  ]
}
```

This creates a **comprehensive mobile accessibility ruleset** that validates:
- Typography readability
- Touch target sizes
- Color contrast ratios

All automatically enforced on every validation run.

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

---

## Built-in Rules

DCV includes a small number of built-in constraints that are always active:

- **Touch target threshold**
  - `control.size.min >= 44px` (Touch target, WCAG 2.1 / Apple HIG).
  - Enforced even if you do not define any explicit threshold JSON files.
- **Default WCAG pairs**
  - A few common role-based color pairs (for example `color.role.text.default` on `color.role.bg.surface`) are checked for contrast automatically when those IDs exist.

These defaults provide useful safety nets out-of-the-box. For full control, define your own WCAG and threshold constraints in `themes/` and adjust `--fail-on`/config as needed.
