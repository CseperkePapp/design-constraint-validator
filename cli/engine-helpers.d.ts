/**
 * @deprecated This module is deprecated. Use constraint-registry.ts instead.
 *
 * Phase 3A (Architectural Cleanup): This file contains legacy constraint loading logic
 * that has been replaced by the centralized constraint-registry.ts module.
 *
 * Migration guide:
 * - Replace createEngine() or createValidationEngine() with:
 *   ```ts
 *   import { Engine } from '../core/engine.js';
 *   import { flattenTokens, type FlatToken } from '../core/flatten.js';
 *   import { setupConstraints } from './constraint-registry.js';
 *
 *   const { flat, edges } = flattenTokens(tokens);
 *   const init = {};
 *   for (const t of Object.values(flat)) {
 *     init[(t as FlatToken).id] = (t as FlatToken).value;
 *   }
 *   const engine = new Engine(init, edges);
 *   const knownIds = new Set(Object.keys(init));
 *   setupConstraints(engine, { config, bp }, { knownIds });
 *   ```
 *
 * This file will be removed in a future major version.
 */
import { type TokenNode } from '../core/flatten.js';
import { Engine } from '../core/engine.js';
import { loadTokensWithBreakpoint, type Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';
/**
 * @deprecated Use constraint-registry.ts setupConstraints() instead.
 * This function will be removed in a future major version.
 */
export declare function createEngine(tokensRoot: TokenNode, config?: DcvConfig): Engine;
/**
 * @deprecated Use constraint-registry.ts setupConstraints() instead.
 * This function will be removed in a future major version.
 */
export declare function createValidationEngine(tokensRoot: TokenNode, bp: Breakpoint | undefined, config: DcvConfig): Engine;
export { loadTokensWithBreakpoint };
//# sourceMappingURL=engine-helpers.d.ts.map