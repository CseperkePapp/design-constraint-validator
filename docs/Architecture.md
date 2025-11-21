# Architecture

How Design Constraint Validator works internally.

## Overview

DCV is built as a **constraint validation engine** with a plugin architecture. It processes design tokens through several phases:

```
┌──────────────┐
│ Token Input  │ → Parse & normalize
└──────────────┘
       ↓
┌──────────────┐
│ Dependency   │ → Build DAG (directed acyclic graph)
│ Graph        │
└──────────────┘
       ↓
┌──────────────┐
│ Constraint   │ → Run validation plugins
│ Validation   │
└──────────────┘
       ↓
┌──────────────┐
│ Violation    │ → Report errors/warnings
│ Reporting    │
└──────────────┘
```

---

## Phase 1: Token Parsing

### Input Normalization

DCV accepts multiple token formats through **adapters**:

```typescript
// Input: Style Dictionary format
{
  "color": {
    "brand": {
      "primary": {
        "value": "#0066cc",
        "type": "color"
      }
    }
  }
}

// Normalized to:
{
  id: "color.brand.primary",
  value: "#0066cc",
  type: "color",
  meta: { /* original fields */ }
}
```

### Flattening

Nested tokens are flattened to dot-notation:

```
color.brand.primary → "#0066cc"
typography.size.h1  → "32px"
```

### Reference Resolution

Token references are resolved:

```json
{
  "color": {
    "base": { "value": "#0066cc" },
    "primary": { "value": "{color.base}" }
  }
}
```

Becomes:
```
color.base    → "#0066cc"
color.primary → "#0066cc" (resolved from color.base)
```

---

## Phase 2: Dependency Graph

### Graph Construction

DCV builds a **directed acyclic graph (DAG)** of token dependencies:

```
color.base
    ↓
color.primary
    ↓
color.interactive
```

**Node:** Each token  
**Edge:** A dependency or constraint relationship

### Reference Tracking

```typescript
type GraphNode = {
  id: string;
  value: TokenValue;
  dependsOn: string[];      // Direct dependencies
  referencedBy: string[];   // Reverse dependencies
};

type GraphEdge = {
  from: string;
  to: string;
  type: 'reference' | 'constraint';
};
```

### Cycle Detection

DCV detects circular references:

```json
{
  "a": { "value": "{b}" },
  "b": { "value": "{a}" }  // ← Cycle!
}
```

**Error:**
```
Circular reference detected: a → b → a
```

---

## Phase 3: Constraint Validation

### Plugin Architecture

Constraints are implemented as **plugins** that conform to a simple interface:

```typescript
interface ConstraintPlugin {
  name: string;
  check(engine: Engine): Violation[];
}

type Violation = {
  severity: 'error' | 'warn';
  kind: string;
  token: string;
  message: string;
  nodes?: string[];
  edges?: [string, string][];
};
```

### Built-in Plugins

#### 1. Monotonic Plugin

Validates ordering constraints:

```typescript
class MonotonicPlugin {
  constructor(
    private rules: [string, '>=' | '<=', string][],
    private parser: (value: any) => number
  ) {}

  check(engine: Engine): Violation[] {
    const violations = [];
    for (const [left, op, right] of this.rules) {
      const lval = this.parser(engine.get(left));
      const rval = this.parser(engine.get(right));
      
      if (op === '>=' && lval < rval) {
        violations.push({
          severity: 'error',
          kind: 'monotonic',
          token: left,
          message: `${left} >= ${right} violated: ${lval} < ${rval}`
        });
      }
    }
    return violations;
  }
}
```

#### 2. WCAG Contrast Plugin

Validates color contrast:

```typescript
class WcagContrastPlugin {
  constructor(
    private rules: Array<{
      fg: string;
      bg: string;
      min: number;
      where: string;
    }>
  ) {}

  check(engine: Engine): Violation[] {
    const violations = [];
    for (const rule of this.rules) {
      const fg = engine.get(rule.fg);
      const bg = engine.get(rule.bg);
      const ratio = contrastRatio(fg, bg);
      
      if (ratio < rule.min) {
        violations.push({
          severity: 'error',
          kind: 'wcag',
          token: rule.fg,
          message: `Contrast ${ratio.toFixed(1)}:1 < ${rule.min}:1 (${rule.where})`
        });
      }
    }
    return violations;
  }
}
```

### Engine API

The validation engine provides:

```typescript
class Engine {
  // Get token value
  get(tokenId: string): any;
  
  // Set token value
  set(tokenId: string, value: any): void;
  
  // Register plugin
  use(plugin: ConstraintPlugin): void;
  
  // Run all plugins
  validate(): Violation[];
  
  // Get dependency graph
  getGraph(): { nodes: Node[]; edges: Edge[] };
}
```

---

## Phase 4: Provenance Tracing

