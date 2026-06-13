# API Reference

Programmatic usage of Design Constraint Validator (DCV).

DCV is ESM-only and requires Node.js 18 or newer.

```bash
npm install -D design-constraint-validator
```

```ts
import { Engine, validate } from 'design-constraint-validator';
import type {
  ConstraintIssue,
  ConstraintPlugin,
  ValidateInput,
  ValidateResult
} from 'design-constraint-validator';
```

The package root currently exposes the validation convenience API, the low-level
engine, and core types. CLI commands such as `build`, `graph`, `set`, `patch`,
and `why` are command-line surfaces; they are not exported as root package
functions.

## `validate(input?)`

Validate a token set against configured constraints and return structured
results. This API is synchronous.

```ts
function validate(input?: ValidateInput): ValidateResult;
```

```ts
interface ValidateInput {
  tokens?: TokenNode;
  tokensPath?: string;
  constraints?: DcvConfig['constraints'];
  configPath?: string;
  constraintsDir?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}

interface ValidateResult {
  ok: boolean;
  counts: {
    checked: number;    // ISSUES produced (errors + warnings), not constraints evaluated
    violations: number;
    warnings: number;
  };
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  note?: string;
}
```

### Inputs

- `tokens`: Inline nested token object using `$value` token leaves.
- `tokensPath`: JSON token file path. Ignored when `tokens` is provided.
- `constraints`: Inline config `constraints` block. Ignored only when omitted.
- `configPath`: JSON config file path. When omitted, DCV checks `dcv.config.json`,
  `.dcvrc.json`, then `package.json` in the current working directory.
- `constraintsDir`: Directory containing order and cross-axis constraint files.
  Defaults to `themes`.
- `breakpoint`: Optional breakpoint for breakpoint-specific order and cross-axis
  files, such as `typography.md.order.json`.

### Result Shape

`validate()` returns the same core issue format used by CLI JSON output, without
CLI-only `stats` or package metadata.

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

`ok` is `true` only when there are no error-level violations. Warning-level
issues are reported in `warnings` and counted in `counts.warnings`.

### File-Based Example

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json',
  constraintsDir: './themes'
});

if (!result.ok) {
  for (const v of result.violations) {
    console.error(`[${v.ruleId}] ${v.message}`);
  }
  process.exitCode = 1;
}
```

### Inline Example

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokens: {
    color: {
      text: { $value: '#888888' },
      background: { $value: '#999999' }
    }
  },
  constraints: {
    enableBuiltInThreshold: false,
    enableBuiltInWcagDefaults: false,
    wcag: [
      {
        foreground: 'color.text',
        background: 'color.background',
        ratio: 4.5,
        description: 'Body text on page background'
      }
    ]
  }
});

console.log(result.counts);
console.log(result.violations[0]?.context);
```

### No-Match Note

If tokens are supplied but no active constraint references any of them,
`validate()` returns a `note` so callers do not treat a zero-issue run as proof
that meaningful rules were checked.

## Engine

`Engine` is the low-level in-memory validator. It stores flat token values,
tracks dependency edges, and runs registered constraint plugins.

```ts
import { Engine } from 'design-constraint-validator';

const engine = new Engine(
  {
    'typography.size.h1': '32px',
    'typography.size.h2': '24px',
    'typography.size.body': '16px'
  },
  []
);
```

### Constructor

```ts
new Engine(
  initValues: Record<string, string | number>,
  edges: Array<[string, string]>
);
```

`edges` are reference dependency edges where each tuple is `[from, to]`.

### Methods

```ts
engine.use(plugin);
engine.get('typography.size.h1');
engine.set('typography.size.h1', '36px');
engine.getAllIds();
engine.getFlatTokens();
engine.affected('typography.size.body');
engine.evaluate(new Set(engine.getAllIds()));
engine.commit('typography.size.h1', '36px');
```

- `use(plugin)`: Register a constraint plugin and return the engine.
- `get(id)`: Read the current token value.
- `set(id, value)`: Set a token value without evaluating constraints.
- `getAllIds()`: Return every token ID in the engine.
- `getFlatTokens()`: Return the current flat `{ [id]: value }` map.
- `affected(id)`: Return tokens that depend on a changed token.
- `evaluate(candidates)`: Run plugins for candidate token IDs.
- `commit(id, value)`: Set a value, evaluate changed/affected tokens, and
  return `{ affected, issues, patch }`.

