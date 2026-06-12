# AI Assistant Guide for DCV

Quick reference for AI assistants helping users with
`design-constraint-validator`.

## Repository Workflow Skills

DCV includes reusable workflow skills under `.github/skills/` for disciplined
task execution:

- `.github/skills/workflow-investigation/SKILL.md` for risky or cross-cutting
  changes before editing.
- `.github/skills/workflow-qa-evidence/SKILL.md` for acceptance-criteria-based
  verification and evidence capture.
- `.github/skills/workflow-docs-sync/SKILL.md` when documentation and task
  surfaces must stay synchronized.

These are workflow skills, not DCV runtime/domain logic.

## Core Commands

### Validation

```bash
# Basic validation
npx dcv validate

# Validate a specific file
npx dcv validate tokens.json
npx dcv validate --tokens tokens.json

# Non-blocking report mode
npx dcv validate --fail-on off

# Machine-readable output
npx dcv validate --format json
npx dcv validate --format json --output results.json

# Audit receipt
npx dcv validate --format json --receipt audit.json
```

### Analysis

```bash
# Explain why a token has its value
npx dcv why color.primary

# Generate dependency graph
npx dcv graph --format mermaid > graph.mmd
npx dcv graph --format dot > graph.dot
npx dcv graph --format json > graph.json
```

### Building

```bash
npx dcv build --format css
npx dcv build --all-formats
```

## Exit Codes

- `0`: Success, or `--fail-on off`.
- `1`: Blocking constraint violations found.
- `2`: Configuration/setup/runtime command error.

## Common User Questions

### "How do I validate my tokens?"

```bash
npx dcv validate --tokens tokens.json
```

### "It says it cannot find my tokens"

Specify the file path:

```bash
npx dcv validate --tokens path/to/tokens.json
```

### "I want to see errors but not fail my build"

```bash
npx dcv validate --fail-on off
```

### "Can I get machine-readable output?"

```bash
npx dcv validate --format json --output violations.json
```

### "How do I visualize token relationships?"

```bash
npx dcv graph --format mermaid > graph.mmd
```

## JSON Output Shape

When a user asks about validation output:

```ts
{
  ok: boolean;
  counts: {
    checked: number;
    violations: number;
    warnings: number;
  };
  violations: Array<{
    ruleId: string;
    level: 'error' | 'warn';
    message: string;
    nodes?: string[];
    edges?: [string, string][];
    context?: Record<string, unknown>;
  }>;
  warnings?: Array<{
    ruleId: string;
    level: 'error' | 'warn';
    message: string;
    nodes?: string[];
    edges?: [string, string][];
    context?: Record<string, unknown>;
  }>;
  note?: string;
  stats: {
    durationMs: number;
    engineVersion: string;
    timestamp: string;
  };
  dcv: {
    name: string;
    version: string;
    repository: string;
  };
}
```

WCAG contrast violations expose `context.actual` and `context.required`.
Programmatic `validate()` returns `ok`, `counts`, `violations`, `warnings`, and
optional `note`, without CLI-only `stats` or `dcv`.

## Project Setup

Recommended minimal structure:

```text
project/
  tokens.json
  dcv.config.json
  themes/
    typography.order.json
    spacing.order.json
    cross-axis.rules.json
```

`themes/` is the default constraint directory for order and cross-axis JSON
files. WCAG and custom threshold rules are configured in `dcv.config.json`.

## Constraint Examples

### WCAG Contrast

`dcv.config.json`:

```json
{
  "constraints": {
    "wcag": [
      {
        "foreground": "color.text",
        "background": "color.bg",
        "ratio": 4.5,
        "description": "Body text on background"
      }
    ]
  }
}
```

### Threshold Rules

`dcv.config.json`:

```json
{
  "constraints": {
    "thresholds": [
      {
        "id": "control.size.min",
        "op": ">=",
        "valuePx": 44,
        "where": "Touch target"
      }
    ]
  }
}
```

### Monotonic Ordering

`themes/typography.order.json`:

```json
{
  "order": [
    ["typography.h1", ">=", "typography.h2"],
    ["typography.h2", ">=", "typography.body"]
  ]
}
```

## Programmatic API

When a user asks whether DCV can be used in code:

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json',
  constraintsDir: './themes'
});

if (!result.ok) {
  for (const violation of result.violations) {
    console.error(`[${violation.ruleId}] ${violation.message}`);
  }
  process.exitCode = 1;
}
```

Inline tokens and constraints are also supported:

```ts
const result = validate({
  tokens: {
    color: {
      text: { $value: '#888888' },
      bg: { $value: '#999999' }
    }
  },
  constraints: {
    enableBuiltInThreshold: false,
    enableBuiltInWcagDefaults: false,
    wcag: [
      {
        foreground: 'color.text',
        background: 'color.bg',
        ratio: 4.5
      }
    ]
  }
});
```

## MCP Server

DCV ships a Model Context Protocol server over stdio. It exposes read-only
tools:

| Tool | Purpose |
|------|---------|
| `validate` | Validate a token set and return structured issues |
| `why` | Explain token provenance and references |
| `graph` | Return the token dependency graph |

Published package config:

```json
{
  "mcpServers": {
    "design-constraint-validator": {
      "command": "npx",
      "args": ["-y", "--package", "design-constraint-validator", "dcv-mcp"]
    }
  }
}
```

Local development config after `npm run build`:

```json
{
  "mcpServers": {
    "dcv": {
      "command": "node",
      "args": ["/absolute/path/to/design-constraint-validator/mcp/index.js"]
    }
  }
}
```

Registry metadata lives in `server.json` with MCP name
`io.github.cseperkepapp/design-constraint-validator`.

## Troubleshooting Quick Fixes

| Error | Solution |
|-------|----------|
| Cannot find module | Run `npm install design-constraint-validator` |
| ESM import error | Add `"type": "module"` to `package.json` |
| No active constraint references tokens | Add matching `constraints.wcag` / `constraints.thresholds`, or point `--constraints-dir` at order/cross-axis files |
| Unknown token reference | Check token IDs exactly, including case and dots |
| Receipt file missing | Use `dcv validate --format json --receipt audit.json` |

## Install Patterns

```bash
# Local project install
npm install -D design-constraint-validator
npx dcv validate

# Global CLI
npm install -g design-constraint-validator
dcv validate

# No project install
npx design-constraint-validator validate
```

## Common Patterns

### CI Report Mode

```yaml
- run: npx dcv validate --fail-on off --format json --output results.json
- uses: actions/upload-artifact@v4
  with:
    name: dcv-results
    path: results.json
```

### Pre-Commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx dcv validate --fail-on error"
    }
  }
}
```

### Watch Mode

```json
{
  "scripts": {
    "validate:watch": "nodemon -e json --exec \"npx dcv validate\""
  }
}
```

## Mental Model

DCV validates relationships between tokens: contrast, hierarchy, thresholds, and
cross-property rules. It is a design-token constraint checker, not a general JSON
schema validator.

## Links

- Docs: https://github.com/CseperkePapp/design-constraint-validator/tree/main/docs
- Examples: https://github.com/CseperkePapp/design-constraint-validator/tree/main/examples
- Issues: https://github.com/CseperkePapp/design-constraint-validator/issues
