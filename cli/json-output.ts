import type { ConstraintIssue } from '../core/engine.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { getVersionInfo } from './version-banner.js';

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
  dcv: {
    name: string;
    version: string;
    repository: string;
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
export function formatViolation(issue: ConstraintIssue): ConstraintViolation {
  const violation: ConstraintViolation = {
    ruleId: issue.rule,
    level: issue.level === 'error' ? 'error' : 'warn',
    message: issue.message,
  };

  if (issue.id) {
    violation.nodes = [issue.id];
  }

  // Add context from where field or other metadata
  if (issue.where) {
    violation.context = { where: issue.where };
  }

  return violation;
}

/**
 * Generate a ValidationResult from collected issues
 */
export function createValidationResult(
  errors: ConstraintIssue[],
  warnings: ConstraintIssue[],
  durationMs: number,
  engineVersion: string
): ValidationResult {
  const violations = errors.map(formatViolation);
  const warningViolations = warnings.map(formatViolation);

  return {
    ok: errors.length === 0,
    counts: {
      checked: errors.length + warnings.length,
      violations: errors.length,
      warnings: warnings.length,
    },
    violations,
    warnings: warningViolations.length > 0 ? warningViolations : undefined,
    stats: {
      durationMs: Math.round(durationMs),
      engineVersion,
      timestamp: new Date().toISOString(),
    },
    dcv: getVersionInfo(),
  };
}

/**
 * Calculate SHA-256 hash of a file
 */
function hashFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath);
    return 'sha256:' + createHash('sha256').update(content).digest('hex').slice(0, 16);
  } catch {
    return 'sha256:unknown';
  }
}

/**
 * Generate a ValidationReceipt with full audit trail
 */
export function createValidationReceipt(
  result: ValidationResult,
  tokensFile: string,
  constraintsDir: string,
  breakpoint: string | undefined,
  failOn: 'off' | 'warn' | 'error'
): ValidationReceipt {
  // Hash the tokens file
  const tokensHash = hashFile(tokensFile);

  // Hash all constraint files in the directory
  const constraintHashes: Record<string, string> = {};
  try {
    const files = fs.readdirSync(constraintsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(constraintsDir, file);
        constraintHashes[file] = hashFile(filePath);
      }
    }
  } catch {
    // If constraintsDir doesn't exist, just use empty hashes
  }

  return {
    ...result,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    inputs: {
      tokensFile,
      tokensHash,
      constraintsDir,
      constraintHashes,
      breakpoint,
    },
    config: {
      failOn,
    },
  };
}

/**
 * Write JSON output to file or stdout
 */
export function writeJsonOutput(data: unknown, outputPath?: string): void {
  const json = JSON.stringify(data, null, 2);
  
  if (outputPath) {
    fs.writeFileSync(outputPath, json, 'utf-8');
    console.error(`✓ Output written to ${outputPath}`);
  } else {
    console.log(json);
  }
}
