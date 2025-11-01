import type { ConstraintIssue } from '../core/engine.js';
export interface ConstraintViolation {
    ruleId: string;
    level: 'error' | 'warn';
    message: string;
    nodes?: string[];
    edges?: [string, string][];
    context?: {
        actual?: unknown;
        expected?: unknown;
        threshold?: number;
        [key: string]: unknown;
    };
}
export interface ValidationResult {
    ok: boolean;
    counts: {
        checked: number;
        violations: number;
        warnings: number;
    };
    violations: ConstraintViolation[];
    warnings?: ConstraintViolation[];
    stats: {
        durationMs: number;
        engineVersion: string;
        timestamp: string;
    };
}
export interface ValidationReceipt extends ValidationResult {
    environment: {
        nodeVersion: string;
        platform: string;
        arch: string;
    };
    inputs: {
        tokensFile: string;
        tokensHash: string;
        constraintsDir: string;
        constraintHashes: Record<string, string>;
        breakpoint?: string;
    };
    config: {
        failOn: 'off' | 'warn' | 'error';
        overrides?: string[];
    };
}
/**
 * Convert internal ConstraintIssue to standardized ConstraintViolation format
 */
export declare function formatViolation(issue: ConstraintIssue): ConstraintViolation;
/**
 * Generate a ValidationResult from collected issues
 */
export declare function createValidationResult(errors: ConstraintIssue[], warnings: ConstraintIssue[], durationMs: number, engineVersion: string): ValidationResult;
/**
 * Generate a ValidationReceipt with full audit trail
 */
export declare function createValidationReceipt(result: ValidationResult, tokensFile: string, constraintsDir: string, breakpoint: string | undefined, failOn: 'off' | 'warn' | 'error'): ValidationReceipt;
/**
 * Write JSON output to file or stdout
 */
export declare function writeJsonOutput(data: unknown, outputPath?: string): void;
//# sourceMappingURL=json-output.d.ts.map