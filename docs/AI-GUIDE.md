# AI Assistant Guide for DCV

Quick reference for AI assistants (ChatGPT, Claude, Copilot) helping users with `design-constraint-validator`.

## Core Commands (Copy-Paste Ready)

### Validation
```bash
# Basic validation
npx dcv validate

# Validate specific file
npx dcv validate tokens.json

# Non-blocking (report only)
npx dcv validate --fail-on off

# JSON output for parsing
npx dcv validate --format json

# Save results to file
npx dcv validate --format json --output results.json

# Generate audit receipt
npx dcv validate --receipt audit.json
```

### Analysis
```bash
# Explain why a token has its value
npx dcv why color.primary

# Generate dependency graph
npx dcv graph --format mermaid > graph.mmd
npx dcv graph --format dot | dot -Tpng > graph.png
```

### Building
```bash
# Build CSS from tokens
npx dcv build --format css

# Build all formats
npx dcv build --all-formats
```

## Exit Codes (for CI scripts)

- `0` = Success (no violations) or `--fail-on off`
- `1` = Constraint violations found
- `2` = Configuration error (missing files, invalid config)
- `3` = Runtime error (unexpected exception)

## Common User Questions

### "How do I validate my tokens?"
```bash
npx dcv validate tokens.json
```

### "It says 'Cannot find tokens.json'"
Either create `tokens.json` in the project root, or specify the path:
```bash
npx dcv validate --tokens path/to/tokens.json
```

### "I want to see errors but not fail my build"
```bash
npx dcv validate --fail-on off
```

### "How do I use this in CI?"
```yaml
# GitHub Actions
- run: npx dcv validate --fail-on warn
```

### "Can I get machine-readable output?"
```bash
npx dcv validate --format json --output violations.json
```

### "How do I visualize my token relationships?"
```bash
npx dcv graph --format mermaid > graph.mmd
# Then render on GitHub or with mermaid-cli
```

## JSON Output Schema

When user asks "what's the output format?":

```typescript
{
  "ok": boolean,
  "counts": { "checked": number, "violations": number, "warnings": number },
  "violations": [{
    "ruleId": string,      // e.g., "wcag-contrast", "threshold"
    "level": "error"|"warn",
    "message": string,
    "nodes": string[],     // affected token IDs
    "context": {}          // constraint-specific data
  }],
  "stats": { "durationMs": number, "engineVersion": string, "timestamp": string }
}
```

## File Structure

When helping users set up:

```
project/
├── tokens.json              # Design tokens (W3C DTCG format)
├── themes/                  # Constraint definitions
│   ├── wcag.json           # Color contrast rules
│   ├── typography.order.json # Type scale hierarchy
│   └── spacing.order.json   # Spacing scale
└── dcv.config.json          # Optional: custom paths
```

## Constraint Types

Quick examples to show users:

**Monotonic (ordering)**
```json
{
  "order": [
    ["typography.h1", ">=", "typography.h2"],
    ["spacing.xl", ">=", "spacing.lg"]
  ]
}
```

**WCAG (contrast)**
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

**Threshold (min/max)**
```json
{
  "constraints": {
    "threshold": [{
      "id": "control.size.min",
      "op": ">=",
      "value": "44px"
    }]
  }
}
```

## Programmatic API

When user asks "can I use this in code?":

```typescript
import { validate, flattenTokens } from 'design-constraint-validator';

const tokens = await flattenTokens('./tokens.json');
const result = await validate(tokens, {
  constraintsDir: './themes',
  failOn: 'error'
});

if (!result.ok) {
  console.error(`Found ${result.counts.violations} violations`);
  process.exit(1);
}
```

## Troubleshooting Quick Fixes

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install design-constraint-validator` |
| "ESM import error" | Add `"type": "module"` to package.json |
| "No constraints found" | Create `themes/` folder with `.json` constraint files |
| "Unknown token reference" | Check token IDs match exactly (case-sensitive, dot notation) |

## Installation Paths

When user asks "how to install?":

**Local (recommended for projects):**
```bash
npm install -D design-constraint-validator
npx dcv validate
```

**Global (for CLI everywhere):**
```bash
npm install -g design-constraint-validator
dcv validate
```

**No install (quick try):**
```bash
npx design-constraint-validator validate
```

## Links for Deeper Help

- Docs: https://github.com/CseperkePapp/design-constraint-validator/tree/main/docs
- Examples: https://github.com/CseperkePapp/design-constraint-validator/tree/main/examples
- Issues: https://github.com/CseperkePapp/design-constraint-validator/issues

## Common Patterns to Suggest

### CI Integration
```yaml
# Report violations but don't block
- run: npx dcv validate --fail-on off --format json --output results.json
- uses: actions/upload-artifact@v3
  with: { name: dcv-results, path: results.json }
```

### Pre-commit Hook
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx dcv validate --fail-on error"
    }
  }
}
```

### Watch Mode (requires custom script)
```json
{
  "scripts": {
    "validate:watch": "nodemon -e json --exec 'npx dcv validate'"
  }
}
```

---

**Note to AI:** This tool validates *relationships* between tokens (contrast, hierarchy, thresholds), not schemas. Think "linter for design decisions" not "JSON validator."
