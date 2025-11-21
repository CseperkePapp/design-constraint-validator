# API Reference

Programmatic usage of Design Constraint Validator.

## Installation

```bash
npm install -D design-constraint-validator
```

## ESM/TypeScript

DCV is an **ESM-only** package. Requires Node.js ≥18.

```typescript
import { validate, Engine } from 'design-constraint-validator';
```

---

## Quick Start

### Basic Validation

```typescript
import { validate } from 'design-constraint-validator';

const result = await validate({
  tokensPath: './tokens.json',
  themesPath: './themes'
});

if (!result.ok) {
  console.error('Validation failed!');
  for (const v of result.violations) {
    console.error(`[${v.kind}] ${v.message}`);
  }
  process.exitCode = 1;
}
```

---

## API Functions

### `validate(options)`

Validate design tokens against constraints.

**Signature:**
```typescript
function validate(options: ValidateOptions): Promise<ValidationResult>
```

**Options:**
```typescript
interface ValidateOptions {
  tokensPath?: string | string[];
  themesPath?: string | string[];
  configPath?: string;
  breakpoint?: string;
  allBreakpoints?: boolean;
  failOn?: 'error' | 'warn' | 'off';
  strict?: boolean;
  quiet?: boolean;
}
```

**Returns:**
```typescript
interface ValidationResult {
  ok: boolean;
  violations: Violation[];
  stats: {
    checked: number;
    errors: number;
    warnings: number;
    durationMs: number;
  };
}

interface Violation {
  severity: 'error' | 'warn';
  kind: string;
  token: string;
  message: string;
  source?: string;
  nodes?: string[];
  edges?: [string, string][];
}
```

**Example:**
```typescript
const result = await validate({
  tokensPath: './tokens.json',
  themesPath: './themes',
  failOn: 'warn',
  strict: true
});

console.log(`Checked ${result.stats.checked} tokens`);
console.log(`Found ${result.stats.errors} errors, ${result.stats.warnings} warnings`);
console.log(`Took ${result.stats.durationMs}ms`);
```

---

### `build(options)`

Build token outputs.

**Signature:**
```typescript
function build(options: BuildOptions): Promise<BuildResult>
```

**Options:**
```typescript
interface BuildOptions {
  tokensPath?: string;
  output?: string;
  format?: 'css' | 'json' | 'js';
  breakpoint?: string;
  watch?: boolean;
  dryRun?: boolean;
}
```

**Returns:**
```typescript
interface BuildResult {
  output: string;
  format: string;
  stats: {
    tokens: number;
    bytes: number;
    durationMs: number;
  };
}
```

**Example:**
```typescript
import { build } from 'design-constraint-validator';

const result = await build({
  tokensPath: './tokens.json',
  output: './dist/tokens.css',
  format: 'css'
});

console.log(`Generated ${result.stats.bytes} bytes in ${result.stats.durationMs}ms`);
```

---

### `graph(options)`

Generate dependency/constraint graph.

**Signature:**
```typescript
function graph(options: GraphOptions): Promise<GraphResult>
```

**Options:**
```typescript
interface GraphOptions {
  tokensPath?: string;
  format?: 'mermaid' | 'dot' | 'json';
  hasse?: string;
  filter?: string;
  onlyViolations?: boolean;
  highlightViolations?: boolean;
}
```

**Returns:**
```typescript
interface GraphResult {
  output: string;
  format: string;
  stats: {
    nodes: number;
    edges: number;
  };
}
```

**Example:**
```typescript
import { graph } from 'design-constraint-validator';

const result = await graph({
  tokensPath: './tokens.json',
  format: 'json',
  hasse: 'typography'
});

const data = JSON.parse(result.output);
console.log(`Graph has ${data.nodes.length} nodes and ${data.edges.length} edges`);
```

---

### `why(tokenId, options)`

Explain token provenance.

**Signature:**
```typescript
function why(tokenId: string, options?: WhyOptions): Promise<ProvenanceResult>
```

**Options:**
```typescript
interface WhyOptions {
  tokensPath?: string;
  format?: 'json' | 'table';
}
```

**Returns:**
```typescript
interface ProvenanceResult {
  token: string;
  value: any;
  source: string;
  dependencies: Array<{
    id: string;
    value: any;
    relation: string;
  }>;
  constraints: Array<{
    type: string;
    satisfied: boolean;
    rule: string;
    actual?: string;
  }>;
}
```

**Example:**
```typescript
import { why } from 'design-constraint-validator';

const result = await why('typography.size.h1', {
  tokensPath: './tokens.json',
  format: 'json'
});

console.log(`Token: ${result.token}`);
console.log(`Value: ${result.value}`);
console.log(`Dependencies: ${result.dependencies.length}`);
```

---

## Engine Class

Low-level validation engine for advanced use cases.

### Constructor

```typescript
import { Engine } from 'design-constraint-validator';

const engine = new Engine(
  initialValues: Record<string, any>,
  edges?: Array<[string, string]>
);
```

