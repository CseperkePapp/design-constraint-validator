# Getting Started

Welcome to Design Constraint Validator (DCV)! This guide will get you up and running in 5 minutes.

## Installation

### Local Installation (Recommended)

```bash
npm install -D design-constraint-validator
```

### Global Installation

```bash
npm install -g design-constraint-validator
```

### One-off Usage

```bash
npx dcv --help
```

## Prerequisites

- **Node.js** ≥ 18.x (ESM modules)
- Basic knowledge of design tokens

## Your First Validation

### Step 1: Create Tokens

Create a `tokens.json` file in your project root:

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

### Step 2: Create Constraints

Create a `themes/` folder with constraint files:

**themes/wcag.json** (WCAG contrast):
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

**themes/typography.order.json** (size hierarchy):
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

### Step 3: Validate

```bash
npx dcv validate
```

**Expected output:**
```
✅ validate: 0 error(s), 0 warning(s)
```

Congratulations! Your tokens pass all constraints.

## Understanding Failures

Let's intentionally break a constraint to see what happens.

### Break Typography Hierarchy

Edit `tokens.json` and change h2 to `"40px"` (larger than h1):

```json
{
  "typography": {
    "size": {
      "h1": { "$value": "32px" },
      "h2": { "$value": "40px" },  // ← Now larger than h1!
      "body": { "$value": "16px" }
    }
  }
}
```

Run validation again:

```bash
npx dcv validate
```

**Output:**
```
validate: 1 error(s), 0 warning(s)

ERROR monotonic  typography.size.h2
  typography.size.h1 >= typography.size.h2 violated: 32px < 40px
  Defined in: themes/typography.order.json
```

The validator tells you:
- **What failed** - monotonic constraint on `typography.size.h2`
- **Why it failed** - h1 (32px) should be ≥ h2 (40px)
- **Where it's defined** - in `themes/typography.order.json`

## Next Steps

### Explore Examples

```bash
# Working example
cd examples/minimal
dcv validate

# See constraint failures
dcv validate examples/failing/contrast-fail.tokens.json
dcv validate examples/failing/monotonicity-fail.tokens.json
```

### Learn More Commands

```bash
# Explain token provenance
dcv why typography.size.h1

# Visualize dependency graph
dcv graph --format mermaid > graph.mmd

# Build token outputs
dcv build --format css
```

### Customize Configuration

Create a `dcv.config.json` to customize paths:

```json
{
  "tokens": "design-tokens.json",
  "themes": "constraints",
  "overrides": "tokens/breakpoints"
}
```

See [Configuration](./Configuration.md) for full details.

### Add More Constraints

DCV supports multiple constraint types:
- **Monotonic** - Ordering relationships (h1 ≥ h2 ≥ body)
- **WCAG** - Color contrast accessibility
- **Threshold** - Min/max value guards (≥44px touch targets)
- **Lightness** - Color palette progression
- **Cross-Axis** - Multi-domain relationships

See [Constraints](./Constraints.md) for examples of each type.

## Common Issues

### "Cannot find tokens.json"

**Solution:** Either:
1. Create `tokens.json` in your project root, OR
2. Specify path: `dcv validate --tokens path/to/tokens.json`, OR
3. Configure in `dcv.config.json`

### "No constraints found"

**Solution:** Create a `themes/` folder with constraint files (`.json` files with `order` or `constraints` keys).

### ESM Import Errors

**Solution:** Ensure your `package.json` has `"type": "module"` or use `.mjs` extension.

## Getting Help

```bash
# Command help
dcv --help
dcv validate --help
dcv graph --help

# View version
dcv --version
```

**Questions?** Open an issue: https://github.com/CseperkePapp/design-constraint-validator/issues

## What's Next?

- **[Constraints Guide](./Constraints.md)** - Learn all constraint types
- **[CLI Reference](./CLI.md)** - Complete command documentation
- **[Configuration](./Configuration.md)** - Advanced configuration options
- **[Architecture](./Architecture.md)** - How DCV works internally
- **[API](./API.md)** - Programmatic usage
