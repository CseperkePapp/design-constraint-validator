# Phase 3: Architectural Analysis & Implementation Plan

**Status:** Analysis Complete
**Date:** 2025-11-20
**Audit Reference:** [06_DCV_Audits_Summary_and_Strategy.md](./06_DCV_Audits_Summary_and_Strategy.md) Section 7.2-7.4

---

## Executive Summary

Phase 3 focuses on architectural improvements to the Design Constraint Validator core. The audit identified three key issues:

1. **Scattered constraint loading** - Constraints are loaded in multiple places with duplicated logic
2. **Core/filesystem boundary blur** - Core modules directly read from filesystem
3. **Weak plugin interface** - Candidate-based evaluation not enforced

This document analyzes the current implementation and provides a concrete plan for refactoring.

---

## Current Architecture Analysis

### 1. Constraint Loading: Current State

**Problem:** Constraints are loaded in **multiple locations** with **inconsistent behavior**.

#### Current Loading Points

1. **[cli/engine-helpers.ts](../../cli/engine-helpers.ts)** - Lines 9-25
   - `applyMonotonicPlugins()` - Loads `.order.json` files directly from filesystem
   - Hardcoded paths: `themes/typography.order.json`, `themes/spacing.order.json`, etc.
   - Uses `require('node:fs').readFileSync()` inline
   - Silently returns empty array on read failure

2. **[cli/engine-helpers.ts](../../cli/engine-helpers.ts)** - Lines 27-69
   - `applyWcagPlugins()` - Loads WCAG rules from config
   - **Built-in defaults** (lines 46-67): Hardcoded array of 3 default WCAG pairs
   - Config toggle: `enableBuiltInWcagDefaults` (default: `true`)

3. **[cli/constraints-loader.ts](../../cli/constraints-loader.ts)** - Lines 19-69
   - `attachRuntimeConstraints()` - Loads cross-axis and threshold rules
   - Cross-axis: `themes/cross-axis.rules.json` + optional `themes/cross-axis.{bp}.rules.json`
   - **Built-in threshold** (lines 50-64): Hardcoded 44px rule for `control.size.min`
   - Config toggle: `enableBuiltInThreshold` (default: `true`)

4. **[core/cross-axis-config.ts](../../core/cross-axis-config.ts)** - Lines 9-21
   - `loadCrossAxisPlugin()` - **Directly reads filesystem** within core module
   - Uses `fs.existsSync()` and `fs.readFileSync()` (lines 18-23)
   - **Violates core/filesystem separation principle**

#### Duplication

**Two separate functions** create engines with overlapping logic:

- `createEngine()` (lines 71-78) - Used by non-CLI code paths
- `createValidationEngine()` (lines 81-96) - Used by validate command

Both functions:
- Flatten tokens identically
- Apply monotonic plugins (with different helpers)
- Apply WCAG plugins (shared helper)
- **Do NOT** apply cross-axis or threshold (only `createValidationEngine` path gets these via `attachRuntimeConstraints`)

This means **different entry points get different constraints**, which is confusing and error-prone.

---

### 2. Filesystem Access in Core: Current State

**Problem:** Core modules (`core/`) should operate on **in-memory data only**, but currently mix filesystem I/O.

#### Violations

**[core/cross-axis-config.ts](../../core/cross-axis-config.ts)**:
```typescript
// Line 18-23
if (!fs.existsSync(path)) {
  log(`no rules file at ${path} (bp=${bp ?? "global"})`);
  return CrossAxisPlugin([], bp);
}

const raw = JSON.parse(fs.readFileSync(path, "utf8")) as { rules: RawRule[] };
```

