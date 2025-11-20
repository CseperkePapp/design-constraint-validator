# Features & Complete Guide

Complete feature guide for Design Constraint Validator (DCV).

---

## Table of Contents

- [Your First Validation](#your-first-validation-5-minutes)
- [Example Output](#example-output)
- [Constraint Types](#constraint-types)
- [CLI Commands](#cli-commands)
- [Use Cases](#use-cases)
- [Architecture Overview](#architecture-overview)
- [Programmatic API](#programmatic-api)
- [FAQ](#faq)

---

## Your First Validation (5 minutes)

### 1. Install

```bash
npm install -D design-constraint-validator
```

### 2. Create `tokens.json` in your project root

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
  }
}
```

### 3. Create `themes/wcag.json` (WCAG contrast constraint)

```json
{
  "constraints": {
    "wcag": [{
      "foreground": "color.text",
      "background": "color.background",
      "ratio": 4.5
    }]
  }
}
```

### 4. Create `themes/typography.order.json` (size hierarchy)

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
npx dcv validate
```

**Output:**
```
✅ validate: 0 error(s), 0 warning(s)
```

Success! Your tokens pass all constraints.

### What if validation fails?

Try changing `h2` to `"40px"` (larger than h1) and run validation again:

```bash
npx dcv validate
```

**Output:**
```
validate: 1 error(s), 0 warning(s)
ERROR monotonic  typography.size.h2 @ typography.order.json — typography.size.h1 >= typography.size.h2 violated: 32px < 40px
```

The validator explains exactly what failed and why.

### Minimal Working Example

See [examples/minimal/](../examples/minimal/) for a complete minimal setup you can copy.

---

## Example Output

### ✅ Successful Validation

```bash
$ npx dcv validate
✅ validate: 0 error(s), 0 warning(s)
```

### ❌ Failed Validation

```bash
$ npx dcv validate
validate: 2 error(s), 1 warning(s)

ERROR monotonic  typography.size.h2
  typography.size.h1 >= typography.size.h2 violated: 32px < 40px
  Defined in: themes/typography.order.json

ERROR wcag  color.text vs color.background
  Contrast ratio 4.5:1 required, got 2.1:1
  Defined in: themes/wcag.json

WARN threshold  control.size.min
  Touch target should be >= 44px, got 30px
  Defined in: themes/touch.json
```

---

## Constraint Types

### 1. Monotonic Constraints

Enforce ordering relationships (e.g., h1 ≥ h2 ≥ h3)

```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.h3"]
  ]
}
```

### 2. WCAG Contrast

Validate color accessibility

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

### 3. Threshold Rules

Size guardrails (e.g., ≥44px touch targets)

```typescript
{
  id: 'control.size.min',
  op: '>=',
  valuePx: 44,
  where: 'Touch target (WCAG / Apple HIG)'
}
```

### 4. Lightness Ordering

Color palette progression

```json
{
  "order": [
    ["color.palette.brand.100", ">=", "color.palette.brand.200"],
    ["color.palette.brand.200", ">=", "color.palette.brand.300"]
  ]
}
```

### 5. Cross-Axis Constraints ⚡

**Multi-property conditional rules** - the most powerful constraint type

Cross-axis constraints enforce relationships between **different token properties**, enabling sophisticated design system rules that standard validators can't handle.

**Real-World Examples:**

```json
{
  "rules": [
    {
      "id": "readable-light-text",
      "when": { "id": "typography.weight.body", "test": "v <= 400" },
      "require": {
        "id": "typography.size.body",
        "test": "v >= 16",
        "msg": "Light font weights (≤400) require larger sizes (≥16px) for readability"
      }
    },
    {
      "id": "accessible-touch-targets",
      "when": { "id": "typography.size.button", "test": "v < 18" },
      "require": {
        "id": "control.size.min",
        "test": "v >= 44",
        "msg": "Small button text (<18px) requires larger tap targets (≥44px) for accessibility"
      }
    },
    {
      "id": "high-contrast-small-text",
      "contrast": {
        "text": "color.text.secondary",
        "bg": "color.bg.default",
        "min": "bp => bp === 'sm' ? 7 : 4.5",
        "msg": "Small screens require higher contrast for readability"
      }
    }
  ]
}
```

**Why This Matters:**
- ✅ Enforces **responsive design principles** (adapt rules per breakpoint)
- ✅ Validates **accessibility combinations** (WCAG + touch targets + text size)
- ✅ Catches **subtle bugs** that single-property checks miss
- ✅ Documents **design intent** in machine-readable format

See [Constraints.md](./Constraints.md#5-cross-axis-constraints) for complete syntax and examples.

---

## CLI Commands

### Validate

```bash
# Validate all tokens
dcv validate

# Validate specific breakpoint
dcv validate --breakpoint md

# All breakpoints with summary
dcv validate --all-breakpoints --summary table

# Fail on warnings
dcv validate --fail-on warn
```

See [CLI.md](./CLI.md) for complete command reference.

### Graph Visualization

Export token dependency graphs in text formats (Mermaid, Graphviz DOT):

```bash
# Export Mermaid format (renders on GitHub)
dcv graph --hasse typography --format mermaid > typography.mmd

# Export Graphviz DOT format
dcv graph --hasse color --format dot > color.dot

# JSON format for programmatic use
dcv graph --hasse layout --format json > layout.json

# Show only violations
dcv graph --hasse color --only-violations --format mermaid

# Highlight violations
dcv graph --hasse layout --highlight-violations --format mermaid
```

**Rendering Options:**
1. **GitHub** - Paste Mermaid code into `.md` files (native support)
2. **mermaid.live** - Online Mermaid editor and renderer
3. **VS Code** - Use Mermaid Preview extension
4. **Graphviz** - Render DOT files: `dot -Tpng color.dot -o color.png`

**For PNG/SVG generation** (optional):
```bash
# Install Mermaid CLI globally
npm install -g @mermaid-js/mermaid-cli

# Generate image
mmdc -i typography.mmd -o typography.png
```

### Provenance Analysis

```bash
# Why does this token have this value?
dcv why typography.size.h1

# JSON output
dcv why color.role.text.default --format json
```

### Build Tokens

```bash
# Build tokens
dcv build

# Build all formats
dcv build --all-formats

# Watch mode
dcv build --watch
```

### Set Token Values

```bash
# Set a single token
dcv set typography.size.h1=32px

# Set color with OKLCH
dcv set color.palette.brand.500=oklch(0.65 0.15 280)
```

---

## Use Cases

✅ **Design System Validation** - Catch inconsistencies in CI/CD
✅ **Accessibility Compliance** - Ensure WCAG 2.1 AA/AAA
✅ **Multi-Breakpoint** - Validate responsive token overrides
✅ **Dependency Analysis** - Visualize token relationships
✅ **Token Debugging** - Understand where values come from

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Token Dependency Graph (DAG)    │
│   Tracks references & dependencies  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Constraint Validation Engine   │
│  ┌──────────────────────────────┐  │
│  │  Plugin-based architecture   │  │
│  │  - Monotonic                 │  │
│  │  - WCAG Contrast             │  │
│  │  - Threshold                 │  │
│  │  - Lightness                 │  │
│  │  - Cross-Axis                │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│        Violation Reporting          │
│  - Descriptive error messages       │
│  - Provenance tracing               │
│  - Graph visualization              │
└─────────────────────────────────────┘
```

See [Architecture.md](./Architecture.md) for complete technical details.

---

## Programmatic API

### Basic Usage

```typescript
import { validate, flattenTokens } from 'design-constraint-validator';

// Load and flatten tokens
const tokens = await flattenTokens('./tokens/tokens.json', {
  overridesDir: './tokens/overrides',
  breakpoint: 'md'
});

// Run validation
const result = await validate(tokens, {
  constraintsDir: './themes',
  failOn: 'error'
});

// Check results
console.log(JSON.stringify(result, null, 2));
// {
//   "ok": false,
//   "counts": { "checked": 42, "violations": 3, "warnings": 0 },
//   "violations": [
//     {
//       "ruleId": "wcag-contrast",
//       "level": "error",
//       "message": "Insufficient contrast ratio: 2.3:1 (requires 4.5:1)",
//       "nodes": ["color.text.primary", "color.bg.surface"]
//     }
//   ],
//   "stats": { "durationMs": 124 }
// }

if (!result.ok) {
  process.exit(1);
}
```

### Available Exports

```typescript
// Core engine
export { validate, validateConstraint } from 'design-constraint-validator';

// Token utilities
export { flattenTokens, applyPatch } from 'design-constraint-validator';

// Constraint plugins
export {
  wcagConstraint,
  monotonicConstraint,
  thresholdConstraint,
  crossAxisConstraint
} from 'design-constraint-validator';

// Types
export type {
  Token,
  ValidationResult,
  Constraint,
  ConstraintViolation
} from 'design-constraint-validator';
```

See [API.md](./API.md) for complete API reference.

---

## FAQ

### How does the tool find my tokens and constraints?

By default, it looks for:
- **Tokens**: `tokens.json` or `tokens/*.json`
- **Constraints**: `themes/*.json` or `themes/**/*.json`

You can customize paths in a `dcv.config.json` file. See [Configuration.md](./Configuration.md) for details.

### What's the relationship with DecisionThemes?

`design-constraint-validator` is the **core validation engine** - it validates any design tokens against constraints.

**DecisionThemes** (coming soon) is a complete design system framework that uses this validator under the hood, plus adds:
- 5-axis decision framework (Tone, Emphasis, Size, Density, Shape)
- Theme configurator UI
- Decision → Token mapping

Think of it as: **design-constraint-validator** = engine, **DecisionThemes** = full product built on the engine.

### Can I use this with my existing tokens?

Yes! As long as your tokens follow a structured JSON format. The tool supports:
- [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/) format
- Custom nested JSON structures
- Token references with `{token.path}` syntax

### How do I use incremental validation?

Incremental validation automatically detects changed tokens and only validates those tokens plus their dependents. This feature is built-in - no configuration needed. When you run `dcv validate`, it will use cached results for unchanged tokens.

### What breakpoints are supported?

The tool supports responsive tokens with breakpoint-specific overrides. Place override files in `tokens/overrides/`:
- `tokens/overrides/sm.json` - Small screens
- `tokens/overrides/md.json` - Medium screens
- `tokens/overrides/lg.json` - Large screens

Validate specific breakpoints with `--breakpoint md` or all breakpoints with `--all-breakpoints`.

### Can I use this in CI/CD?

Absolutely! That's a primary use case:

```yaml
# .github/workflows/validate-tokens.yml
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

The tool exits with non-zero code on validation failures, making it perfect for CI/CD gates.

### How do I visualize my token dependencies?

Use the `graph` command:

```bash
# Generate Mermaid diagram (renders on GitHub)
dcv graph --hasse typography --format mermaid > typography.mmd

# Generate Graphviz DOT
dcv graph --hasse color --format dot > color.dot

# Then render with Graphviz
dot -Tpng color.dot -o color.png
```

### What Node.js version do I need?

Node.js 18 or higher is required.

---

## Related Projects

This is the **core validation engine**. For a complete decision-driven design system with a 5-axis framework (Tone, Emphasis, Size, Density, Shape) and theme configurator UI, see **DecisionThemes** (coming soon).

---

## Philosophy

> **Constraints, not conventions.**

Design systems need more than naming conventions - they need mathematical guarantees. This validator:

1. **Enforces relationships** - Typography hierarchies, color progressions
2. **Validates accessibility** - WCAG contrast with alpha compositing
3. **Explains violations** - Provenance tracing shows why rules fail
4. **Scales with complexity** - Incremental validation of 1000s of tokens

---

## See Also

- **[Getting Started](./Getting-Started.md)** - Step-by-step tutorial
- **[Constraints](./Constraints.md)** - All constraint types in detail
- **[CLI Reference](./CLI.md)** - Complete command documentation
- **[Configuration](./Configuration.md)** - Config file options
- **[API Reference](./API.md)** - Programmatic usage
- **[Architecture](./Architecture.md)** - Internal design
- **[Examples](./Examples.md)** - Sample projects