**Example:**
```typescript
const engine = new Engine({
  'typography.size.h1': '32px',
  'typography.size.h2': '24px',
  'typography.size.body': '16px'
});
```

### Methods

#### `get(tokenId)`

Get token value.

```typescript
const value = engine.get('typography.size.h1');
// Returns: '32px'
```

#### `set(tokenId, value)`

Set token value.

```typescript
engine.set('typography.size.h1', '36px');
```

#### `use(plugin)`

Register constraint plugin.

```typescript
import { MonotonicPlugin } from 'design-constraint-validator';

engine.use(new MonotonicPlugin([
  ['typography.size.h1', '>=', 'typography.size.h2']
], parsePx));
```

#### `validate()`

Run all plugins and return violations.

```typescript
const violations = engine.validate();

for (const v of violations) {
  console.error(`${v.severity}: ${v.message}`);
}
```

#### `getGraph()`

Get dependency graph.

```typescript
const { nodes, edges} = engine.getGraph();

console.log(`Graph has ${nodes.length} nodes and ${edges.length} edges`);
```

#### `getAllIds()` ✨ New in Phase 3C

Get all token IDs in the engine.

```typescript
const allIds: string[] = engine.getAllIds();

// Useful for creating full candidate sets
const fullCandidates = new Set(engine.getAllIds());
const issues = engine.evaluate(fullCandidates);
```

**Use cases:**
- Iterate over all tokens
- Create full candidate set for validation
- Export token lists

#### `getFlatTokens()` ✨ New in Phase 3C

Get flat token map without re-flattening.

```typescript
const tokens: Record<string, string | number> = engine.getFlatTokens();

// Example output:
// {
//   'typography.size.h1': '32px',
//   'typography.size.h2': '24px',
//   'color.text.body': '#333333'
// }
```

**Use cases:**
- Export token values for adapters
- Serialize engine state
- Avoid duplicate flattening operations

**Note:** This returns the current state. Changes via `set()` or `commit()` are reflected immediately.

---

## Plugins

### Built-in Plugins

#### MonotonicPlugin

Validate ordering constraints.

```typescript
import { MonotonicPlugin } from 'design-constraint-validator/core';

const plugin = new MonotonicPlugin(
  rules: [string, '>=' | '<=', string][],
  parser: (value: any) => number,
  name?: string
);

engine.use(plugin);
```

**Example:**
```typescript
import { MonotonicPlugin } from 'design-constraint-validator';

function parsePx(value: string | number): number {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace('px', ''));
}

const plugin = new MonotonicPlugin([
  ['typography.size.h1', '>=', 'typography.size.h2'],
  ['typography.size.h2', '>=', 'typography.size.body']
], parsePx, 'typography-scale');

engine.use(plugin);
```

#### WcagContrastPlugin

Validate color contrast.

```typescript
import { WcagContrastPlugin } from 'design-constraint-validator/core';

const plugin = new WcagContrastPlugin(
  rules: Array<{
    fg: string;
    bg: string;
    min: number;
    where: string;
  }>
);

engine.use(plugin);
```

**Example:**
```typescript
import { WcagContrastPlugin } from 'design-constraint-validator';

const plugin = new WcagContrastPlugin([
  {
    fg: 'color.text.body',
    bg: 'color.bg.surface',
    min: 4.5,
    where: 'Body text (AA)'
  },
  {
    fg: 'color.text.heading',
    bg: 'color.bg.surface',
    min: 7.0,
    where: 'Headings (AAA)'
  }
]);

engine.use(plugin);
```

#### MonotonicLightness

Validate color lightness ordering.

```typescript
import { MonotonicLightness } from 'design-constraint-validator/core';

const plugin = new MonotonicLightness(
  rules: [string, '>=' | '<=', string][]
);

engine.use(plugin);
```

---

### Custom Plugins

Create custom constraint plugins:

```typescript
import { Engine, ConstraintPlugin, Violation } from 'design-constraint-validator';

class MyPlugin implements ConstraintPlugin {
  name = 'my-custom-plugin';
  
  check(engine: Engine): Violation[] {
    const violations: Violation[] = [];
    
    // Your validation logic
    const value = engine.get('my.token');
    
    if (!this.isValid(value)) {
      violations.push({
        severity: 'error',
        kind: 'custom',
        token: 'my.token',
        message: 'Validation failed',
        nodes: ['my.token'],
        edges: []
      });
    }
    
    return violations;
  }
  
  private isValid(value: any): boolean {
    // Your validation logic
    return true;
  }
}

// Use plugin
engine.use(new MyPlugin());
const violations = engine.validate();
```

---

## Utilities

### Color Utilities

```typescript
import { 
  toOKLCH,
  contrastRatio,
  relativeLuminance 
} from 'design-constraint-validator/core/color';

// Convert to OKLCH
const oklch = toOKLCH('#0066cc');
console.log(oklch); // { L: 0.55, C: 0.20, H: 265 }

// Calculate contrast ratio
const ratio = contrastRatio('#000000', '#ffffff');
console.log(ratio); // 21

// Get relative luminance
const lum = relativeLuminance('#808080');
console.log(lum); // ~0.22
```

