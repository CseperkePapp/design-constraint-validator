# Extending DCV: Custom Constraint Plugins

This guide explains how to write custom constraint plugins for the Design Constraint Validator.

---

## Overview

DCV's plugin architecture allows you to define custom validation rules beyond the built-in constraints (WCAG, monotonic, thresholds, cross-axis).

**Common use cases:**
- Domain-specific design rules
- Brand guidelines enforcement
- Accessibility requirements beyond WCAG
- Complex multi-token relationships

---

## Plugin Interface

### Basic Structure

Every plugin implements the `ConstraintPlugin` interface:

```typescript
import type { ConstraintPlugin, Engine, TokenId, ConstraintIssue } from 'design-constraint-validator';

export function MyCustomPlugin(config: MyConfig): ConstraintPlugin {
  return {
    id: 'my-custom-plugin',
    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
      const issues: ConstraintIssue[] = [];

      // Your constraint logic here

      return issues;
    }
  };
}
```

### Plugin Contract (Phase 3C)

Plugins **MUST** follow these contracts for correct behavior:

#### 1. Candidate Contract (Required)

**Rule:** Only evaluate constraints that involve at least one token in the `candidates` set.

**Why:** This enables incremental validation. When a token changes, DCV only re-validates the changed token and its dependents (candidates), not the entire token set.

**Example:**
```typescript
evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
  const issues: ConstraintIssue[] = [];

  for (const rule of this.rules) {
    // ✅ CORRECT: Skip if no involved tokens are candidates
    if (!candidates.has(rule.tokenA) && !candidates.has(rule.tokenB)) {
      continue; // Skip this rule, it's not affected by changes
    }

    // Now check the constraint...
    const valueA = engine.get(rule.tokenA);
    const valueB = engine.get(rule.tokenB);

    if (violatesConstraint(valueA, valueB)) {
      issues.push({
        id: `${rule.tokenA}|${rule.tokenB}`,
        rule: 'my-custom-plugin',
        level: 'error',
        message: `Constraint violated between ${rule.tokenA} and ${rule.tokenB}`,
        involvedTokens: [rule.tokenA, rule.tokenB], // Metadata (recommended)
      });
    }
  }

  return issues;
}
```

**Anti-pattern:**
```typescript
// ❌ WRONG: Always iterating all tokens ignores candidates
evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
  const issues: ConstraintIssue[] = [];
  const allIds = engine.getAllIds();

  // This defeats incremental validation!
  for (const id of allIds) {
    // ... check constraints ...
  }

  return issues;
}
```

#### 2. Metadata Contract (Recommended)

**Rule:** Populate `involvedTokens` in returned issues.

**Why:** Enables filtering, highlighting, graph visualization, and better tooling support.

**Example:**
```typescript
issues.push({
  id: `${fgToken}|${bgToken}`,
  rule: 'custom-contrast',
  level: 'error',
  message: 'Insufficient contrast',
  where: 'Custom UI component',
  involvedTokens: [fgToken, bgToken], // ✨ Metadata for tooling
  involvedEdges: [[fgToken, bgToken]], // ✨ Optional: relationship edges
});
```

**Benefits:**
- UI tools can highlight affected tokens
- Graph visualizations can show constraint edges
- Incremental updates can filter by token ID

---

## Complete Plugin Example

Here's a complete example implementing a "max ratio" constraint between two tokens:

```typescript
import type {
  ConstraintPlugin,
  Engine,
  TokenId,
  ConstraintIssue
} from 'design-constraint-validator';

/**
 * Configuration for a max ratio rule.
 */
export type MaxRatioRule = {
  tokenA: TokenId;
  tokenB: TokenId;
  maxRatio: number;
  where?: string;
  level?: 'error' | 'warn';
};

/**
 * Plugin that enforces maximum ratio between two tokens.
 *
 * Example: Ensure h1 is not more than 2x larger than h2.
 */
export function MaxRatioPlugin(
  rules: MaxRatioRule[],
  parser: (value: any) => number = parseFloat
): ConstraintPlugin {
  return {
    id: 'max-ratio',

    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
      const issues: ConstraintIssue[] = [];

      for (const rule of rules) {
        // 1. CANDIDATE CONTRACT: Skip if neither token is a candidate
        if (!candidates.has(rule.tokenA) && !candidates.has(rule.tokenB)) {
          continue;
        }

        // 2. Get token values
        const valueA = engine.get(rule.tokenA);
        const valueB = engine.get(rule.tokenB);

        if (valueA === undefined || valueB === undefined) {
          continue; // Skip if tokens don't exist
        }

        // 3. Parse values
        const numA = parser(valueA);
        const numB = parser(valueB);

        if (isNaN(numA) || isNaN(numB) || numB === 0) {
          continue; // Skip unparseable or division by zero
        }

        // 4. Check constraint
        const ratio = numA / numB;

        if (ratio > rule.maxRatio) {
          issues.push({
            id: `${rule.tokenA}|${rule.tokenB}`,
            rule: 'max-ratio',
            level: rule.level || 'error',
            message: `Ratio ${ratio.toFixed(2)} exceeds maximum ${rule.maxRatio} (${rule.tokenA} / ${rule.tokenB})`,
            where: rule.where,
            // 5. METADATA CONTRACT: Populate involvedTokens
            involvedTokens: [rule.tokenA, rule.tokenB],
            involvedEdges: [[rule.tokenA, rule.tokenB]],
          });
        }
      }

      return issues;
    }
  };
}
```

