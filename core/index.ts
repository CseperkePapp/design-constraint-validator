/**
 * Public API exports for Design Constraint Validator core.
 *
 * This file re-exports the main types and classes from the core engine.
 * See engine.ts for full implementation with Phase 3C enhancements.
 */

export type { TokenId, TokenValue } from "./flatten.js";
export type { ConstraintIssue, ConstraintPlugin, Graph } from "./engine.js";
export { Engine } from "./engine.js";

// Programmatic convenience API (validate tokens against constraints in one call).
// Implemented in the CLI layer atop the shared registry; surfaced here as the
// package's public entry point.
export { validate } from "../cli/validate-api.js";
export type { ValidateInput, ValidateResult } from "../cli/validate-api.js";
