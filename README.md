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

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

MIT © Cseperke Papp
