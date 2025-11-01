# Advanced Cross-Axis Constraints

This example demonstrates the full power of cross-axis constraints in DCV.

## Scenario: Mobile-First Design System

You're building a design system that must:
- Ensure readability across all weight/size combinations
- Enforce WCAG AAA on mobile (outdoor viewing)
- Validate touch target accessibility
- Maintain visual hierarchy

## Token Structure

```json
{
  "typography": {
    "weight": {
      "light": { "$type": "number", "$value": 300 },
      "regular": { "$type": "number", "$value": 400 },
      "medium": { "$type": "number", "$value": 500 },
      "bold": { "$type": "number", "$value": 700 }
    },
    "size": {
      "xs": { "$type": "dimension", "$value": "12px" },
      "sm": { "$type": "dimension", "$value": "14px" },
      "base": { "$type": "dimension", "$value": "16px" },
      "lg": { "$type": "dimension", "$value": "18px" },
      "xl": { "$type": "dimension", "$value": "20px" },
      "h3": { "$type": "dimension", "$value": "24px" },
      "h2": { "$type": "dimension", "$value": "32px" },
      "h1": { "$type": "dimension", "$value": "40px" }
    },
    "lineHeight": {
      "tight": { "$type": "number", "$value": 1.25 },
      "normal": { "$type": "number", "$value": 1.5 },
      "relaxed": { "$type": "number", "$value": 1.75 }
    }
  },
  "color": {
    "text": {
      "primary": { "$type": "color", "$value": "#1a1a1a" },
      "secondary": { "$type": "color", "$value": "#666666" },
      "tertiary": { "$type": "color", "$value": "#999999" }
    },
    "bg": {
      "default": { "$type": "color", "$value": "#ffffff" },
      "subtle": { "$type": "color", "$value": "#f5f5f5" }
    }
  },
  "control": {
    "size": {
      "sm": { "$type": "dimension", "$value": "32px" },
      "md": { "$type": "dimension", "$value": "40px" },
      "lg": { "$type": "dimension", "$value": "48px" }
    }
  },
  "spacing": {
    "paragraph": { "$type": "dimension", "$value": "16px" }
  }
}
```

## Cross-Axis Rules

### themes/cross-axis.rules.json (Base Rules)

```json
{
  "rules": [
    {
      "id": "readable-light-text",
      "level": "error",
      "when": {
        "id": "typography.weight.light",
        "test": "(v) => v < 400"
      },
      "require": {
        "id": "typography.size.base",
        "test": "(v) => v >= 16",
        "msg": "(v, ctx) => `Light weight (${ctx.get('typography.weight.light')}) requires ≥16px, got ${v}px`"
      }
    },
    {
      "id": "heading-emphasis",
      "level": "error",
      "when": {
        "id": "typography.size.h3",
        "test": "(v, ctx) => v - ctx.getPx('typography.size.base') < 6"
      },
      "require": {
        "id": "typography.weight.medium",
        "test": "(v, ctx) => v >= ctx.get('typography.weight.regular') + 100",
        "msg": "() => `H3 with small size delta needs heavier weight for hierarchy`"
      }
    },
    {
      "id": "compensate-tight-leading",
      "level": "warn",
      "when": {
        "id": "typography.lineHeight.tight",
        "test": "(v) => v < 1.4"
      },
      "require": {
        "id": "spacing.paragraph",
        "test": "(v, ctx) => v >= ctx.getPx('typography.size.base') * 1.5",
        "msg": "(v, ctx) => `Tight line-height (${ctx.get('typography.lineHeight.tight')}) needs ≥${ctx.getPx('typography.size.base') * 1.5}px paragraph spacing, got ${v}px`"
      }
    }
  ]
}
```

### themes/cross-axis.sm.rules.json (Mobile-Specific)

```json
{
  "rules": [
    {
      "id": "mobile-readable-body",
      "level": "error",
      "when": {
        "id": "typography.weight.regular",
        "test": "(v) => v < 500"
      },
      "require": {
        "id": "typography.size.base",
        "test": "(v) => v >= 16",
        "msg": "() => `Mobile body text with regular weight needs ≥16px for readability`"
      }
    },
    {
      "id": "mobile-touch-buttons",
      "level": "error",
      "when": {
        "id": "typography.size.base",
        "test": "(v) => v < 18"
      },
      "require": {
        "id": "control.size.md",
        "test": "(v) => v >= 44",
        "msg": "(v) => `Mobile buttons with <18px text need ≥44px tap target (got ${v}px)`"
      }
    },
    {
      "id": "mobile-contrast-boost",
      "level": "warn",
      "contrast": {
        "text": "color.text.secondary",
        "bg": "color.bg.default",
        "min": "(bp) => 7",
        "ratio": "(text, bg, ctx) => {
          // Simplified contrast calculation
          const lText = parseLightness(text);
          const lBg = parseLightness(bg);
          return Math.abs(lText - lBg) * 21;
        }"
      }
    }
  ]
}
```

## Validation Examples

### ✅ Valid Combination

**Tokens:**
```json
{
  "typography": {
    "weight": { "light": { "$value": 300 } },
    "size": { "base": { "$value": "16px" } }
  }
}
```

