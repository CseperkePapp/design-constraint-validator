# Configuration

Complete guide to configuring Design Constraint Validator.

## Configuration File Discovery

DCV searches for configuration files in this order:

1. `dcv.config.json`
2. `dcv.config.js` (ESM module)
3. `.dcvrc.json`
4. `package.json` (under `"dcv"` key)
5. Command-line arguments (highest priority)

**Recommendation:** Use `dcv.config.json` for simplicity.

---

## Default Behavior (Zero Config)

Without a config file, DCV uses these defaults:

```javascript
{
  tokens: "tokens.json",           // or tokens/*.json
  themes: "themes",                 // all *.json in themes/
  overrides: "tokens/overrides",   // breakpoint overrides
  breakpoints: ["sm", "md", "lg"]  // standard breakpoints
}
```

---

## Configuration Schema

### Basic Configuration

**dcv.config.json:**
```json
{
  "tokens": "design-tokens.json",
  "themes": "constraints",
  "overrides": "tokens/breakpoints"
}
```

### Full Configuration

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
    "quiet": false,
    "strict": false
  },
  
  "graph": {
    "format": "mermaid",
    "highlightViolations": true
  },
  
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.default",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text (AA)"
      }
    ]
  }
}
```

---

## Configuration Options

### Paths

#### `tokens`
**Type:** `string | string[]`  
**Default:** `"tokens.json"`

Path(s) to token files.

```json
{
  "tokens": "design-tokens.json"
}
```

```json
{
  "tokens": [
    "tokens/color.json",
    "tokens/typography.json",
    "tokens/spacing.json"
  ]
}
```

```json
{
  "tokens": "tokens/**/*.json"
}
```

#### `themes`
**Type:** `string | string[]`  
**Default:** `"themes"`

Path(s) to constraint/theme files.

```json
{
  "themes": "constraints"
}
```

```json
{
  "themes": [
    "themes/wcag.json",
    "themes/typography.order.json"
  ]
}
```

#### `overrides`
**Type:** `string`  
**Default:** `"tokens/overrides"`

Directory containing breakpoint override files.

```json
{
  "overrides": "tokens/breakpoints"
}
```

**Expected structure:**
```
tokens/breakpoints/
├── sm.json      # Small screens
├── md.json      # Medium screens
├── lg.json      # Large screens
└── xl.json      # Extra large screens
```

---

### Breakpoints

#### `breakpoints`
**Type:** `string[]`  
**Default:** `["sm", "md", "lg"]`

Available breakpoint names.

```json
{
  "breakpoints": ["mobile", "tablet", "desktop"]
}
```

```json
{
  "breakpoints": ["xs", "sm", "md", "lg", "xl", "2xl"]
}
```

---

### Output

#### `output`
**Type:** `object`

Default output paths for build command.

```json
{
  "output": {
    "css": "dist/tokens.css",
    "js": "dist/tokens.js",
    "json": "dist/tokens.json"
  }
}
```

---

### Validation

#### `validation`
**Type:** `object`

Default validation behavior.

```json
{
  "validation": {
    "failOn": "error",    // "error" | "warn" | "off"
    "quiet": false,       // Minimal output
    "strict": false,      // Fail on any issue
    "summary": "table"    // "table" | "json"
  }
}
```

**Options:**
- `failOn` - When to exit with error code
  - `"error"` (default) - Fail on errors only
  - `"warn"` - Fail on warnings and errors
  - `"off"` - Never fail (reporting only)
- `quiet` - Reduce output verbosity
- `strict` - Stricter validation rules
- `summary` - Output format for validation results

---

### Graph

#### `graph`
**Type:** `object`

Default graph generation settings.

```json
{
  "graph": {
    "format": "mermaid",
    "highlightViolations": true,
    "violationColor": "#ff0000",
    "labelViolations": true,
    "labelTruncate": 50
  }
}
```

**Options:**
- `format` - Output format (`"mermaid"` | `"dot"` | `"json"`)
- `highlightViolations` - Highlight violated constraints
- `violationColor` - Color for violations (hex)
- `labelViolations` - Add violation messages as labels
- `labelTruncate` - Truncate labels to N characters

---

### Constraints

You can define constraints directly in the config file:

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text.default",
        "background": "color.bg.surface",
        "ratio": 4.5,
        "description": "Body text on surface (AA)"
      },
      {
        "foreground": "color.text.heading",
        "background": "color.bg.surface",
        "ratio": 7.0,
        "description": "Headings on surface (AAA)"
      }
    ]
  }
}
```

