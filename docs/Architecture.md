# Architecture

Design Constraint Validator (DCV) is a small validation pipeline around three
core ideas:

1. Flatten design tokens into final token values.
2. Attach constraint plugins from config and constraint files.
3. Evaluate plugins and report structured issues.

## Runtime Flow

```text
tokens JSON
  -> flattenTokens()
  -> Engine(flat values, dependency edges)
  -> setupConstraints()
  -> engine.evaluate(candidate IDs)
  -> text, JSON, receipt, or programmatic result
```

The CLI, programmatic API, and MCP server share this pipeline.

## Token Flattening

`core/flatten.ts` reads nested token objects that use `$value` token leaves and
resolves `{token.path}` references.

```ts
import { flattenTokens } from 'design-constraint-validator/core/flatten.js';

const { flat, edges } = flattenTokens(tokens);
```

Flattening returns:

- `flat`: Map of token IDs to flat token objects.
- `edges`: Reference dependency tuples used by the engine.

Input normalization from non-DCV formats belongs in adapters or build scripts.
The built-in `adapters/` modules are output adapters.

## Engine

`core/engine.ts` stores token values, dependency edges, and plugins.

```ts
import { Engine } from 'design-constraint-validator';

const engine = new Engine(
  {
    'typography.size.h1': '32px',
    'typography.size.h2': '24px'
  },
  []
);
```

Primary methods:

- `use(plugin)`: Register a constraint plugin.
- `get(id)`: Read a token value.
- `set(id, value)`: Set a token value without evaluating.
- `getAllIds()`: Return all token IDs.
- `getFlatTokens()`: Return `{ [id]: value }`.
- `affected(id)`: Return dependents of a changed token.
- `evaluate(candidates)`: Run registered plugins for candidate IDs.
- `commit(id, value)`: Set a value and evaluate the changed token plus
  dependents.

## Plugin Contract

Plugins are plain objects with an `id` and an `evaluate()` method.

```ts
import type {
  ConstraintIssue,
  ConstraintPlugin
} from 'design-constraint-validator';

export function MyPlugin(): ConstraintPlugin {
  return {
    id: 'my-plugin',
    evaluate(engine, candidates) {
      const issues: ConstraintIssue[] = [];

      for (const id of candidates) {
        const value = engine.get(id);
        if (value === 'invalid') {
          issues.push({
            id,
            rule: 'my-plugin',
            level: 'error',
            message: `${id} is invalid`,
            involvedTokens: [id]
          });
        }
      }

      return issues;
    }
  };
}
```

Plugins should:

- Honor the `candidates` set.
- Return `ConstraintIssue[]`.
- Populate `involvedTokens` when possible.
- Use `metadata` for structured context instead of forcing consumers to parse
  messages.

## Constraint Discovery

`cli/constraint-registry.ts` is the single source of truth for active
constraints.

Sources:

- Built-in WCAG defaults, unless disabled by
  `constraints.enableBuiltInWcagDefaults: false`.
- Built-in touch-target threshold, unless disabled by
  `constraints.enableBuiltInThreshold: false`.
- `constraints.wcag` from config.
- `constraints.thresholds` from config.
- Order files from the constraints directory:
  `typography.order.json`, `spacing.order.json`, `layout.order.json`,
  `color.order.json`.
- Cross-axis files from the constraints directory:
  `cross-axis.rules.json` and `cross-axis.<bp>.rules.json`.

The default constraints directory is `themes/`; pass `--constraints-dir` or
`validate({ constraintsDir })` to use another path.

## Programmatic Validation

`cli/validate-api.ts` exposes the package-root `validate()` convenience API.

```ts
import { validate } from 'design-constraint-validator';

const result = validate({
  tokensPath: './tokens.json',
  configPath: './dcv.config.json',
  constraintsDir: './themes'
});
```

This API is synchronous and returns:

```ts
{
  ok: boolean;
  counts: { checked: number; violations: number; warnings: number };
  violations: ConstraintViolation[];
  warnings: ConstraintViolation[];
  note?: string;
}
```

CLI-only metadata such as `stats`, `dcv`, and receipt environment details are
added by the CLI JSON output layer.

## CLI Validation

`cli/commands/validate.ts`:

1. Loads config with `loadConfig()`.
2. Loads tokens, applying breakpoint overrides when requested.
3. Flattens tokens.
4. Builds an `Engine`.
5. Calls `setupConstraints()`.
6. Evaluates all token IDs for each selected breakpoint.
7. Prints text or JSON and exits according to `--fail-on`.

`--all-breakpoints` repeats this flow for each parsed breakpoint.

## JSON Output

Internal `ConstraintIssue` objects are formatted by `cli/json-output.ts` into:

```ts
{
  ruleId: string;
  level: 'error' | 'warn';
  message: string;
  nodes?: string[];
  edges?: [string, string][];
  context?: Record<string, unknown>;
}
```

WCAG contrast uses `context.actual` and `context.required`.

## Graph And Why

`dcv graph` and `dcv why` use the same flattened token data and reference edges:

- `graph` emits dependency graphs or Hasse diagrams for order files.
- `why` explains a token's value, references, dependents, and provenance.

These are CLI/MCP surfaces, not root package API functions.

## Build And Patch

Build and patch commands are separate from validation:

- `dcv build` emits CSS, JSON, or JS from flat token values.
- `dcv set` creates or applies token value patches.
- `dcv patch` exports patch documents from override objects.
- `dcv patch:apply` applies a patch without validating the result.

Run `dcv validate` separately when validation is required after a transform.

## Testing Strategy

Relevant test layers:

- Unit tests for core flattening, engine behavior, constraints, and color math.
- CLI/integration tests for command output and exit behavior.
- MCP tests for read-only tool behavior.
- Workflow tests for task metadata and task index consistency.

Example plugin test shape:

```ts
import { Engine } from 'design-constraint-validator';
import {
  MonotonicPlugin,
  parseNumber
} from 'design-constraint-validator/core/constraints/monotonic.js';

const engine = new Engine({ a: 10, b: 20 }, []);
engine.use(MonotonicPlugin([['a', '>=', 'b']], parseNumber));

const issues = engine.evaluate(new Set(engine.getAllIds()));
```

## Related Docs

- [API Reference](./API.md)
- [CLI Reference](./CLI.md)
- [Configuration](./Configuration.md)
- [JSON Output Schema](./JSON-OUTPUT.md)
- [Extending DCV](./Extending-DCV.md)