### Token Utilities

```typescript
import { 
  flattenTokens,
  parseAndFlatten 
} from 'design-constraint-validator/core/flatten';

// Flatten nested tokens
const flat = flattenTokens({
  color: {
    brand: {
      primary: { $value: '#0066cc' }
    }
  }
});

console.log(flat);
// { 'color.brand.primary': { value: '#0066cc', ... } }
```

### Graph Utilities

```typescript
import { Poset } from 'design-constraint-validator/core/poset';

// Create partial order set
const poset = new Poset<string>();

poset.add('h1');
poset.add('h2');
poset.add('h3');

poset.addEdge('h1', 'h2');  // h1 > h2
poset.addEdge('h2', 'h3');  // h2 > h3

// Get transitive closure
const closure = poset.transitiveClosure();

// Export Hasse diagram
const hasse = poset.toHasse();
```

---

## TypeScript Types

### Core Types

```typescript
import type {
  Token,
  FlatToken,
  TokenValue,
  TokenNode,
  Violation,
  ValidationResult,
  ConstraintPlugin
} from 'design-constraint-validator';
```

### Configuration Types

```typescript
import type {
  DcvConfig,
  ValidateOptions,
  BuildOptions,
  GraphOptions,
  WhyOptions
} from 'design-constraint-validator';
```

---

## Error Handling

```typescript
import { validate } from 'design-constraint-validator';

try {
  const result = await validate({
    tokensPath: './tokens.json'
  });
  
  if (!result.ok) {
    // Handle validation errors (expected)
    for (const v of result.violations) {
      console.error(`[${v.kind}] ${v.message}`);
    }
  }
} catch (error) {
  // Handle runtime errors (unexpected)
  console.error('Fatal error:', error);
  process.exit(1);
}
```

---

## Watch Mode

```typescript
import { build } from 'design-constraint-validator';
import { watch } from 'node:fs';

// Manual watch
watch('./tokens.json', async () => {
  console.log('Tokens changed, rebuilding...');
  await build({
    tokensPath: './tokens.json',
    output: './dist/tokens.css',
    format: 'css'
  });
});

// Or use built-in watch
await build({
  tokensPath: './tokens.json',
  output: './dist/tokens.css',
  format: 'css',
  watch: true
});
```

---

## Examples

### Full Validation Pipeline

```typescript
import { validate, graph, build } from 'design-constraint-validator';

async function runPipeline() {
  // 1. Validate
  console.log('Validating tokens...');
  const validation = await validate({
    tokensPath: './tokens.json',
    themesPath: './themes',
    failOn: 'warn'
  });
  
  if (!validation.ok) {
    console.error(`Found ${validation.violations.length} violations`);
    for (const v of validation.violations) {
      console.error(`  ${v.severity}: ${v.message}`);
    }
    return false;
  }
  
  // 2. Generate graph
  console.log('Generating graph...');
  const graphResult = await graph({
    tokensPath: './tokens.json',
    format: 'mermaid',
    hasse: 'typography'
  });
  
  await writeFile('./docs/graph.mmd', graphResult.output);
  
  // 3. Build outputs
  console.log('Building outputs...');
  await build({
    tokensPath: './tokens.json',
    output: './dist/tokens.css',
    format: 'css'
  });
  
  await build({
    tokensPath: './tokens.json',
    output: './dist/tokens.js',
    format: 'js'
  });
  
  console.log('Pipeline complete!');
  return true;
}

runPipeline().then(success => {
  process.exitCode = success ? 0 : 1;
});
```

### Custom Constraint

```typescript
import { Engine, ConstraintPlugin, Violation } from 'design-constraint-validator';

class MaxFontSizePlugin implements ConstraintPlugin {
  name = 'max-font-size';
  
  constructor(private maxSizePx: number = 72) {}
  
  check(engine: Engine): Violation[] {
    const violations: Violation[] = [];
    
    // Check all typography.size.* tokens
    const tokens = engine.getAllTokens();
    for (const [id, value] of Object.entries(tokens)) {
      if (!id.startsWith('typography.size.')) continue;
      
      const sizePx = parseFloat(String(value).replace('px', ''));
      if (sizePx > this.maxSizePx) {
        violations.push({
          severity: 'warn',
          kind: 'max-font-size',
          token: id,
          message: `Font size ${sizePx}px exceeds maximum ${this.maxSizePx}px`,
          nodes: [id]
        });
      }
    }
    
    return violations;
  }
}

// Use it
const engine = new Engine({
  'typography.size.display': '96px',
  'typography.size.h1': '32px'
});

engine.use(new MaxFontSizePlugin(72));

const violations = engine.validate();
// Will warn about display size (96px > 72px)
```

---

## Next Steps

- **[Getting Started](./Getting-Started.md)** - Quick start guide
- **[Constraints](./Constraints.md)** - Constraint types
- **[CLI Reference](./CLI.md)** - CLI commands
- **[Architecture](./Architecture.md)** - How it works