### Usage

```typescript
import { Engine } from 'design-constraint-validator';
import { MaxRatioPlugin } from './max-ratio-plugin.js';

const engine = new Engine({
  'typography.size.h1': '48px',
  'typography.size.h2': '32px',
  'typography.size.h3': '24px',
}, []);

// Register plugin
engine.use(MaxRatioPlugin([
  {
    tokenA: 'typography.size.h1',
    tokenB: 'typography.size.h2',
    maxRatio: 2.0,
    where: 'Heading scale',
    level: 'warn'
  },
  {
    tokenA: 'typography.size.h2',
    tokenB: 'typography.size.h3',
    maxRatio: 1.5,
    where: 'Heading scale',
    level: 'warn'
  }
]));

// Validate
const allIds = new Set(engine.getAllIds());
const issues = engine.evaluate(allIds);

for (const issue of issues) {
  console.error(`[${issue.level}] ${issue.message}`);
}
```

---

## Advanced Patterns

### Pattern 1: Multi-Token Constraints

For constraints involving 3+ tokens:

```typescript
evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
  const issues: ConstraintIssue[] = [];

  for (const rule of rules) {
    const tokens = [rule.tokenA, rule.tokenB, rule.tokenC];

    // Skip if NONE of the involved tokens are candidates
    if (!tokens.some(t => candidates.has(t))) {
      continue;
    }

    // Check constraint involving all three...
    if (violated) {
      issues.push({
        id: tokens.join('|'),
        rule: 'multi-token-rule',
        level: 'error',
        message: 'Constraint violated',
        involvedTokens: tokens, // All participating tokens
      });
    }
  }

  return issues;
}
```

### Pattern 2: Stateful Plugins (Advanced)

Most plugins should be stateless, but if you need state:

```typescript
export function StatefulPlugin(config: Config): ConstraintPlugin {
  // State is captured in closure
  const cache = new Map<string, number>();

  return {
    id: 'stateful-plugin',
    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
      // Use cache for expensive computations
      // ...
    }
  };
}
```

**Warning:** State persists across `evaluate()` calls. Ensure your caching logic handles token changes correctly.

### Pattern 3: Conditional Rules

Enable/disable rules based on config or token values:

```typescript
export function ConditionalPlugin(
  rules: ConditionalRule[],
  options: { enableExperimental?: boolean } = {}
): ConstraintPlugin {
  // Filter rules at plugin creation time
  const activeRules = rules.filter(rule => {
    if (rule.experimental && !options.enableExperimental) {
      return false; // Skip experimental rules
    }
    return true;
  });

  return {
    id: 'conditional-plugin',
    evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[] {
      const issues: ConstraintIssue[] = [];

      for (const rule of activeRules) {
        // ... standard evaluation ...
      }

      return issues;
    }
  };
}
```

---

## Testing Plugins

### Unit Testing

Test plugins in isolation with fixture data:

```typescript
import { describe, it, expect } from 'vitest';
import { Engine } from 'design-constraint-validator';
import { MaxRatioPlugin } from './max-ratio-plugin.js';

describe('MaxRatioPlugin', () => {
  it('should detect ratio violations', () => {
    const engine = new Engine({
      'size.large': '48px',
      'size.small': '12px',
    }, []);

    engine.use(MaxRatioPlugin([
      { tokenA: 'size.large', tokenB: 'size.small', maxRatio: 3.0 }
    ]));

    const issues = engine.evaluate(new Set(['size.large', 'size.small']));

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('Ratio 4.00 exceeds maximum 3');
  });

  it('should honor candidates', () => {
    const engine = new Engine({
      'size.large': '48px',
      'size.small': '12px',
      'size.medium': '24px',
    }, []);

    engine.use(MaxRatioPlugin([
      { tokenA: 'size.large', tokenB: 'size.small', maxRatio: 3.0 }
    ]));

    // Only check size.medium (not involved in rule)
    const issues = engine.evaluate(new Set(['size.medium']));

    expect(issues).toHaveLength(0); // Rule should be skipped
  });
});
```