### Why Analysis

The `why` command traces token provenance:

```typescript
function why(tokenId: string): Provenance {
  const token = engine.get(tokenId);
  const deps = graph.getDependencies(tokenId);
  const constraints = engine.getConstraintsFor(tokenId);
  
  return {
    token: tokenId,
    value: token.value,
    source: token.meta.file,
    dependencies: deps.map(d => ({
      id: d.id,
      value: d.value,
      relation: describeRelation(tokenId, d.id)
    })),
    constraints: constraints.map(c => ({
      type: c.kind,
      satisfied: c.check(),
      rule: c.describe()
    }))
  };
}
```

### Graph Traversal

```typescript
// Find all tokens that depend on X
function whatDependsOn(tokenId: string): string[] {
  return graph.traverse(tokenId, 'upstream');
}

// Find all tokens that X depends on
function whatDoesItDependOn(tokenId: string): string[] {
  return graph.traverse(tokenId, 'downstream');
}
```

---

## Multi-Breakpoint Support

### Breakpoint Handling

DCV validates each breakpoint as a separate graph:

```typescript
for (const bp of ['sm', 'md', 'lg']) {
  // 1. Load base tokens
  const tokens = loadTokens('tokens.json');
  
  // 2. Apply breakpoint overrides
  const overrides = loadOverrides(`tokens/overrides/${bp}.json`);
  const merged = mergeTokens(tokens, overrides);
  
  // 3. Build graph for this breakpoint
  const graph = buildGraph(merged);
  
  // 4. Validate
  const violations = engine.validate(graph);
  
  // 5. Report
  report(bp, violations);
}
```

### Override Merging

```typescript
function mergeTokens(
  base: Tokens,
  overrides: Partial<Tokens>
): Tokens {
  return deepMerge(base, overrides, {
    // Overrides win on conflicts
    strategy: 'override'
  });
}
```

---

## Performance Optimizations

### Incremental Validation

Only re-validate changed tokens:

```typescript
class IncrementalEngine extends Engine {
  private cache = new Map<string, ValidationResult>();
  
  validate(changedTokens: Set<string>): Violation[] {
    // 1. Find affected tokens (dependents of changed tokens)
    const affected = this.findAffected(changedTokens);
    
    // 2. Validate only affected tokens
    const violations = [];
    for (const token of affected) {
      const result = this.validateToken(token);
      this.cache.set(token, result);
      violations.push(...result.violations);
    }
    
    // 3. Return cached results for unchanged tokens
    for (const [token, result] of this.cache) {
      if (!affected.has(token)) {
        violations.push(...result.violations);
      }
    }
    
    return violations;
  }
}
```

### Parallel Validation

Validate independent subgraphs in parallel:

```typescript
async function validateParallel(
  graph: Graph
): Promise<Violation[]> {
  // 1. Find independent subgraphs
  const subgraphs = graph.findIndependentComponents();
  
  // 2. Validate in parallel
  const results = await Promise.all(
    subgraphs.map(sg => validateSubgraph(sg))
  );
  
  // 3. Merge results
  return results.flat();
}
```

---

## Color Handling

### Color Space Conversions

DCV converts all colors to OKLCH (perceptual) for comparisons:

```typescript
// Input formats
const hex = "#0066cc";
const rgb = "rgb(0, 102, 204)";
const hsl = "hsl(210, 100%, 40%)";
const oklch = "oklch(0.55 0.20 265)";

// All converted to OKLCH internally
const oklchColor = toOKLCH(anyFormat);

// OKLCH components
const { L, C, H } = oklchColor;
// L = lightness (0-1)
// C = chroma (saturation)
// H = hue (0-360)
```

### Contrast Calculation

```typescript
function contrastRatio(fg: Color, bg: Color): number {
  // 1. Convert to linear RGB
  const fgLinear = toLinearRGB(fg);
  const bgLinear = toLinearRGB(bg);
  
  // 2. Calculate relative luminance
  const L1 = relativeLuminance(fgLinear);
  const L2 = relativeLuminance(bgLinear);
  
  // 3. Compute ratio
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  
  return (lighter + 0.05) / (darker + 0.05);
}
```

### Alpha Compositing

For transparent colors, DCV composites them over the background:

```typescript
function composite(fg: Color, bg: Color): Color {
  const alpha = fg.alpha;
  
  return {
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
    alpha: 1
  };
}
```

---

## Error Handling

### Validation Errors vs Runtime Errors

**Validation errors** (expected):
```typescript
{
  severity: 'error',
  kind: 'monotonic',
  message: 'h1 should be >= h2',
  // ... continues execution
}
```

**Runtime errors** (unexpected):
```typescript
try {
  engine.validate();
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}
```

### Graceful Degradation

