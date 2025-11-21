/**
 * @deprecated This module is deprecated. Use constraint-registry.ts instead.
 *
 * Phase 3A (Architectural Cleanup): This file contains legacy runtime constraint
 * loading logic that has been replaced by the centralized constraint-registry.ts module.
 *
 * Migration: Replace attachRuntimeConstraints() with setupConstraints() from constraint-registry.ts
 *
 * This file will be removed in a future major version.
 */
import type { Engine } from '../core/engine.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';
type AttachRuntimeOpts = {
    config: DcvConfig;
    knownIds: Set<string>;
    bp?: Breakpoint;
    crossAxisDebug?: boolean;
};
/**
 * Attach runtime constraints that depend on project files or built-in policies:
 * - Cross-axis rules from themes/cross-axis*.rules.json
 * - Built-in threshold rules (e.g., control.size.min >= 44px)
 *
 * @deprecated Use setupConstraints() from constraint-registry.ts instead.
 * This function will be removed in a future major version.
 */
export declare function attachRuntimeConstraints(engine: Engine, opts: AttachRuntimeOpts): void;
export {};
//# sourceMappingURL=constraints-loader.d.ts.map