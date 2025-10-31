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

## Next Steps

- **[Getting Started](./Getting-Started.md)** - Quick start
- **[Constraints](./Constraints.md)** - Constraint types
- **[API](./API.md)** - Programmatic usage
- **[Contributing](../CONTRIBUTING.md)** - Contribute code
