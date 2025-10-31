# Configuration Guide

This guide explains how `design-constraint-validator` discovers and loads your tokens and constraints.

## Default Behavior

By default, the validator automatically looks for:

### Tokens
- `tokens.json` (root level)
- `tokens/*.json` (all JSON files in tokens folder)
- `tokens/**/*.json` (recursive)

### Constraints
- `themes/*.json` (all JSON files in themes folder)
- `themes/**/*.json` (recursive)

### Overrides (for breakpoints)
- `tokens/overrides/sm.json` - Small screens
- `tokens/overrides/md.json` - Medium screens
- `tokens/overrides/lg.json` - Large screens

## Configuration Files

You can customize paths and behavior using a configuration file. The validator searches for config in this order:

1. `dcv.config.json`
2. `dcv.config.js`
3. `.dcvrc.json`
4. `package.json` (under `"dcv"` key)

## Configuration Schema

### Basic Example

**dcv.config.json:**
```json
{
  "tokens": "design-tokens.json",
  "themes": "constraints",
  "overrides": "tokens/breakpoints"
}
```

### Full Example

**dcv.config.json:**
```json
{
  "tokens": "tokens.json",
  "themes": "themes",
  "overrides": "tokens/overrides",
  "breakpoints": ["sm", "md", "lg", "xl"],
  "output": {
    "css": "dist/tokens.css",
    "js": "dist/tokens.js",
    "json": "dist/tokens.json"
  },
  "validation": {
    "failOn": "error",
    "quiet": false
  }
}
```

### In package.json

You can also add configuration to your `package.json`:

```json
{
  "name": "my-project",
  "devDependencies": {
    "design-constraint-validator": "^1.0.0"
  },
  "dcv": {
    "tokens": "src/tokens.json",
    "themes": "src/constraints"
  }
}
```

## Configuration Options

### `tokens`
**Type**: `string` | `string[]`
**Default**: `"tokens.json"`

Path(s) to token files or directories.

```json
{
  "tokens": "design-tokens.json"
}
```

Or multiple paths:
```json
{
  "tokens": ["tokens/colors.json", "tokens/typography.json"]
}
```

### `themes`
**Type**: `string` | `string[]`
**Default**: `"themes"`

Path(s) to constraint definition files or directories.

```json
{
  "themes": "constraints"
}
```

### `overrides`
**Type**: `string`
**Default**: `"tokens/overrides"`

Directory containing breakpoint-specific token overrides.

```json
{
  "overrides": "tokens/responsive"
}
```

### `breakpoints`
**Type**: `string[]`
**Default**: `["sm", "md", "lg"]`

Available breakpoint names. Each should have a corresponding file in the overrides directory.

```json
{
  "breakpoints": ["mobile", "tablet", "desktop"]
}
```

Then create:
- `tokens/overrides/mobile.json`
- `tokens/overrides/tablet.json`
- `tokens/overrides/desktop.json`

### `output`
**Type**: `object`
**Default**: `{ "css": "dist/tokens.css" }`

Build output paths for different formats.

```json
{
  "output": {
    "css": "dist/tokens.css",
    "js": "dist/tokens.js",
    "json": "dist/tokens.json"
  }
}
```

### `validation`
**Type**: `object`

Validation behavior settings.

```json
{
  "validation": {
    "failOn": "warn",    // "error" | "warn" | "never"
    "quiet": false        // Suppress output
  }
}
```

## File Discovery Details

### How tokens are loaded

1. Check for explicit `tokens` path in config
2. If directory path, load all `.json` files recursively
3. If file path, load that specific file
4. Merge all loaded token files into single token tree

### How constraints are loaded

1. Check for explicit `themes` path in config
2. If directory path, load all `.json` files recursively
3. Each constraint file is loaded independently
4. File naming determines constraint type (e.g., `wcag.json`, `typography.order.json`)

### How overrides are loaded

1. Check for explicit `overrides` path in config
2. For each breakpoint in `breakpoints` config:
   - Look for `{overrides}/{breakpoint}.json`
   - If found, load and merge with base tokens
3. Validation runs separately for each breakpoint + base

