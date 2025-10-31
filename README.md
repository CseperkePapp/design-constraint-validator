# design-token-validator

[![npm version](https://badge.fury.io/js/design-token-validator.svg)](https://www.npmjs.com/package/design-token-validator)
[![CI](https://github.com/CseperkePapp/design-token-validator/actions/workflows/ci.yml/badge.svg)](https://github.com/CseperkePapp/design-token-validator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Constraint validation engine for design tokens** with mathematical rigor and advanced debugging.

> Validate design tokens against explicit constraints to ensure consistency and accessibility.

## Features

- ✨ **5 Constraint Types** - Monotonic, WCAG, Threshold, Lightness, Cross-Axis
- ✨ **Responsive** - Multi-breakpoint validation (sm/md/lg)
- ✨ **Explainable** - "Why?" command traces token provenance
- ✨ **Visualize** - Export dependency graphs (Mermaid, Graphviz)
- ✨ **CI-Friendly** - JSON output, exit codes, performance budgets
- ✨ **Type-Safe** - Full TypeScript support
- ✨ **Incremental** - Only validates changed tokens + dependents

## Quick Start

```bash
# Install
npm install -D design-token-validator

# Validate tokens
npx dtv validate

# Visualize dependencies
npx dtv graph --hasse typography --format mermaid

# Understand token provenance
npx dtv why color.role.text.default
```

## Getting Started

### Your First Validation (5 minutes)

**1. Install**
```bash
npm install -D design-token-validator
```

**2. Create `tokens.json`** in your project root:
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

**3. Create `themes/wcag.json`** (WCAG contrast constraint):
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

**4. Create `themes/typography.order.json`** (size hierarchy):
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

**5. Validate**
```bash
npx dtv validate
```

**Output:**
```
✅ validate: 0 error(s), 0 warning(s)
```

Success! Your tokens pass all constraints.

### What if validation fails?

Try changing `h2` to `"40px"` (larger than h1) and run validation again:

```bash
npx dtv validate
```

**Output:**
```
validate: 1 error(s), 0 warning(s)
ERROR monotonic  typography.size.h2 @ typography.order.json — typography.size.h1 >= typography.size.h2 violated: 32px < 40px
```

The validator explains exactly what failed and why.

### Minimal Working Example

See [examples/minimal/](examples/minimal/) for a complete minimal setup you can copy.

## Example Output

### ✅ Successful Validation
```bash
$ npx dtv validate
✅ validate: 0 error(s), 0 warning(s)
```

### ❌ Failed Validation
```bash
$ npx dtv validate
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

### 5. Cross-Axis Constraints
Multi-domain relationships

```json
{
  "when": { "id": "typography.weight.body", "op": "<=", "value": 400 },
  "require": { "id": "typography.size.body", "op": ">=", "fallback": "16px" }
}
```

## CLI Commands

### Validate

```bash
# Validate all tokens
dtv validate

# Validate specific breakpoint
dtv validate --breakpoint md

# All breakpoints with summary
dtv validate --all-breakpoints --summary table

# Fail on warnings
dtv validate --fail-on warn
```

### Graph Visualization

Export token dependency graphs in text formats (Mermaid, Graphviz DOT):

```bash
# Export Mermaid format (renders on GitHub)
dtv graph --hasse typography --format mermaid > typography.mmd

# Export Graphviz DOT format
dtv graph --hasse color --format dot > color.dot

# JSON format for programmatic use
dtv graph --hasse layout --format json > layout.json

# Show only violations
dtv graph --hasse color --only-violations --format mermaid

# Highlight violations
dtv graph --hasse layout --highlight-violations --format mermaid
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
dtv why typography.size.h1

# JSON output
dtv why color.role.text.default --format json
```

### Build Tokens

```bash
# Build tokens
dtv build

# Build all formats
dtv build --all-formats

# Watch mode
dtv build --watch
```

### Set Token Values

```bash
# Set a single token
dtv set typography.size.h1=32px

# Set color with OKLCH
dtv set color.palette.brand.500=oklch(0.65 0.15 280)
```

## Use Cases

✅ **Design System Validation** - Catch inconsistencies in CI/CD
✅ **Accessibility Compliance** - Ensure WCAG 2.1 AA/AAA
✅ **Multi-Breakpoint** - Validate responsive token overrides
✅ **Dependency Analysis** - Visualize token relationships
✅ **Token Debugging** - Understand where values come from

## Example

**tokens.json:**
```json
{
  "typography": {
    "size": {
      "h1": "32px",
      "h2": "24px",
      "body": "16px"
    }
  },
  "color": {
    "role": {
      "text": { "default": "#1a1a1a" },
      "bg": { "surface": "#ffffff" }
    }
  }
}
```

**themes/typography.order.json:**
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

**Validate:**
```bash
$ npx dtv validate

✅ validate [bp=base]: 0 error(s), 0 warning(s)
```

## Architecture

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

## Documentation

- [Getting Started](https://github.com/CseperkePapp/design-token-validator/wiki/Getting-Started)
- [Constraint Types](https://github.com/CseperkePapp/design-token-validator/wiki/Constraints)
- [CLI Reference](https://github.com/CseperkePapp/design-token-validator/wiki/CLI)
- [Architecture](https://github.com/CseperkePapp/design-token-validator/wiki/Architecture)
- [API](https://github.com/CseperkePapp/design-token-validator/wiki/API)

## Philosophy

> **Constraints, not conventions.**

Design systems need more than naming conventions - they need mathematical guarantees. This validator:

1. **Enforces relationships** - Typography hierarchies, color progressions
2. **Validates accessibility** - WCAG contrast with alpha compositing
3. **Explains violations** - Provenance tracing shows why rules fail
4. **Scales with complexity** - Incremental validation of 1000s of tokens

## Related Projects

This is the **core validation engine**. For a complete decision-driven design system with a 5-axis framework (Tone, Emphasis, Size, Density, Shape) and theme configurator UI, see **DecisionThemes** (coming soon).

## FAQ

### How does the tool find my tokens and constraints?

By default, it looks for:
- **Tokens**: `tokens.json` or `tokens/*.json`
- **Constraints**: `themes/*.json` or `themes/**/*.json`

You can customize paths in a `dtv.config.json` file. See [CONFIGURATION.md](CONFIGURATION.md) for details.

### What's the relationship with DecisionThemes?

`design-token-validator` is the **core validation engine** - it validates any design tokens against constraints.

**DecisionThemes** (coming soon) is a complete design system framework that uses this validator under the hood, plus adds:
- 5-axis decision framework (Tone, Emphasis, Size, Density, Shape)
- Theme configurator UI
- Decision → Token mapping

Think of it as: **design-token-validator** = engine, **DecisionThemes** = full product built on the engine.

### Can I use this with my existing tokens?

Yes! As long as your tokens follow a structured JSON format. The tool supports:
- [W3C Design Tokens Community Group](https://design-tokens.github.io/community-group/) format
- Custom nested JSON structures
- Token references with `{token.path}` syntax

### How do I use incremental validation?

Incremental validation automatically detects changed tokens and only validates those tokens plus their dependents. This feature is built-in - no configuration needed. When you run `dtv validate`, it will use cached results for unchanged tokens.

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
      - run: npx dtv validate --fail-on warn
```

The tool exits with non-zero code on validation failures, making it perfect for CI/CD gates.

### How do I visualize my token dependencies?

Use the `graph` command:

```bash
# Generate Mermaid diagram (renders on GitHub)
dtv graph --hasse typography --format mermaid > typography.mmd

# Generate Graphviz DOT
dtv graph --hasse color --format dot > color.dot

# Then render with Graphviz
dot -Tpng color.dot -o color.png
```

### What Node.js version do I need?

Node.js 18 or higher is required.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT © Cseperke Papp
