/**
 * Filesystem loader for cross-axis constraint rules.
 *
 * Phase 3B (Filesystem Separation): This module handles reading cross-axis rules
 * from JSON files and parsing them into in-memory data structures.
 *
 * Core modules (core/constraints/cross-axis.ts) accept pre-parsed rules,
 * while CLI modules use this loader to read from filesystem.
 */
import type { CrossAxisRule } from '../core/constraints/cross-axis.js';
/**
 * Raw rule format as stored in JSON files.
 */
export type RawCrossAxisRule = {
    id: string;
    level?: 'error' | 'warn';
    where?: string;
    bp?: string;
    when?: {
        id: string;
        op: '<=' | '>=' | '<' | '>' | '==' | '!=';
        value: number;
    };
    require?: {
        id: string;
        op: '<=' | '>=' | '<' | '>' | '==' | '!=';
        ref?: string;
        fallback?: string | number;
    };
    compare?: {
        a: string;
        op: '<=' | '>=' | '<' | '>' | '==' | '!=';
        b: string;
        delta?: string | number;
    };
};
/**
 * Result of loading and parsing cross-axis rules.
 */
export type LoadCrossAxisResult = {
    rules: CrossAxisRule[];
    unknownIds: Set<string>;
    skipped: Array<{
        id?: string;
        reason: string;
    }>;
};
/**
 * Options for loading cross-axis rules.
 */
export type LoadCrossAxisOptions = {
    /** Breakpoint to filter rules for */
    bp?: string;
    /** Set of known token IDs for validation */
    knownIds?: Set<string>;
    /** Enable debug logging */
    debug?: boolean;
};
/**
 * Load raw cross-axis rules from a JSON file.
 *
 * Returns undefined if file doesn't exist or can't be parsed.
 *
 * @param path Path to cross-axis rules JSON file
 * @returns Parsed rules or undefined if file missing/invalid
 */
export declare function loadCrossAxisRulesFromFile(path: string): RawCrossAxisRule[] | undefined;
/**
 * Parse raw cross-axis rules into executable constraint rules.
 *
 * This function performs:
 * - Breakpoint filtering (only include rules matching the target breakpoint)
 * - Token ID validation (track unknown IDs)
 * - Rule compilation (convert JSON predicates into executable functions)
 *
 * @param rawRules Raw rules from JSON file
 * @param opts Parsing options (breakpoint, knownIds, debug)
 * @returns Parsed rules with validation info
 */
export declare function parseCrossAxisRules(rawRules: RawCrossAxisRule[], opts?: LoadCrossAxisOptions): LoadCrossAxisResult;
/**
 * Load and parse cross-axis rules from a JSON file.
 *
 * This is the main entry point for CLI code that needs to load cross-axis rules.
 *
 * @param path Path to cross-axis rules JSON file
 * @param opts Parsing options
 * @returns Parsed rules (empty array if file doesn't exist)
 */
export declare function loadCrossAxisRules(path: string, opts?: LoadCrossAxisOptions): CrossAxisRule[];
//# sourceMappingURL=cross-axis-loader.d.ts.map