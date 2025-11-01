import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
/**
 * Convert internal ConstraintIssue to standardized ConstraintViolation format
 */
export function formatViolation(issue) {
    const violation = {
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
export function createValidationResult(errors, warnings, durationMs, engineVersion) {
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
    };
}
/**
 * Calculate SHA-256 hash of a file
 */
function hashFile(filePath) {
    try {
        const content = fs.readFileSync(filePath);
        return 'sha256:' + createHash('sha256').update(content).digest('hex').slice(0, 16);
    }
    catch {
        return 'sha256:unknown';
    }
}
/**
 * Generate a ValidationReceipt with full audit trail
 */
export function createValidationReceipt(result, tokensFile, constraintsDir, breakpoint, failOn) {
    // Hash the tokens file
    const tokensHash = hashFile(tokensFile);
    // Hash all constraint files in the directory
    const constraintHashes = {};
    try {
        const files = fs.readdirSync(constraintsDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(constraintsDir, file);
                constraintHashes[file] = hashFile(filePath);
            }
        }
    }
    catch {
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
export function writeJsonOutput(data, outputPath) {
    const json = JSON.stringify(data, null, 2);
    if (outputPath) {
        fs.writeFileSync(outputPath, json, 'utf-8');
        console.error(`✓ Output written to ${outputPath}`);
    }
    else {
        console.log(json);
    }
}