## Token File Format

Tokens should follow nested JSON structure:

```json
{
  "color": {
    "brand": { "$value": "#7e3ff2" },
    "text": { "$value": "{color.brand}" }
  }
}
```

**Key points:**
- Use `$value` for actual values (W3C Design Tokens format)
- Use `{path.to.token}` for references
- Nested structure creates namespaced token IDs (e.g., `color.brand`)

## Constraint File Format

Constraints are organized by type in separate files:

### Monotonic Constraints
**File**: `themes/typography.order.json`
```json
{
  "order": [
    ["typography.size.h1", ">=", "typography.size.h2"],
    ["typography.size.h2", ">=", "typography.size.body"]
  ]
}
```

### WCAG Constraints
**File**: `themes/wcag.json`
```json
{
  "constraints": {
    "wcag": [{
      "foreground": "color.text",
      "background": "color.bg",
      "ratio": 4.5
    }]
  }
}
```

### Threshold Constraints
**File**: `themes/thresholds.json`
```json
{
  "constraints": {
    "threshold": [{
      "id": "control.size.min",
      "op": ">=",
      "valuePx": 44,
      "where": "Touch target (WCAG)"
    }]
  }
}
```

## Advanced Configuration

### Multiple Token Sources

If your tokens are split across multiple files:

```json
{
  "tokens": [
    "tokens/colors.json",
    "tokens/typography.json",
    "tokens/spacing.json"
  ]
}
```

All files will be merged into a single token tree.

### Custom Constraint Directories

Organize constraints by category:

```json
{
  "themes": [
    "constraints/accessibility",
    "constraints/hierarchy",
    "constraints/thresholds"
  ]
}
```

### Per-Project vs Global Config

**Per-project** (recommended):
- `dcv.config.json` in project root
- Committed to git
- Shared by team

**Global** (advanced):
- `~/.dcvrc.json` in home directory
- Applies to all projects without local config
- Good for personal defaults

## Environment Variables

Override config options via environment:

```bash
# Override tokens path
DCV_TOKENS=custom-tokens.json npx dcv validate

# Override themes path
DCV_THEMES=custom-constraints npx dcv validate

# Quiet mode
DCV_QUIET=true npx dcv validate
```

## Troubleshooting

### "No tokens found"

- Check `tokens.json` exists in project root
- Or specify path in `dcv.config.json`
- Verify JSON is valid

### "No constraints found"

- Create `themes/` directory
- Add at least one constraint file (e.g., `wcag.json`)
- Or specify path in config

### "Config validation failed"

- Check JSON syntax
- Verify paths exist
- See error message for specific schema violation

## Example Project Structures

### Minimal Structure
```
my-project/
├── tokens.json
├── themes/
│   └── wcag.json
└── package.json
```

### Medium Structure
```
my-project/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   └── overrides/
│       ├── sm.json
│       └── lg.json
├── themes/
│   ├── wcag.json
│   ├── typography.order.json
│   └── thresholds.json
├── dcv.config.json
└── package.json
```

### Large Structure
```
my-project/
├── design-tokens/
│   ├── primitives/
│   │   ├── colors.json
│   │   └── spacing.json
│   ├── semantic/
│   │   └── roles.json
│   └── breakpoints/
│       ├── mobile.json
│       ├── tablet.json
│       └── desktop.json
├── constraints/
│   ├── accessibility/
│   │   ├── wcag.json
│   │   └── touch-targets.json
│   ├── hierarchy/
│   │   ├── typography.json
│   │   └── spacing.json
│   └── cross-axis/
│       └── size-weight.json
├── dcv.config.json
└── package.json
```

**dcv.config.json for large structure:**
```json
{
  "tokens": "design-tokens",
  "themes": "constraints",
  "overrides": "design-tokens/breakpoints",
  "breakpoints": ["mobile", "tablet", "desktop"],
  "output": {
    "css": "dist/tokens.css",
    "json": "dist/tokens.json"
  }
}
```

## See Also

- [README.md](README.md) - Getting started guide
- [examples/minimal/](examples/minimal/) - Minimal working example
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributing guidelines
