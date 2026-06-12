# JSON Output Schema

DCV provides machine-readable JSON for CI, dashboards, agent integrations, and
receipts.

## Usage

```bash
dcv validate --format json
dcv validate --format json --output results.json
dcv validate --format json --receipt validation.receipt.json
```

## CLI Validation Result

`dcv validate --format json` writes this shape:

```ts
interface ValidationResult {
  ok: boolean;
  counts: {
    checked: number;
    violations: number;
    warnings: number;
  };
  violations: ConstraintViolation[];
  warnings?: ConstraintViolation[];
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

`warnings` is omitted by the CLI when there are no warnings. `note` is present
when DCV can tell that tokens were loaded but no active constraint referenced any
of them.

The programmatic `validate()` API returns the same `ok`, `counts`, `violations`,
`warnings`, and optional `note` fields. It does not add CLI-only `stats` or
`dcv` metadata.

## Constraint Violation

```ts
interface ConstraintViolation {
  ruleId: string;
  level: 'error' | 'warn';
  message: string;
  nodes?: string[];
  edges?: [string, string][];
  context?: Record<string, unknown>;
}
```

Field notes:

- `ruleId`: Constraint identifier, such as `wcag-contrast`, `threshold`, or
  `monotonic`.
- `level`: `error` blocks by default; `warn` blocks only when `--fail-on warn`.
- `message`: Human-readable summary.
- `nodes`: Token IDs involved in the issue.
- `edges`: Dependency or constraint edges when available.
- `context`: Rule-specific structured metadata. WCAG contrast violations include
  `actual` and `required`; threshold violations currently include `where` when a
  label is configured.

## Example Output

```json
{
  "ok": false,
  "counts": {
    "checked": 2,
    "violations": 2,
    "warnings": 0
  },
  "violations": [
    {
      "ruleId": "wcag-contrast",
      "level": "error",
      "message": "Contrast 1.24:1 < 4.5:1",
      "nodes": ["color.text", "color.background"],
      "context": {
        "where": "Body text on page background",
        "actual": 1.24,
        "required": 4.5
      }
    },
    {
      "ruleId": "threshold",
      "level": "error",
      "message": "control.size.min >= 44px violated: 30px",
      "nodes": ["control.size.min"],
      "context": {
        "where": "Touch target (WCAG / Apple HIG)"
      }
    }
  ],
  "stats": {
    "durationMs": 2,
    "engineVersion": "2.1.0",
    "timestamp": "2026-06-12T13:37:03.224Z"
  },
  "dcv": {
    "name": "design-constraint-validator",
    "version": "2.1.0",
    "repository": "https://github.com/CseperkePapp/design-constraint-validator#readme"
  }
}
```

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `0` | Success | No blocking violations, or `--fail-on off` |
| `1` | Violations | Violations found according to `--fail-on` |
| `2` | Configuration/runtime setup error | Invalid config, missing files, bad arguments, or command failure |

### `--fail-on`

```bash
# Exit 0 even if violations exist
dcv validate --fail-on off

# Exit 1 if warnings or errors exist
dcv validate --fail-on warn

# Exit 1 only if errors exist
dcv validate --fail-on error
```

## Receipt Mode

Receipts add audit metadata to the validation result. Receipt writing is tied to
JSON validation output:

```bash
dcv validate --format json --receipt ./reports/validation.receipt.json
```

```ts
interface ValidationReceipt extends ValidationResult {
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  inputs: {
    tokensFile: string;
    tokensHash: string;
    constraintsDir: string;
    constraintHashes: Record<string, string>;
    breakpoint?: string;
  };
  config: {
    failOn: 'off' | 'warn' | 'error';
    overrides?: string[];
  };
}
```

Hash values are `sha256:` plus the first 16 hex characters of the file digest.
`constraintHashes` includes `.json` files from the active constraints directory;
config-file constraints are not currently hashed there.

## Integration Examples

### GitHub Actions

```yaml
- name: Validate design tokens
  run: npx dcv validate --format json --output validation.json

- name: Upload results artifact
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: validation-results
    path: validation.json
```

### Read CLI JSON

```js
import fs from 'node:fs';

const result = JSON.parse(fs.readFileSync('validation.json', 'utf8'));

console.log(`Checked ${result.counts.checked} constraints`);
console.log(`Found ${result.counts.violations} violations`);
console.log(`Found ${result.counts.warnings} warnings`);

for (const violation of result.violations) {
  console.error(`[${violation.ruleId}] ${violation.message}`);
  if (violation.nodes) {
    console.error(`  Tokens: ${violation.nodes.join(', ')}`);
  }
}
```

### Programmatic Validation

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json'
});

const html = generateHtmlReport(result);
await sendMetric('dcv.violations', result.counts.violations);
```

## Related Docs

- [CLI Reference](./CLI.md)
- [Configuration](./Configuration.md)
- [API Reference](./API.md)
- [Constraints](./Constraints.md)