```typescript
// If a constraint can't be evaluated, warn but don't fail
try {
  const result = plugin.check(engine);
  violations.push(...result);
} catch (error) {
  console.warn(`Plugin ${plugin.name} failed:`, error);
  // Continue with other plugins
}
```

---

## Extension Points

### Custom Plugins

```typescript
import { Engine, ConstraintPlugin, Violation } from 'design-constraint-validator';

class MyCustomPlugin implements ConstraintPlugin {
  name = 'my-custom-constraint';
  
  check(engine: Engine): Violation[] {
    const violations: Violation[] = [];
    
    // Your validation logic here
    const value = engine.get('my.token');
    if (!isValid(value)) {
      violations.push({
        severity: 'error',
        kind: 'custom',
        token: 'my.token',
        message: 'Custom validation failed'
      });
    }
    
    return violations;
  }
}

// Register plugin
engine.use(new MyCustomPlugin());
```

### Custom Adapters

```typescript
export function fromMyFormat(json: any): FlatToken[] {
  const tokens: FlatToken[] = [];
  
  // Walk your custom format
  walk(json, (path, value) => {
    tokens.push({
      id: path.join('.'),
      value: normalizeValue(value),
      type: inferType(value),
      meta: { /* preserve metadata */ }
    });
  });
  
  return tokens;
}
```

---

## Testing Architecture

### Unit Tests

Each plugin is tested independently:

```typescript
describe('MonotonicPlugin', () => {
  it('detects violations', () => {
    const engine = new Engine({
      'a': 10,
      'b': 20
    });
    
    const plugin = new MonotonicPlugin([
      ['a', '>=', 'b']  // Should fail: 10 >= 20
    ]);
    
    const violations = plugin.check(engine);
    expect(violations).toHaveLength(1);
    expect(violations[0].kind).toBe('monotonic');
  });
});
```

### Integration Tests

Full CLI integration:

```typescript
describe('CLI', () => {
  it('validates tokens', () => {
    const result = execSync('dcv validate', { encoding: 'utf8' });
    expect(result).toContain('0 error(s)');
  });
});
```

---

## Phase 3 Architectural Improvements (v1.1+)

In version 1.1, DCV underwent significant architectural improvements based on a comprehensive audit. These changes improve maintainability, testability, and extensibility while remaining backwards compatible.

### Centralized Constraint Loading (Phase 3A)

**Problem:** Constraint loading was scattered across multiple files with inconsistent behavior.

**Solution:** All constraint discovery and attachment now goes through a single registry.

**Before:**
```
cli/engine-helpers.ts        → applyMonotonicPlugins()
cli/engine-helpers.ts        → applyWcagPlugins()
cli/constraints-loader.ts    → attachRuntimeConstraints()
core/cross-axis-config.ts    → loadCrossAxisPlugin()
```

**After:**
```
cli/constraint-registry.ts   → discoverConstraints()
                             → attachConstraints()
                             → setupConstraints()
```

**Benefits:**
- Single source of truth for "what constraints are active"
- Consistent behavior across all CLI commands
- Easier to test and debug

**Usage:**
```typescript
import { Engine, flattenTokens, type FlatToken } from 'design-constraint-validator';
import { setupConstraints } from './cli/constraint-registry.js';

const { flat, edges } = flattenTokens(tokens);
const init = {};
for (const t of Object.values(flat)) {
  init[(t as FlatToken).id] = (t as FlatToken).value;
}

const engine = new Engine(init, edges);
const knownIds = new Set(Object.keys(init));

// One function loads all constraints
setupConstraints(engine, { config, bp }, { knownIds });
```

### Core/Filesystem Separation (Phase 3B)

**Problem:** Core modules (`core/`) directly accessed the filesystem, making them non-portable and hard to test.

**Solution:** Moved all filesystem I/O to the CLI layer. Core modules now accept in-memory data only.

**Before:**
```typescript
// core/cross-axis-config.ts (BAD: core reads filesystem)
import fs from 'node:fs';

export function loadCrossAxisPlugin(path: string) {
  const raw = JSON.parse(fs.readFileSync(path, 'utf8'));
  return CrossAxisPlugin(parseRules(raw));
}
```

**After:**
```typescript
// cli/cross-axis-loader.ts (GOOD: CLI reads filesystem)
import { readFileSync } from 'node:fs';

export function loadCrossAxisRules(path: string): CrossAxisRule[] {
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return parseRules(raw);
}

// core/constraints/cross-axis.ts (GOOD: core receives data)
export function CrossAxisPlugin(rules: CrossAxisRule[]): ConstraintPlugin {
  // No filesystem access, pure constraint logic
}
```

**Benefits:**
- Core modules testable with fixtures (no fs mocking required)
- Core can run in browser, Deno, Edge workers
- Clear separation of concerns

### Enhanced Engine API (Phase 3C)

