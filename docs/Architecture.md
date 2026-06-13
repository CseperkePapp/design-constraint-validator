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

Input handling and adapters split by direction:

- **Input normalization** lives in `core/`. `core/dtcg.ts` reads the DTCG 2025.10
  stable spec (structured sRGB colors, structured dimensions, `{alias}`
  references) during flattening. Other ecosystems (Style Dictionary, Tokens
  Studio) are normalized via examples/build scripts.
- **Output adapters** live in `adapters/`: `css.ts`, `js.ts`, `json.ts` emit
  token outputs, and `decisionthemes.ts` emits the DecisionThemes shape.

> **Visual map:** [Architecture & Diagrams](./ARCHITECTURE-DIAGRAMS.md) has Mermaid
> diagrams of the entry points, pipeline, engine/plugin contract, and CLI command
> map. This doc is the prose reference; that one is the picture.

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
2. Loads tokens, applying breakpoint overrides when requested, then merging a
   named theme overlay when `--theme <name>` is given (`tokens/themes/<name>.json`,
   merge-then-flatten via `loadThemeTokens`; fails closed on a missing/malformed
   theme file).
3. Flattens tokens.
4. Builds an `Engine`.
5. Calls `setupConstraints()`.
6. Evaluates all token IDs for each selected breakpoint.
7. Prints text or JSON and exits according to `--fail-on`.

`--all-breakpoints` repeats this flow for each parsed breakpoint. `build` and
`set` apply the same theme-overlay merge before their own work.

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

Both honor the same `--tokens` / `--config` / `--constraints-dir` controls as
`validate` (an explicitly-passed but missing/invalid file fails clearly rather
than falling back to defaults). They do not apply theme overlays.

These are CLI/MCP surfaces, not root package API functions.

## MCP Server

`dcv-mcp` (`mcp/index.ts`) exposes the validator over MCP stdio for AI agents.
It is deliberately thin: `mcp/tools.ts` calls the same `validate()`
(`cli/validate-api.ts`) and `explain()` (`core/why.ts`) the CLI and library use,
so MCP results match the other surfaces. `mcp/contracts.ts` holds the Zod input
schemas.

Six **read-only** tools (none write tokens, config, or patches):

- `validate` — validate inline `tokens`/`tokensPath` against inline
  `constraints`/`configPath`; returns structured violations.
- `why` — token provenance, aliases, dependencies, dependents, alias chain.
- `graph` — token dependency `nodes` and `edges`.
- `list-constraints` — enumerate the active constraints for the given input.
- `explain` — turn a violation into plain-English text plus machine-readable facts.
- `suggest-fix` — compute a **verified** satisfying value (WCAG color, threshold
  or monotonic boundary) without writing it.

The last three (`mcp/insights.ts`) are the "validator → assistant" layer: they
reuse the constraint registry and `core/color` math, and return suggestions for
the agent/user to apply via `dcv set`/`patch`. Failures are structured:
`{ ok: false, error: { code, message } }`.

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