## Built-In Plugin Factories

Built-in constraint plugins are factory functions. Import them from subpaths when
you need direct engine control.

### Monotonic Ordering

```ts
import { Engine } from 'design-constraint-validator';
import {
  MonotonicPlugin,
  parseSize
} from 'design-constraint-validator/core/constraints/monotonic.js';

const engine = new Engine(
  {
    'typography.size.h1': '32px',
    'typography.size.h2': '40px'
  },
  []
);

engine.use(
  MonotonicPlugin(
    [['typography.size.h1', '>=', 'typography.size.h2']],
    parseSize,
    'monotonic-typography'
  )
);

const issues = engine.evaluate(new Set(engine.getAllIds()));
```

### WCAG Contrast

```ts
import { WcagContrastPlugin } from 'design-constraint-validator/core/constraints/wcag.js';

engine.use(
  WcagContrastPlugin([
    {
      fg: 'color.text.default',
      bg: 'color.bg.surface',
      min: 4.5,
      where: 'Body text on surface'
    }
  ])
);
```

WCAG contrast violations include `context.actual` and `context.required` after
formatting through the JSON output helpers or `validate()`.

### Threshold

```ts
import { ThresholdPlugin } from 'design-constraint-validator/core/constraints/threshold.js';

engine.use(
  ThresholdPlugin([
    {
      id: 'control.size.min',
      op: '>=',
      valuePx: 44,
      where: 'Touch target'
    }
  ])
);
```

### Lightness And Cross-Axis

```ts
import { MonotonicLightness } from 'design-constraint-validator/core/constraints/monotonic-lightness.js';
import { CrossAxisPlugin } from 'design-constraint-validator/core/constraints/cross-axis.js';
```

Most consumers should configure these through the CLI and constraint files:

- `color.order.json` for lightness ordering.
- `cross-axis.rules.json` or `cross-axis.<bp>.rules.json` for cross-axis rules.

## Custom Plugins

A plugin exposes an `id` and an `evaluate(engine, candidates)` method.

```ts
import type {
  ConstraintIssue,
  ConstraintPlugin
} from 'design-constraint-validator';

export function MaxFontSizePlugin(maxPx = 72): ConstraintPlugin {
  return {
    id: 'max-font-size',
    evaluate(engine, candidates) {
      const issues: ConstraintIssue[] = [];

      for (const id of candidates) {
        if (!id.startsWith('typography.size.')) continue;
        const raw = engine.get(id);
        const px = typeof raw === 'string' ? Number.parseFloat(raw) : NaN;

        if (Number.isFinite(px) && px > maxPx) {
          issues.push({
            id,
            rule: 'max-font-size',
            level: 'warn',
            message: `${id} exceeds ${maxPx}px`,
            involvedTokens: [id],
            metadata: { actual: px, max: maxPx }
          });
        }
      }

      return issues;
    }
  };
}
```

Plugins should honor the `candidates` set so incremental evaluation remains
correct.

## Utility Subpaths

Some internal helpers are available through package subpaths:

```ts
import { flattenTokens } from 'design-constraint-validator/core/flatten.js';
import { parseCssColor, contrastRatio } from 'design-constraint-validator/core/color.js';
import { buildPoset, transitiveReduction } from 'design-constraint-validator/core/poset.js';
```

These are lower-level building blocks. Prefer `validate()` unless you need to
assemble the engine yourself.

## Error Handling

`validate()` throws for runtime/setup failures such as missing token files,
invalid JSON, or invalid config files. Constraint failures are returned in the
result.

```ts
import { validate } from 'design-constraint-validator';

try {
  const result = validate({ tokensPath: './tokens.json' });

  if (!result.ok) {
    for (const v of result.violations) {
      console.error(`[${v.ruleId}] ${v.message}`);
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
}
```

## Related Docs

- [CLI Reference](./CLI.md)
- [Configuration](./Configuration.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
- [Concepts](./Concepts.md)