**Note:** Constraints in config files are merged with theme files. Theme files take precedence.

---

## JavaScript Config

For dynamic configuration, use a `.js` file:

**dcv.config.js:**
```javascript
export default {
  tokens: process.env.CI ? 'tokens.prod.json' : 'tokens.dev.json',
  themes: 'themes',
  
  validation: {
    failOn: process.env.CI ? 'warn' : 'error',
    strict: process.env.CI === 'true'
  },
  
  output: {
    css: `dist/${process.env.NODE_ENV || 'dev'}/tokens.css`
  }
};
```

---

## package.json Config

For simple projects, add config to `package.json`:

```json
{
  "name": "my-design-system",
  "dcv": {
    "tokens": "design-tokens.json",
    "themes": "constraints",
    "validation": {
      "failOn": "warn"
    }
  }
}
```

---

## Command-Line Override

Command-line arguments override config files:

```bash
# Override tokens path
dcv validate --tokens custom-tokens.json

# Override breakpoint
dcv validate --breakpoint xl

# Override fail-on
dcv validate --fail-on warn
```

**Priority:** CLI args > config file > defaults

---

## Environment Variables

```bash
# Debug mode
DCV_DEBUG_SET=1 dcv set color.brand=blue

# Node environment
NODE_ENV=production dcv build
```

---

## Multi-Project Setup

### Monorepo Structure

```
packages/
├── design-tokens/
│   ├── tokens.json
│   ├── dcv.config.json       # Shared config
│   └── themes/
├── web-app/
│   └── dcv.config.json       # Inherits from ../design-tokens
└── mobile-app/
    └── dcv.config.json
```

**packages/design-tokens/dcv.config.json:**
```json
{
  "tokens": "tokens.json",
  "themes": "themes"
}
```

**packages/web-app/dcv.config.json:**
```json
{
  "tokens": "../design-tokens/tokens.json",
  "themes": "../design-tokens/themes",
  "overrides": "../design-tokens/overrides/web"
}
```

---

## Example Configurations

### Minimal (Single File)

```json
{
  "tokens": "tokens.json"
}
```

### Standard (Multiple Themes)

```json
{
  "tokens": "tokens.json",
  "themes": [
    "themes/wcag.json",
    "themes/typography.order.json",
    "themes/color.order.json"
  ]
}
```

### Multi-Breakpoint

```json
{
  "tokens": "tokens.json",
  "themes": "themes",
  "overrides": "tokens/breakpoints",
  "breakpoints": ["mobile", "tablet", "desktop", "wide"]
}
```

### CI/CD Optimized

```json
{
  "tokens": "tokens.json",
  "themes": "themes",
  "validation": {
    "failOn": "warn",
    "strict": true,
    "summary": "json"
  },
  "graph": {
    "format": "json"
  }
}
```

### Design System Package

```json
{
  "tokens": "src/tokens.json",
  "themes": "src/themes",
  "overrides": "src/tokens/overrides",
  "breakpoints": ["sm", "md", "lg", "xl"],
  
  "output": {
    "css": "dist/tokens.css",
    "js": "dist/tokens.esm.js",
    "json": "dist/tokens.json"
  },
  
  "validation": {
    "failOn": "error",
    "summary": "table"
  },
  
  "graph": {
    "format": "mermaid",
    "highlightViolations": true
  }
}
```

---

## Config File Location

DCV searches for config starting from:
1. Current working directory
2. Parent directories (up to git root or home)

**Best practice:** Place config at project root.

---

## Validation Schema

DCV uses Zod for config validation. Invalid configs will show clear error messages:

```
Config validation error:
  tokens: Expected string, received number
  themes: Required field missing
```

---

## Next Steps

- **[Getting Started](./Getting-Started.md)** - Quick start guide
- **[CLI Reference](./CLI.md)** - All CLI commands
- **[Constraints](./Constraints.md)** - Constraint types