### Integration Testing

Test with real token files:

```typescript
import { describe, it } from 'vitest';
import { Engine, flattenTokens } from 'design-constraint-validator';
import { readFileSync } from 'node:fs';
import { MaxRatioPlugin } from './max-ratio-plugin.js';

describe('MaxRatioPlugin integration', () => {
  it('should validate production tokens', () => {
    const tokensJson = JSON.parse(readFileSync('./tokens.json', 'utf8'));
    const { flat, edges } = flattenTokens(tokensJson);

    const init = {};
    for (const [id, token] of Object.entries(flat)) {
      init[id] = token.value;
    }

    const engine = new Engine(init, edges);
    engine.use(MaxRatioPlugin([
      { tokenA: 'typography.h1', tokenB: 'typography.h2', maxRatio: 2.0 }
    ]));

    const issues = engine.evaluate(new Set(Object.keys(init)));

    // Assert expectations...
  });
});
```

---

## Built-in Plugin Reference

For reference implementations, see the built-in plugins in the codebase:

- **[core/constraints/monotonic.ts](../../core/constraints/monotonic.ts)** - Ordering constraints
- **[core/constraints/wcag.ts](../../core/constraints/wcag.ts)** - WCAG contrast
- **[core/constraints/threshold.ts](../../core/constraints/threshold.ts)** - Min/max thresholds
- **[core/constraints/cross-axis.ts](../../core/constraints/cross-axis.ts)** - Complex multi-token rules

---

## Best Practices

### 1. Keep Plugins Pure

Plugins should be pure functions with no side effects:

✅ **Good:**
```typescript
evaluate(engine, candidates) {
  const issues = [];
  for (const rule of this.rules) {
    // Pure computation
    if (violates(engine.get(rule.tokenA), engine.get(rule.tokenB))) {
      issues.push({ /* ... */ });
    }
  }
  return issues;
}
```

❌ **Bad:**
```typescript
evaluate(engine, candidates) {
  // Side effects!
  console.log('Evaluating...'); // Logs are okay for debugging, but avoid in production
  fs.writeFileSync('log.txt', 'data'); // Never write to filesystem
  this.lastRun = Date.now(); // Avoid mutating plugin state
}
```

### 2. Handle Missing/Invalid Values Gracefully

Tokens might not exist or have unparseable values:

```typescript
const value = engine.get(tokenId);

if (value === undefined) {
  continue; // Token doesn't exist, skip rule
}

const parsed = parseFloat(value);

if (isNaN(parsed)) {
  continue; // Unparseable value, skip rule
}

// Now safe to use parsed value
```

### 3. Provide Helpful Error Messages

Include context in violation messages:

```typescript
// ❌ Not helpful
message: 'Constraint violated'

// ✅ Helpful
message: `${tokenA} (${valueA}) exceeds ${tokenB} (${valueB}) by ${diff.toFixed(2)}px`
```

### 4. Use TypeScript

Take advantage of TypeScript for type safety:

```typescript
export type MyRuleConfig = {
  tokenA: TokenId;
  tokenB: TokenId;
  threshold: number;
  level?: 'error' | 'warn';
};

export function MyPlugin(rules: MyRuleConfig[]): ConstraintPlugin {
  // TypeScript ensures type safety
}
```

---

## Plugin Distribution

### Publishing to npm

If you want to share your plugin:

1. **Create a package:**
   ```bash
   npm init
   ```

2. **Declare peer dependency:**
   ```json
   {
     "name": "dcv-plugin-max-ratio",
     "peerDependencies": {
       "design-constraint-validator": "^1.0.0"
     }
   }
   ```

3. **Export your plugin:**
   ```typescript
   // index.ts
   export { MaxRatioPlugin } from './max-ratio-plugin.js';
   export type { MaxRatioRule } from './max-ratio-plugin.js';
   ```

4. **Publish:**
   ```bash
   npm publish
   ```

### Usage by Others

Users install and import your plugin:

```bash
npm install -D dcv-plugin-max-ratio
```

```typescript
import { Engine } from 'design-constraint-validator';
import { MaxRatioPlugin } from 'dcv-plugin-max-ratio';

const engine = new Engine(/* ... */);
engine.use(MaxRatioPlugin(/* config */));
```

---

## Further Reading

- [API.md](./API.md) - Full API reference
- [Architecture.md](./Architecture.md) - System architecture
- [Concepts.md](./Concepts.md) - Core concepts and terminology
- [core/engine.ts](../../core/engine.ts) - Engine implementation with Phase 3C enhancements

---

**Questions?** Open an issue on [GitHub](https://github.com/CseperkePapp/design-constraint-validator/issues) or check the [examples directory](../../examples/) for more plugin samples.
