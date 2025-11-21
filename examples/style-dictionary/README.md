# Style Dictionary Integration

DCV works seamlessly with Style Dictionary token files using the standard `value` property format.

## Quick Start

1. **Export tokens from Style Dictionary**
2. **Validate with DCV:**

```bash
npx design-constraint-validator validate --tokens tokens.json
```

**Note:** DCV looks for constraint files in a `themes/` directory (see below)

## Example Token File

Style Dictionary uses a `value` property (without `$` prefix):

```json
{
  "color": {
    "base": {
      "gray": {
        "light": { "value": "#CCCCCC" },
        "medium": { "value": "#999999" },
        "dark": { "value": "#111111" }
      },
      "red": { "value": "#FF0000" },
      "green": { "value": "#00FF00" }
    },
    "font": {
      "base": { "value": "{color.base.red.value}" },
      "secondary": { "value": "{color.base.green.value}" },
      "tertiary": { "value": "{color.base.gray.light.value}" }
    }
  },
  "size": {
    "font": {
      "small": { "value": "0.75rem" },
      "medium": { "value": "1rem" },
      "large": { "value": "1.5rem" },
      "xl": { "value": "2rem" }
    }
  },
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" },
    "xl": { "value": "32px" }
  }
}
```

## DCV Compatibility

DCV automatically detects and normalizes Style Dictionary format:

- ✅ `value` property → DCV's internal `$value`
- ✅ Token references `{color.base.red.value}` → resolved automatically
- ✅ Nested structure → flattened to dot-path IDs (`color.base.red`)

## Constraint Validation

### Project Structure

```
your-project/
├── tokens.json                    # Style Dictionary tokens
└── themes/
    ├── typography.order.json      # Font size hierarchy
    ├── color.order.json           # Color scale ordering
    ├── spacing.order.json         # Spacing scale
    └── wcag.json                  # Accessibility constraints
```

### Typography Scale

**themes/typography.order.json:**
```json
{
  "order": [
    "size.font.xl",
    "size.font.large",
    "size.font.medium",
    "size.font.small"
  ],
  "direction": "decreasing"
}
```

**Validates:** `xl > large > medium > small`

### Spacing Scale

**themes/spacing.order.json:**
```json
{
  "order": [
    "spacing.xs",
    "spacing.sm",
    "spacing.md",
    "spacing.lg",
    "spacing.xl"
  ],
  "direction": "increasing"
}
```

**Validates:** `xs < sm < md < lg < xl`

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
        "fg": "color.font.base",
        "bg": "color.base.gray.light"
      }
    ]
  }]
}
```

## Token References

Style Dictionary uses `{token.path.value}` for references. DCV resolves these automatically:

```json
{
  "color": {
    "base": { "red": { "value": "#FF0000" } },
    "semantic": {
      "error": { "value": "{color.base.red.value}" }
    }
  }
}
```

DCV resolves `{color.base.red.value}` → `#FF0000` before validation.

## Build Integration

Style Dictionary can build multiple outputs. Validate **before** building:

**build.js:**
```javascript
const StyleDictionary = require('style-dictionary');
const { execSync } = require('child_process');

// Validate tokens first
try {
  execSync('npx design-constraint-validator validate --tokens tokens.json', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Token validation failed!');
  process.exit(1);
}

// If validation passes, build outputs
const sd = StyleDictionary.extend({
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables'
      }]
    }
  }
});

sd.buildAllPlatforms();
```

## CI/CD Integration

**GitHub Actions example:**

```yaml
name: Validate Tokens

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
      
      - name: Validate design tokens
        run: npx design-constraint-validator validate --tokens tokens.json --format json --output validation-results.json
      
      - name: Build Style Dictionary outputs
        if: success()
        run: npm run build
      
      - name: Upload validation results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: validation-results
          path: validation-results.json
```

## Converting from Style Dictionary to DCV Format

If you prefer using `$value` syntax:

**tokens.json (Style Dictionary):**
```json
{
  "color": {
    "primary": { "value": "#FF0000" }
  }
}
```

**tokens.json (DCV native):**
```json
{
  "color": {
    "primary": { "$value": "#FF0000" }
  }
}
```

Both formats work! DCV automatically normalizes them.

## Troubleshooting

### Issue: Token not found

**Error:** `Could not resolve token color.font.base`

**Solution:** Check token ID matches nested path:
- Token: `{ "color": { "font": { "base": { "value": "#FF0000" } } } }`
- ID: `color.font.base` ✅

### Issue: Reference not resolved

**Error:** `Could not resolve token {color.base.red.value}`

**Style Dictionary uses:** `{color.base.red.value}`  
**DCV expects:** `{color.base.red}`

**Solution:** DCV auto-strips `.value` from references. Use either format.

## Example: Complete Style Dictionary + DCV Setup

**tokens.json:**
```json
{
  "color": {
    "base": {
      "black": { "value": "#000000" },
      "white": { "value": "#ffffff" }
    },
    "text": {
      "primary": { "value": "{color.base.black.value}" },
      "inverse": { "value": "{color.base.white.value}" }
    },
    "background": {
      "primary": { "value": "{color.base.white.value}" }
    }
  },
  "font": {
    "size": {
      "h1": { "value": "32px" },
      "h2": { "value": "24px" },
      "body": { "value": "16px" }
    }
  }
}
```

**themes/typography.order.json:**
```json
{
  "order": ["font.size.h1", "font.size.h2", "font.size.body"],
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
      { "fg": "color.text.primary", "bg": "color.background.primary" }
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

## Resources

- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [DCV Configuration Guide](../../docs/Configuration.md)
- [Complete Examples](../../examples/)