**Problem:** Engine's internal state was not easily accessible. Plugins lacked clear contracts.

**Solution:** Added new API methods and documented plugin contracts.

#### New Engine Methods

```typescript
class Engine {
  // ✨ New: Get all token IDs
  getAllIds(): TokenId[] {
    return Array.from(this.values.keys());
  }

  // ✨ New: Get flat token map (avoid re-flattening)
  getFlatTokens(): Record<TokenId, TokenValue> {
    return Object.fromEntries(this.values);
  }
}
```

**Use cases:**
- CLI/adapters can access flat tokens without duplicate flattening
- Plugins can iterate all tokens when needed
- Engine state can be easily serialized

#### Enhanced ConstraintIssue Type

Added optional metadata fields for tooling:

```typescript
export type ConstraintIssue = {
  id: TokenId | string;
  rule: string;
  level: "error" | "warn";
  message: string;
  where?: string;

  // ✨ New: Token IDs involved in violation
  involvedTokens?: TokenId[];

  // ✨ New: Reference edges involved
  involvedEdges?: Array<[TokenId, TokenId]>;
};
```

**Benefits:**
- UI tools can highlight affected tokens
- Graph visualizations show constraint relationships
- "Why" explanations are richer

#### Documented Plugin Contracts

Plugins now have clear, documented contracts:

**Candidate Contract (MUST):**
- Only evaluate constraints involving at least one candidate token
- Enables efficient incremental validation

**Metadata Contract (SHOULD):**
- Populate `involvedTokens` in returned issues
- Enables filtering, highlighting, visualization

**Example:**
```typescript
export function MyPlugin(rules: Rule[]): ConstraintPlugin {
  return {
    id: "my-plugin",
    evaluate(engine, candidates) {
      const issues = [];

      for (const rule of rules) {
        // ✅ Honor candidate contract
        if (!candidates.has(rule.tokenA) && !candidates.has(rule.tokenB)) {
          continue; // Skip, not affected by changes
        }

        // Check constraint...
        if (violated) {
          issues.push({
            id: `${rule.tokenA}|${rule.tokenB}`,
            rule: "my-plugin",
            level: "error",
            message: "Constraint violated",
            involvedTokens: [rule.tokenA, rule.tokenB], // ✅ Metadata
          });
        }
      }

      return issues;
    }
  };
}
```

See [Extending-DCV.md](./Extending-DCV.md) for complete plugin authoring guide.

### Migration Guide

These changes are **backwards compatible**. Old code continues to work, but new code should use the improved APIs:

#### Migrating Constraint Loading

**Old:**
```typescript
import { createValidationEngine } from './cli/engine-helpers.js';

const engine = createValidationEngine(tokens, bp, config);
```

**New:**
```typescript
import { Engine, flattenTokens } from 'design-constraint-validator';
import { setupConstraints } from './cli/constraint-registry.js';

const { flat, edges } = flattenTokens(tokens);
const init = {};
for (const t of Object.values(flat)) {
  init[t.id] = t.value;
}

const engine = new Engine(init, edges);
const knownIds = new Set(Object.keys(init));
setupConstraints(engine, { config, bp }, { knownIds });
```

#### Migrating Cross-Axis Loading

**Old:**
```typescript
import { loadCrossAxisPlugin } from './core/cross-axis-config.js';

engine.use(loadCrossAxisPlugin(path, bp, { knownIds }));
```

**New:**
```typescript
import { loadCrossAxisRules } from './cli/cross-axis-loader.js';
import { CrossAxisPlugin } from './core/constraints/cross-axis.js';

const rules = loadCrossAxisRules(path, { bp, knownIds });
engine.use(CrossAxisPlugin(rules, bp));
```

#### Using New Engine Methods

```typescript
// Get all token IDs
const allIds = engine.getAllIds();

// Get flat token map
const tokens = engine.getFlatTokens();
// { "color.brand.primary": "#0066cc", ... }

// Create full candidate set
const fullCandidates = new Set(engine.getAllIds());
const issues = engine.evaluate(fullCandidates);
```

### Deprecation Timeline

The following modules are deprecated and will be removed in v2.0:

- **cli/engine-helpers.ts** - Use `constraint-registry.ts` instead
- **cli/constraints-loader.ts** - Use `constraint-registry.ts` instead
- **core/cross-axis-config.ts** - Use `cli/cross-axis-loader.ts` instead

All deprecated modules include migration guides in their JSDoc comments.

---

## Next Steps

- **[Getting Started](./Getting-Started.md)** - Quick start
- **[Constraints](./Constraints.md)** - Constraint types
- **[API](./API.md)** - Programmatic usage (includes Phase 3C improvements)
- **[Extending-DCV](./Extending-DCV.md)** - Write custom plugins (new!)
- **[Contributing](../CONTRIBUTING.md)** - Contribute code
