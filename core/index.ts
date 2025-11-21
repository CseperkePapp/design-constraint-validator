/**
 * Public API exports for Design Constraint Validator core.
 *
 * This file re-exports the main types and classes from the core engine.
 * See engine.ts for full implementation with Phase 3C enhancements.
 */

export type { TokenId, TokenValue } from "./flatten.js";
export type { ConstraintIssue, ConstraintPlugin, Graph } from "./engine.js";
export { Engine } from "./engine.js";
