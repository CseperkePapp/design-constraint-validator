/**
 * Filesystem loader for cross-axis constraint rules.
 *
 * Phase 3B (Filesystem Separation): This module handles reading cross-axis rules
 * from JSON files and parsing them into in-memory data structures.
 *
 * Core modules (core/constraints/cross-axis.ts) accept pre-parsed rules,
 * while CLI modules use this loader to read from filesystem.
 */
import { existsSync, readFileSync } from 'node:fs';
// ============================================================================
// Filesystem Loading
// ============================================================================
/**
 * Load raw cross-axis rules from a JSON file.
 *
 * Returns undefined if file doesn't exist or can't be parsed.
 *
 * @param path Path to cross-axis rules JSON file
 * @returns Parsed rules or undefined if file missing/invalid
 */
export function loadCrossAxisRulesFromFile(path) {
    if (!existsSync(path)) {
        return undefined;
    }
    try {
        const data = JSON.parse(readFileSync(path, 'utf8'));
        return data.rules || [];
    }
    catch {
        // Return undefined on parse errors (consistent with silent failure behavior)
        return undefined;
    }
}
// ============================================================================
// Rule Parsing and Validation
// ============================================================================
// Helper functions (copied from core/cross-axis-config.ts)
const px = (v) => typeof v === 'number' ? v : parseFloat(String(v)) * (String(v).trim().endsWith('rem') ? 16 : 1);
const cmp = (a, b, op) => op === '>=' ? a >= b : op === '>' ? a > b : op === '<=' ? a <= b : op === '<' ? a < b : op === '==' ? a === b : a !== b;
const prettyFail = (op) => ({ '>=': '<', '>': '≤', '<=': '>', '<': '≥', '==': '≠', '!=': '=' }[op] || '≠');
const fmt = (v) => (Number.isFinite(Number(v)) ? `${Number(v)}px` : String(v));
function valueOrRef(ctx, ref, fallback) {
    if (ref) {
        const v = ctx.getPx(ref);
        if (v != null)
            return v;
    }
    return typeof fallback === 'number' ? fallback : px(fallback ?? 0);
}
function makeOp(op, rhs) {
    return (v) => cmp(v, rhs, op);
}
// Lightweight Levenshtein distance for suggestions
function levenshtein(a, b) {
    const dp = Array(b.length + 1)
        .fill(0)
        .map((_, j) => j);
    for (let i = 1; i <= a.length; i++) {
        let prev = i - 1, cur = i;
        for (let j = 1; j <= b.length; j++) {
            const tmp = cur;
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            cur = Math.min(dp[j] + 1, cur + 1, prev + cost);
            dp[j] = tmp;
            prev = tmp;
        }
        dp[b.length] = cur;
    }
    return dp[b.length];
}
function suggest(id, known, k = 3) {
    return [...known]
        .map((c) => ({ id: c, d: levenshtein(id, c) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k);
}
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
export function parseCrossAxisRules(rawRules, opts = {}) {
    const { bp, knownIds = new Set(), debug = false } = opts;
    const rules = [];
    const unknownIds = new Set();
    const skipped = [];
    const log = (...args) => {
        if (debug)
            console.log('[cross-axis]', ...args);
    };
    const needId = (id) => {
        if (!id)
            return false;
        if (!knownIds.has(id)) {
            unknownIds.add(id);
        }
        return true;
    };
    for (const r of rawRules) {
        // Filter by breakpoint
        if (r.bp && bp && r.bp !== bp) {
            continue;
        }
        if (r.bp && !bp) {
            // Rule targets specific breakpoint; skip in global run
            continue;
        }
        try {
            if (r.when && r.require) {
                // Validate IDs
                needId(r.when.id);
                needId(r.require.id);
                if (r.require.ref)
                    needId(r.require.ref);
                rules.push({
                    id: r.id,
                    level: r.level,
                    where: r.where,
                    when: { id: r.when.id, test: makeOp(r.when.op, r.when.value) },
                    require: {
                        id: r.require.id,
                        test: (v, ctx) => {
                            const rhs = valueOrRef(ctx, r.require.ref, r.require.fallback);
                            return cmp(v, rhs, r.require.op);
                        },
                        msg: (v, ctx) => {
                            const rhs = valueOrRef(ctx, r.require.ref, r.require.fallback);
                            return `${r.require.id} ${prettyFail(r.require.op)} ${fmt(rhs)} (was ${fmt(v)})`;
                        },
                    },
                });
            }
            else if (r.compare) {
                needId(r.compare.a);
                needId(r.compare.b);
                rules.push({
                    id: r.id,
                    level: r.level,
                    where: r.where,
                    when: { id: r.compare.a, test: () => true },
                    require: {
                        id: r.compare.a,
                        test: (_, ctx) => {
                            const a = ctx.getPx(r.compare.a) ?? NaN;
                            const b = ctx.getPx(r.compare.b) ?? NaN;
                            const delta = px(r.compare.delta ?? 0);
                            if (Number.isNaN(a) || Number.isNaN(b))
                                return true; // skip check if missing
                            return cmp(a, b + delta, r.compare.op);
                        },
                        msg: (_, ctx) => {
                            const a = ctx.getPx(r.compare.a);
                            const b = ctx.getPx(r.compare.b);
                            const delta = px(r.compare.delta ?? 0);
                            return `${r.compare.a} ${prettyFail(r.compare.op)} ${fmt((b ?? 0) + delta)} (was ${fmt(a ?? NaN)})`;
                        },
                    },
                });
            }
            else {
                skipped.push({ id: r.id, reason: 'neither when+require nor compare present' });
            }
        }
        catch (e) {
            skipped.push({ id: r.id, reason: `exception: ${e?.message ?? e}` });
        }
    }
    // Debug logging
    if (debug) {
        log(`parsed ${rules.length} rule(s)${bp ? ` [bp=${bp}]` : ''}`);
        if (unknownIds.size) {
            log(`unknown ids referenced:`, [...unknownIds].join(', '));
            for (const u of unknownIds) {
                const s = suggest(u, knownIds, 3);
                if (s.length)
                    log(`  did you mean: ${s.map((x) => `${x.id} (d=${x.d})`).join(', ')}`);
            }
        }
        if (skipped.length) {
            for (const s of skipped)
                log(`skipped rule ${s.id ?? '(no id)'} — ${s.reason}`);
        }
        // Extra hint for common anchor pitfall
        for (const r of rawRules) {
            if (r.require?.ref && !knownIds.has(r.require.ref)) {
                log(`anchor missing: ${r.require.ref} → will use fallback=${JSON.stringify(r.require.fallback)} when evaluating`);
            }
        }
    }
    return { rules, unknownIds, skipped };
}
/**
 * Load and parse cross-axis rules from a JSON file.
 *
 * This is the main entry point for CLI code that needs to load cross-axis rules.
 *
 * @param path Path to cross-axis rules JSON file
 * @param opts Parsing options
 * @returns Parsed rules (empty array if file doesn't exist)
 */
export function loadCrossAxisRules(path, opts = {}) {
    const { debug = false } = opts;
    const log = (...args) => {
        if (debug)
            console.log('[cross-axis]', ...args);
    };
    const rawRules = loadCrossAxisRulesFromFile(path);
    if (!rawRules) {
        log(`no rules file at ${path} (bp=${opts.bp ?? 'global'})`);
        return [];
    }
    const result = parseCrossAxisRules(rawRules, opts);
    return result.rules;
}
