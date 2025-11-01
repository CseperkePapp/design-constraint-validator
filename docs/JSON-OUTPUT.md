# JSON Output Schema

DCV provides machine-readable JSON output for programmatic consumption and CI/CD integration.

## Usage

```bash
dcv validate --format json
dcv validate --format json --output results.json
```

## Schema

### ValidationResult

```typescript
interface ValidationResult {
  ok: boolean;                  // true if no violations, false otherwise
  counts: {
    checked: number;            // Total number of constraints checked
    violations: number;         // Number of violations found
    warnings: number;           // Number of warnings found
  };
  violations: ConstraintViolation[];
  warnings?: ConstraintViolation[];
  stats: {
    durationMs: number;         // Total validation time in milliseconds
    engineVersion: string;      // DCV version
    timestamp: string;          // ISO 8601 timestamp
  };
}
```

### ConstraintViolation

```typescript
interface ConstraintViolation {
  ruleId: string;               // Constraint type: 'wcag-contrast', 'mono-typography', etc.
  level: 'error' | 'warn';      // Severity level
  message: string;              // Human-readable description
  nodes?: string[];             // Implicated token IDs
  edges?: [string, string][];   // Dependency edges involved in violation
  context?: {                   // Additional constraint-specific data
    actual?: unknown;
    expected?: unknown;
    threshold?: number;
    [key: string]: unknown;
  };
}
```

## Example Output

```json
{
  "ok": false,
  "counts": {
    "checked": 156,
    "violations": 3,
    "warnings": 1
  },
  "violations": [
    {
      "ruleId": "wcag-contrast",
      "level": "error",
      "message": "Insufficient contrast ratio: 2.3:1 (requires 4.5:1 for AA)",
      "nodes": ["color.text.primary", "color.bg.surface"],
      "context": {
        "actual": 2.3,
        "expected": 4.5,
        "standard": "AA"
      }
    },
    {
      "ruleId": "mono-typography",
      "level": "error",
      "message": "Typography scale must be strictly increasing",
      "nodes": ["typography.size.md", "typography.size.lg"],
      "edges": [["typography.size.md", "typography.size.lg"]],
      "context": {
        "values": [16, 14],
        "order": "increasing"
      }
    },
    {
      "ruleId": "threshold",
      "level": "error",
      "message": "control.size.min @ Touch target (WCAG / Apple HIG) — control.size.min >= 44px violated: 30px",
      "nodes": ["control.size.min"],
      "context": {
        "actual": 30,
        "threshold": 44,
        "unit": "px",
        "operator": ">="
      }
    }
  ],
  "warnings": [
    {
      "ruleId": "cross-axis",
      "level": "warn",
      "message": "Large text should have higher contrast at smaller sizes",
      "nodes": ["typography.size.xl", "color.contrast.sm"]
    }
  ],
  "stats": {
    "durationMs": 247,
    "engineVersion": "1.0.0",
    "timestamp": "2025-11-01T08:00:00.000Z"
  }
}
```

## Exit Codes

DCV uses standard exit codes for CI/CD integration:

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | No violations or `--fail-on off` |
| `1` | Violations | Constraint violations found (respects `--fail-on`) |
| `2` | Configuration Error | Invalid config, missing files, or bad arguments |
| `3` | Runtime Error | Unexpected exception or system error |

### Exit Code Behavior with --fail-on

```bash
# Exit 0 even if violations exist (reporting only)
dcv validate --fail-on off

# Exit 1 if errors OR warnings found (strict)
dcv validate --fail-on warn

# Exit 1 only if errors found (default)
dcv validate --fail-on error
```

## Receipt Mode (Audit Trail)

Generate a validation receipt for audit and reproducibility:

```bash
dcv validate --receipt ./reports/validation.receipt.json
```

### Receipt Schema

```typescript
interface ValidationReceipt extends ValidationResult {
  environment: {
    nodeVersion: string;        // Node.js version
    platform: string;           // OS platform
    arch: string;               // CPU architecture
  };
  inputs: {
    tokensFile: string;         // Path to tokens file
    tokensHash: string;         // SHA-256 hash of tokens file
    constraintsDir: string;     // Path to constraints directory
    constraintHashes: Record<string, string>;  // Constraint file hashes
    breakpoint?: string;        // Active breakpoint
  };
  config: {
    failOn: 'off' | 'warn' | 'error';
    overrides?: string[];
  };
}
```

### Example Receipt

```json
{
  "ok": false,
  "counts": { "checked": 156, "violations": 3, "warnings": 1 },
  "violations": [ /* ... */ ],
  "stats": {
    "durationMs": 247,
    "engineVersion": "1.0.0",
    "timestamp": "2025-11-01T08:00:00.000Z"
  },
  "environment": {
    "nodeVersion": "v20.10.0",
    "platform": "linux",
    "arch": "x64"
  },
  "inputs": {
    "tokensFile": "./tokens/tokens.json",
    "tokensHash": "sha256:a3f2b1c9d8e7...",
    "constraintsDir": "./themes",
    "constraintHashes": {
      "wcag.json": "sha256:1a2b3c4d...",
      "typography.order.json": "sha256:5e6f7g8h..."
    },
    "breakpoint": "md"
  },
  "config": {
    "failOn": "error"
  }
}
```

## Integration Examples

### GitHub Actions

```yaml
- name: Validate design tokens
  run: dcv validate --format json --output validation.json
  
- name: Upload results artifact
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: validation-results
    path: validation.json
```

### CI Dashboard

```javascript
const fs = require('fs');
const result = JSON.parse(fs.readFileSync('validation.json'));

console.log(`✅ Checked ${result.counts.checked} constraints`);
console.log(`❌ Found ${result.counts.violations} violations`);
console.log(`⚠️  Found ${result.counts.warnings} warnings`);

result.violations.forEach(v => {
  console.error(`[${v.ruleId}] ${v.message}`);
  if (v.nodes) console.error(`  Tokens: ${v.nodes.join(', ')}`);
});
```

### Custom Reporting

```typescript
import { validate } from 'design-constraint-validator';

const result = await validate(tokens, options);

// Generate HTML report
const html = generateHtmlReport(result);
fs.writeFileSync('report.html', html);

// Send to monitoring system
await sendToDatadog({
  metric: 'dcv.violations',
  value: result.counts.violations,
  tags: [`version:${result.stats.engineVersion}`]
});
```

## See Also

- [CLI Reference](https://github.com/CseperkePapp/design-constraint-validator/wiki/CLI-Reference)
- [Configuration](https://github.com/CseperkePapp/design-constraint-validator/wiki/Configuration)
- [Constraint Types](https://github.com/CseperkePapp/design-constraint-validator/wiki/Constraint-Types)
