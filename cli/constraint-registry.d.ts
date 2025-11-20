/**
 * Centralized constraint discovery and loading.
 *
 * This module provides a single source of truth for determining which constraints
 * are active for a given validation run. It replaces the scattered constraint-loading
 * logic previously split across engine-helpers.ts and constraints-loader.ts.
 *
 * Design principles:
 * - Constraints are discovered from config and filesystem in ONE place
 * - Core modules receive in-memory data (no filesystem access)
 * - All entry points (validate, set, graph) use this registry for consistency
 */
import type { Engine } from '../core/engine.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';
export type OrderRule = [string, '<=' | '>=', string];
export type WcagRule = {
    fg: string;
    bg: string;
    min: number;
    where: string;
    backdrop?: string;
};
export type ThresholdRule = {
    id: string;
    op: '<=' | '>=';
    valuePx: number;
    where?: string;
    level?: 'error' | 'warn';
};
/**
 * Represents a constraint source discovered from config or filesystem.
 */
export type ConstraintSource = {
    type: 'builtin-wcag';
    enabled: boolean;
} | {
    type: 'builtin-threshold';
    enabled: boolean;
} | {
    type: 'config-wcag';
    rules: WcagRule[];
} | {
    type: 'order-file';
    axis: string;
    orders: OrderRule[];
    path: string;
} | {
    type: 'lightness-file';
    orders: OrderRule[];
    path: string;
} | {
    type: 'cross-axis-file';
    path: string;
    bp?: Breakpoint;
} | {
    type: 'custom-threshold';
    rules: ThresholdRule[];
};
export type DiscoveryOptions = {
    config: DcvConfig;
    basePath?: string;
    bp?: Breakpoint;
    constraintsDir?: string;
};
export type AttachOptions = {
    knownIds: Set<string>;
    crossAxisDebug?: boolean;
};
/**
 * Discover all constraint sources for a given configuration and breakpoint.
 *
 * This function scans the filesystem and config to determine which constraints
 * should be active, but does not load or attach them yet.
 *
 * @param opts Discovery options (config, basePath, breakpoint)
 * @returns Array of constraint sources
 */
export declare function discoverConstraints(opts: DiscoveryOptions): ConstraintSource[];
/**
 * Attach constraint plugins to an engine based on discovered sources.
 *
 * This function takes the output of `discoverConstraints()` and registers
 * the appropriate plugins on the engine.
 *
 * @param engine Engine to attach plugins to
 * @param sources Constraint sources (from discoverConstraints)
 * @param opts Attachment options (knownIds, debug flags)
 */
export declare function attachConstraints(engine: Engine, sources: ConstraintSource[], opts: AttachOptions): void;
/**
 * Discover and attach constraints in one call.
 *
 * This is the main entry point for most use cases.
 *
 * @param engine Engine to attach plugins to
 * @param discoveryOpts Discovery options
 * @param attachOpts Attachment options
 */
export declare function setupConstraints(engine: Engine, discoveryOpts: DiscoveryOptions, attachOpts: AttachOptions): ConstraintSource[];
//# sourceMappingURL=constraint-registry.d.ts.map