/**
 * @deprecated This module is deprecated. Use cli/cross-axis-loader.ts instead.
 *
 * Phase 3B (Filesystem Separation): This file contains filesystem access logic
 * that has been moved to the CLI layer (cli/cross-axis-loader.ts).
 *
 * Core modules should not import from node:fs. Instead:
 * - CLI code uses cli/cross-axis-loader.ts to read and parse rules
 * - Core plugin (core/constraints/cross-axis.ts) accepts pre-parsed rules
 *
 * Migration:
 * ```ts
 * // OLD (core reads filesystem):
 * import { loadCrossAxisPlugin } from './core/cross-axis-config.js';
 * engine.use(loadCrossAxisPlugin(path, bp, { knownIds }));
 *
 * // NEW (CLI reads, core receives data):
 * import { loadCrossAxisRules } from './cli/cross-axis-loader.js';
 * import { CrossAxisPlugin } from './core/constraints/cross-axis.js';
 * const rules = loadCrossAxisRules(path, { bp, knownIds });
 * engine.use(CrossAxisPlugin(rules, bp));
 * ```
 *
 * This file will be removed in a future major version.
 */
/**
 * @deprecated Use cli/cross-axis-loader.ts loadCrossAxisRules() + CrossAxisPlugin() instead.
 * This function will be removed in a future major version.
 */
export declare function loadCrossAxisPlugin(path: string, bp?: string, opts?: {
    debug?: boolean;
    knownIds?: Set<string>;
}): import("./engine.js").ConstraintPlugin;
//# sourceMappingURL=cross-axis-config.d.ts.map