**Result:**
```
✓ All cross-axis constraints satisfied
```

### ❌ Invalid: Light Text Too Small

**Tokens:**
```json
{
  "typography": {
    "weight": { "light": { "$value": 300 } },
    "size": { "base": { "$value": "14px" } }
  }
}
```

**Result:**
```
ERROR cross-axis  typography.size.base @ themes/cross-axis.rules.json
  readable-light-text
  Light weight (300) requires ≥16px, got 14px
```

### ❌ Invalid: Poor Heading Hierarchy

**Tokens:**
```json
{
  "typography": {
    "size": {
      "base": { "$value": "16px" },
      "h3": { "$value": "18px" }
    },
    "weight": {
      "regular": { "$value": 400 },
      "medium": { "$value": 450 }
    }
  }
}
```

**Result:**
```
ERROR cross-axis  typography.weight.medium @ themes/cross-axis.rules.json
  heading-emphasis
  H3 with small size delta needs heavier weight for hierarchy
```

### ⚠️  Warning: Tight Leading

**Tokens:**
```json
{
  "typography": {
    "lineHeight": { "tight": { "$value": 1.25 } },
    "size": { "base": { "$value": "16px" } }
  },
  "spacing": {
    "paragraph": { "$value": "16px" }
  }
}
```

**Result:**
```
WARN cross-axis  spacing.paragraph @ themes/cross-axis.rules.json
  compensate-tight-leading
  Tight line-height (1.25) needs ≥24px paragraph spacing, got 16px
```

## Why This Works

**Traditional Validators Check:**
- ✅ Weight = 300 (valid number)
- ✅ Size = 14px (valid dimension)
- ❌ **Miss the readability issue!**

**DCV Cross-Axis Checks:**
- ✅ Weight = 300
- ✅ Size = 14px
- ❌ **300 weight + 14px = unreadable combination**
- 🔧 **Catches the problem before production**

## Running This Example

```bash
# Clone the repo
git clone https://github.com/CseperkePapp/design-constraint-validator
cd design-constraint-validator

# Install
npm install

# Create example files above in:
# - examples/advanced/tokens.json
# - examples/advanced/themes/cross-axis.rules.json
# - examples/advanced/themes/cross-axis.sm.rules.json

# Validate base rules
npx dcv validate --tokens examples/advanced/tokens.json

# Validate mobile-specific rules
npx dcv validate --tokens examples/advanced/tokens.json --breakpoint sm

# See violations in table format
npx dcv validate --tokens examples/advanced/tokens.json --all-breakpoints --summary table
```

## Integration with CI/CD

Add to `.github/workflows/design-tokens.yml`:

```yaml
name: Validate Design Tokens

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
      - name: Validate tokens (all breakpoints)
        run: npx dcv validate --tokens tokens.json --all-breakpoints --format json --output validation-results.json
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-results
          path: validation-results.json
```

## Best Practices

### 1. Start Simple
Begin with basic rules, add complexity as needed:
```json
{
  "rules": [
    {
      "id": "basic-readability",
      "when": { "id": "weight", "test": "v => v < 400" },
      "require": { "id": "size", "test": "v => v >= 16" }
    }
  ]
}
```

### 2. Use Descriptive IDs
```json
{
  "id": "mobile-touch-accessibility",  // ✅ Clear purpose
  "id": "rule-23",                     // ❌ Unclear
}
```

### 3. Provide Helpful Messages
```json
{
  "msg": "(v, ctx) => `Light weight needs ≥16px, got ${v}px`"  // ✅ Actionable
  "msg": "() => `Invalid combination`"                        // ❌ Vague
}
```

### 4. Use Warnings for Soft Rules
```json
{
  "level": "warn",  // Won't fail CI, but shows in report
  "id": "suggested-contrast-boost"
}
```

### 5. Breakpoint-Specific Files
```
themes/
├── cross-axis.rules.json     # Base rules (all breakpoints)
├── cross-axis.sm.rules.json  # Mobile overrides
├── cross-axis.md.rules.json  # Tablet overrides
└── cross-axis.lg.rules.json  # Desktop overrides
```

## Common Patterns

### Typography Readability Matrix
```json
{
  "rules": [
    { "when": "weight < 300", "require": "size >= 18" },
    { "when": "weight < 400", "require": "size >= 16" },
    { "when": "weight < 500", "require": "size >= 14" }
  ]
}
```

### Touch Target Accessibility
```json
{
  "rules": [
    { "when": "fontSize < 16", "require": "touchTarget >= 48" },
    { "when": "fontSize < 18", "require": "touchTarget >= 44" },
    { "when": "fontSize >= 18", "require": "touchTarget >= 40" }
  ]
}
```

### Responsive Contrast
```json
{
  "rules": [
    { "when": "bp === 'sm'", "require": "contrast >= 7" },   // AAA
    { "when": "bp === 'md'", "require": "contrast >= 4.5" }, // AA
    { "when": "bp === 'lg'", "require": "contrast >= 4.5" }  // AA
  ]
}
```

## Further Reading

- [Constraints Documentation](../docs/Constraints.md)
- [Configuration Guide](../docs/Configuration.md)
- [WCAG 2.1 Success Criteria](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