This function:
- Lives in `core/` directory
- Directly imports `fs` from Node.js
- Reads JSON files synchronously
- Makes the core module **non-portable** (can't run in browser, Deno, etc.)

**Why This Matters:**
- Core should be testable with in-memory data
- Core should be embeddable in different runtimes
- Filesystem conventions belong in CLI/adapter layer

---

### 3. Engine/Plugin Interface: Current State

**Problem:** Candidate-based evaluation exists but is **not enforced** in plugin interface.

#### Current Interface

**[core/engine.ts](../../core/engine.ts)** - Lines 11-15:
```typescript
export type ConstraintPlugin = {
  id: string;
  // Called with the set of candidate IDs (changed + affected).
  evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
};
```

**Analysis:**
- ✅ `candidates` parameter exists
- ⚠️ **No enforcement** - plugins can ignore `candidates` and iterate all tokens
- ⚠️ **No metadata** - violations don't declare which token IDs they involve
- ⚠️ **No contract** - no way to verify plugins honor candidates

#### Current Plugin Implementations

**Monotonic Plugin** ([core/constraints/monotonic.ts](../../core/constraints/monotonic.ts)):
- ✅ **Does filter** by candidates (checks if pairs involve candidate tokens)
- ✅ Incremental-friendly

**WCAG Plugin** ([core/constraints/wcag.ts](../../core/constraints/wcag.ts)):
- ⚠️ **Partially filters** - checks if fg/bg tokens are in candidates
- May iterate all rules regardless of candidate size

**Cross-Axis Plugin** ([core/constraints/cross-axis.ts](../../core/constraints/cross-axis.ts)):
- ❌ **Likely iterates all rules** - complex multi-token predicates
- Unclear if candidate filtering is effective

**Threshold Plugin** ([core/constraints/threshold.ts](../../core/constraints/threshold.ts)):
- ✅ **Filters by candidates** - only checks threshold rules for tokens in candidate set

#### Missing Features

1. **Violation metadata**: No standard way for plugins to declare which tokens are involved
2. **Candidate validation**: No way to assert incremental correctness
3. **Graph edges**: Violations don't expose edges (for graph visualization with violations)

---

## Architectural Smells Summary

From audit document section 4.3 (Architecture Audit):

| Smell | Current State | Impact |
|-------|---------------|--------|
| **Scattered constraint config** | 4 different loading points, 2 built-in hardcoded rules | Hard to understand what constraints are active |
| **Core/CLI boundary blur** | `core/cross-axis-config.ts` reads filesystem | Core not embeddable, hard to test |
| **Weak plugin interface** | No enforcement of candidate filtering | Incremental validation may break |
| **Duplicate flattening** | CLI and core both flatten tokens | Performance overhead, maintenance burden |
| **Magic paths** | Hardcoded `themes/`, `tokens/`, `overrides/` | Inflexible, convention-over-configuration |

---

## Phase 3 Implementation Plan

### Goal 1: Centralize Constraint Loading

**Objective:** Single source of truth for "what constraints are active?"

#### Proposed Changes

1. **Create `cli/constraint-registry.ts`**:
   ```typescript
   export type ConstraintSource =
     | { type: 'builtin-wcag'; enabled: boolean }
     | { type: 'builtin-threshold'; enabled: boolean }
     | { type: 'config-wcag'; rules: WcagRule[] }
     | { type: 'order-file'; axis: string; path: string }
     | { type: 'cross-axis-file'; path: string };

   export function discoverConstraints(opts: {
     config: DcvConfig;
     basePath: string;
     bp?: Breakpoint;
   }): ConstraintSource[];

   export function attachConstraints(
     engine: Engine,
     sources: ConstraintSource[],
     knownIds: Set<string>
   ): void;
   ```

2. **Refactor `engine-helpers.ts`**:
   - Remove `applyMonotonicPlugins()` and `applyWcagPlugins()`
   - Merge `createEngine()` and `createValidationEngine()` into single `createEngine(tokens, constraints)`
   - Remove direct filesystem access

3. **Move filesystem logic to CLI layer**:
   - `validateCommand()` calls `discoverConstraints()` once
   - Passes discovered sources to `createEngine()`
   - Core never sees filesystem

#### Migration Path

1. Create new `constraint-registry.ts` with discovery logic
2. Update `validate.ts` to use new registry
3. Deprecate old helpers (mark with JSDoc `@deprecated`)
4. Remove old helpers in next major version

---

### Goal 2: Separate Core from Filesystem

**Objective:** Core modules accept in-memory data only.

#### Proposed Changes

1. **Refactor `core/cross-axis-config.ts` → `cli/cross-axis-loader.ts`**:
   ```typescript
   // NEW: cli/cross-axis-loader.ts
   export function loadCrossAxisRules(path: string): RawRule[] {
     if (!fs.existsSync(path)) return [];
     return JSON.parse(fs.readFileSync(path, "utf8")).rules;
   }

   // UPDATED: core/constraints/cross-axis.ts
   export function CrossAxisPlugin(
     rules: CrossAxisRule[], // Already parsed, in-memory
     bp?: string
   ): ConstraintPlugin;
   ```

2. **Update all constraint plugins** to accept data, not paths:
   - `MonotonicPlugin(orders: Order[], ...)` - already done ✅
   - `WcagContrastPlugin(rules: WcagRule[])` - already done ✅
   - `CrossAxisPlugin(rules: CrossAxisRule[], ...)` - needs refactor
   - `ThresholdPlugin(rules: ThresholdRule[], ...)` - already done ✅

3. **Move breakpoint loading to CLI**:
   - `core/breakpoints.ts` has `loadOrdersBP()` and `loadTokensWithBreakpoint()`
   - These belong in `cli/` (or a shared loader layer)

#### Benefits

- Core testable with fixtures (no filesystem mocking)
- Core embeddable in browser/Deno/Edge workers
- Clearer separation of concerns

---

### Goal 3: Tighten Engine/Plugin Interface

**Objective:** Make incremental validation reliable and auditable.

#### Proposed Changes

1. **Enhance `ConstraintIssue` type** ([core/engine.ts](../../core/engine.ts:3-9)):
   ```typescript
   export type ConstraintIssue = {
     id: TokenId | string;
     rule: string;
     level: "error" | "warn";
     message: string;
     where?: string;
     // NEW: Declare which tokens are involved
     involvedTokens?: TokenId[];
     // NEW: Declare which graph edges are involved
     involvedEdges?: Array<[TokenId, TokenId]>;
   };
   ```

2. **Add candidate validation** (optional, for development):
   ```typescript
   export function validateCandidateHonoring(
     plugin: ConstraintPlugin,
     engine: Engine,
     candidates: Set<TokenId>
   ): boolean {
     const fullIssues = plugin.evaluate(engine, new Set(engine.getAllIds()));
     const candidateIssues = plugin.evaluate(engine, candidates);
     // Candidate issues should be subset of full issues
     return candidateIssues.every(ci =>
       fullIssues.some(fi => issueEquals(ci, fi))
     );
   }
   ```

3. **Document candidate contract** in plugin interface:
   ```typescript
   /**
    * ConstraintPlugin interface.
    *
    * Plugins MUST honor the `candidates` set:
    * - Only evaluate constraints that involve at least one candidate token
    * - Return violations where at least one involved token is in candidates
    *
    * This enables incremental validation (only re-check changed tokens + dependents).
    */
   export type ConstraintPlugin = {
     id: string;
     evaluate(engine: Engine, candidates: Set<TokenId>): ConstraintIssue[];
   };
   ```

4. **Expose `Engine.getAllIds()` for plugin use**:
   ```typescript
   export class Engine {
     // ...existing methods...

     /** Get all token IDs in the engine. */
     getAllIds(): TokenId[] {
       return Array.from(this.values.keys());
     }

     /** Get flat token map for adapters (avoid duplicate flattening). */
     getFlatTokens(): Record<TokenId, TokenValue> {
       return Object.fromEntries(this.values);
     }
   }
   ```

#### Benefits

- Plugins can be tested for incremental correctness
- Violations carry structured metadata for tooling
- Engine exposes clean API for CLI/adapters

---

## Implementation Phases

### Phase 3A: Constraint Registry ✅ COMPLETE
- ✅ Create `cli/constraint-registry.ts`
- ✅ Implement `discoverConstraints()` and `attachConstraints()`
- ✅ Update `validate.ts`, `set.ts`, `why.ts` to use registry
- ✅ Keep old helpers as deprecated fallbacks
- ✅ **Committed**: commit 534c4d2

### Phase 3B: Filesystem Separation ✅ COMPLETE
- ✅ Created `cli/cross-axis-loader.ts` (filesystem reading + parsing)
- ✅ Updated `cli/constraint-registry.ts` to use new loader
- ✅ `CrossAxisPlugin` already accepted in-memory rules (no change needed)
- ✅ Deprecated `core/cross-axis-config.ts` (marked for future removal)
- ✅ Core modules no longer use new filesystem imports
- ✅ **Status**: Build passes, ready to commit

### Phase 3C: Plugin Interface (Week 3)
- ✅ Add `involvedTokens`/`involvedEdges` to `ConstraintIssue`
- ✅ Update all first-party plugins to populate metadata
- ✅ Add `Engine.getAllIds()` and `Engine.getFlatTokens()`
- ✅ Document candidate contract in plugin interface
- ✅ (Optional) Add candidate validation helper for testing

### Phase 3D: Documentation & Cleanup (Week 4)
- ✅ Update [Architecture.md](../Architecture.md) with new design
- ✅ Update [API.md](../API.md) with Engine API changes
- ✅ Update [Extending-DCV.md](../Extending-DCV.md) with plugin contract
- ✅ Remove deprecated helpers
- ✅ Update all examples to use new API

---

## Risk Assessment

### Low Risk
- ✅ **Constraint registry** - Pure addition, no breaking changes
- ✅ **Filesystem separation** - Internal refactor, CLI API unchanged
- ✅ **Enhanced ConstraintIssue** - Backwards compatible (new fields optional)

### Medium Risk
- ⚠️ **Engine API changes** - `getAllIds()` and `getFlatTokens()` are new exports
  - Mitigation: These are additions, not changes
- ⚠️ **Plugin interface semantics** - Documenting candidate contract may reveal bugs
  - Mitigation: Add tests to verify existing plugins honor contract

### High Risk
- ❌ **Breaking changes to plugin signature** - Would break custom plugins
  - Mitigation: Don't change signature, only add optional fields and document expectations

---

## Success Criteria

1. **Single constraint loading path**: All commands use `constraint-registry.ts`
2. **Core has zero filesystem imports**: `core/` directory has no `fs`, `path`, etc.
3. **Engine exposes clean API**: `getAllIds()`, `getFlatTokens()`, documented plugin contract
4. **No behavior regressions**: All existing tests pass, all examples work
5. **Documentation updated**: Architecture, API, and Extending guides reflect new design

---

## Open Questions

1. **Should built-in rules be configurable?**
   - Currently: 44px threshold is hardcoded, always error-level
   - Proposal: Make threshold value and level configurable in `dcv.config.json`
   - Decision: **YES** - Add to Phase 3A (constraint registry should support configuring built-ins)

2. **Should order files be in `themes/` or `constraints/`?**
   - Currently: `themes/*.order.json`
   - Audit suggests: Rename directory to avoid confusion with visual themes
   - Decision: **Defer to Phase 4** - Filesystem conventions are low priority, focus on code structure first

3. **Should Engine.evaluate() always run all constraints?**
   - Currently: Yes, candidates filtering happens inside plugins
   - Alternative: Engine filters plugins based on candidate involvement
   - Decision: **Keep current design** - Plugins know best which tokens they care about

---

## Appendix: File Map

### Files to Create
- `cli/constraint-registry.ts` - Centralized discovery and attachment
- `cli/cross-axis-loader.ts` - Filesystem loading for cross-axis rules

### Files to Modify
- `core/engine.ts` - Add `getAllIds()`, `getFlatTokens()`, enhance `ConstraintIssue`
- `core/constraints/cross-axis.ts` - Accept in-memory rules (not paths)
- `cli/engine-helpers.ts` - Remove old helpers, use registry
- `cli/commands/validate.ts` - Use `discoverConstraints()` instead of scattered loading
- `cli/constraints-loader.ts` - Potentially merge into registry or remove

### Files to Move/Rename
- `core/cross-axis-config.ts` → `cli/cross-axis-loader.ts` (or merge into registry)

### Files to Deprecate (then Delete)
- `cli/engine-helpers.ts` functions: `applyMonotonicPlugins()`, `applyWcagPlugins()`
- `core/cross-axis-config.ts` (after moving)

---

## Next Steps

1. ✅ Review this analysis with stakeholders
2. Get approval for implementation plan
3. Begin Phase 3A: Constraint Registry
4. Track progress in [GitHub Project](https://github.com/CseperkePapp/design-constraint-validator/projects)

---

**Document Status:** Ready for Review
**Estimated Effort:** 3-4 weeks (assuming 1 developer, part-time)
**Priority:** High (foundational for DTS integration and plugin extensibility)
