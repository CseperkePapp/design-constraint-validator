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
import { z } from 'zod';
import type { CrossAxisRule } from '../core/constraints/cross-axis.js';
import type { ConstraintIssue } from '../core/engine.js';

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
  skipped: Array<{ id?: string; reason: string }>;
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
/**
 * Outcome of reading a cross-axis rules file, distinguishing the three cases a
 * validator must not collapse (TASK-037): a *missing* file (no rules, fine) vs.
 * a *present-but-unusable* file (bad JSON / wrong shape — must be surfaced, never
 * silently treated as "no rules → green") vs. a successfully read rule array.
 */
export type RawCrossAxisFileResult =
  | { status: 'missing' }
  | { status: 'invalid'; reason: string }
  | { status: 'ok'; rules: RawCrossAxisRule[] };

export function readCrossAxisRulesFile(path: string): RawCrossAxisFileResult {
  if (!existsSync(path)) return { status: 'missing' };
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e: any) {
    return { status: 'invalid', reason: `invalid JSON (${e?.message ?? e})` };
  }
  const rules = (data as { rules?: unknown } | null)?.rules;
  if (!Array.isArray(rules)) {
    return { status: 'invalid', reason: 'expected a top-level "rules" array' };
  }
  return { status: 'ok', rules: rules as RawCrossAxisRule[] };
}

/**
 * Back-compat shim: returns the rule array, or `undefined` for both missing and
 * present-but-unusable files. Prefer {@link readCrossAxisRulesFile} when the
 * caller needs to surface the unusable case.
 */
export function loadCrossAxisRulesFromFile(path: string): RawCrossAxisRule[] | undefined {
  const res = readCrossAxisRulesFile(path);
  return res.status === 'ok' ? res.rules : undefined;
}

// ---------------------------------------------------------------------------
// Rule shape validation (TASK-037)
//
// A cross-axis rule that fails to compile must be SKIPPED WITH A REASON, never
// compiled into an always-true predicate or a NaN comparison. Examples the old
// code admitted silently: a `when` missing `op`/`value` (always-true), a
// `require` with no RHS (compared against 0), a non-numeric `fallback` (NaN).
// ---------------------------------------------------------------------------

const opEnum = z.enum(['<=', '>=', '<', '>', '==', '!=']);
const sizeConst = z.union([z.number(), z.string()]);

const RawCrossAxisRuleSchema = z
  .object({
    id: z.string(),
    level: z.enum(['error', 'warn']).optional(),
    where: z.string().optional(),
    bp: z.string().optional(),
    when: z.object({ id: z.string(), op: opEnum, value: z.number().finite() }).strict().optional(),
    require: z
      .object({ id: z.string(), op: opEnum, ref: z.string().optional(), fallback: sizeConst.optional() })
      .strict()
      .optional(),
    compare: z.object({ a: z.string(), op: opEnum, b: z.string(), delta: sizeConst.optional() }).strict().optional(),
  })
  .strict();

export type RuleValidation =
  | { ok: true; rule: RawCrossAxisRule }
  | { ok: false; id?: string; reason: string };

export function validateRawRule(raw: unknown): RuleValidation {
  const parsed = RawCrossAxisRuleSchema.safeParse(raw);
  if (!parsed.success) {
    const id =
      raw && typeof raw === 'object' && 'id' in raw && typeof (raw as any).id === 'string'
        ? (raw as any).id
        : undefined;
    const reason = parsed.error.issues.map((e) => `${e.path.join('.') || '<root>'}: ${e.message}`).join('; ');
    return { ok: false, id, reason };
  }
  const rule = parsed.data as RawCrossAxisRule;
  const hasWhenReq = !!(rule.when && rule.require);
  const hasCompare = !!rule.compare;
  if (!hasWhenReq && !hasCompare) {
    return { ok: false, id: rule.id, reason: 'must define when+require or compare' };
  }
  if (hasWhenReq && hasCompare) {
    return { ok: false, id: rule.id, reason: 'must define exactly one of when+require or compare' };
  }
  // Size constants must parse, or the compiled predicate degrades to NaN/0.
  if (rule.require?.fallback !== undefined && px(rule.require.fallback) === null) {
    return { ok: false, id: rule.id, reason: `require.fallback is not a parseable size: ${JSON.stringify(rule.require.fallback)}` };
  }
  if (rule.compare?.delta !== undefined && px(rule.compare.delta) === null) {
    return { ok: false, id: rule.id, reason: `compare.delta is not a parseable size: ${JSON.stringify(rule.compare.delta)}` };
  }
  return { ok: true, rule };
}

/**
 * Whether a rule is active for a given breakpoint scope. Shared by rule
 * compilation and coverage enumeration so the two never drift (TASK-037): a
 * rule that did not run must not be able to make coverage look "matched".
 */
export function ruleMatchesBp(r: { bp?: string }, bp?: string): boolean {
  if (r?.bp && bp && r.bp !== bp) return false; // targets a different bp
  if (r?.bp && !bp) return false; // bp-specific rule in a global run
  return true;
}

// ============================================================================
// Rule Parsing and Validation
// ============================================================================

// Parse a cross-axis size CONSTANT (rule `fallback`/`delta`), not a token value.
// Mirrors the hardened finite-size policy (TASK-037): real numbers only, `rem`/
// `em` 16px-relative, non-finite rejected — but allows a leading `-` because a
// `compare.delta` is a signed offset (e.g. "-560px"). Returns null on garbage so
// callers reject the rule instead of silently degrading to NaN/0.
const px = (v: string | number): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const m = v.trim().match(/^(-?\d*\.?\d+)\s*(px|rem|em)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = (m[2] || 'px').toLowerCase();
  return unit === 'rem' || unit === 'em' ? n * 16 : n;
};

const cmp = (a: number, b: number, op: '<=' | '>=' | '<' | '>' | '==' | '!=') =>
  op === '>=' ? a >= b : op === '>' ? a > b : op === '<=' ? a <= b : op === '<' ? a < b : op === '==' ? a === b : a !== b;

const prettyFail = (op: string) => ({ '>=': '<', '>': '≤', '<=': '>', '<': '≥', '==': '≠', '!=': '=' } as any)[op] || '≠';

const fmt = (v: number | string) => (Number.isFinite(Number(v)) ? `${Number(v)}px` : String(v));

function valueOrRef(ctx: any, ref?: string, fallback?: string | number) {
  if (ref) {
    const v = ctx.getPx(ref);
    if (v != null) return v;
  }
  if (typeof fallback === 'number') return fallback;
  // `?? 0` is defensive only: validateRawRule rejects rules whose fallback does
  // not parse, so a compiled rule never reaches here with garbage.
  return px(fallback ?? 0) ?? 0;
}

function makeOp(op: '<=' | '>=' | '<' | '>' | '==' | '!=', rhs: number) {
  return (v: number) => cmp(v, rhs, op);
}

// Lightweight Levenshtein distance for suggestions
function levenshtein(a: string, b: string) {
  const dp = Array(b.length + 1)
    .fill(0)
    .map((_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1,
      cur = i;
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

function suggest(id: string, known: Set<string>, k = 3) {
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
export function parseCrossAxisRules(rawRules: RawCrossAxisRule[], opts: LoadCrossAxisOptions = {}): LoadCrossAxisResult {
  const { bp, knownIds = new Set(), debug = false } = opts;
  const rules: CrossAxisRule[] = [];
  const unknownIds = new Set<string>();
  const skipped: Array<{ id?: string; reason: string }> = [];

  const log = (...args: any[]) => {
    if (debug) console.log('[cross-axis]', ...args);
  };

  const needId = (id?: string) => {
    if (!id) return false;
    if (!knownIds.has(id)) {
      unknownIds.add(id);
    }
    return true;
  };

  for (const raw of rawRules) {
    // Filter by breakpoint (shared with coverage enumeration so they never drift).
    if (!ruleMatchesBp(raw as RawCrossAxisRule, bp)) continue;

    // Validate shape BEFORE compiling: an invalid rule is skipped with a reason,
    // never compiled into an always-true or NaN predicate (TASK-037).
    const valid = validateRawRule(raw);
    if (!valid.ok) {
      skipped.push({ id: valid.id, reason: valid.reason });
      continue;
    }
    const r = valid.rule;

    try {
      if (r.when && r.require) {
        // Validate IDs
        needId(r.when.id);
        needId(r.require.id);
        if (r.require.ref) needId(r.require.ref);

        rules.push({
          id: r.id,
          level: r.level,
          where: r.where,
          when: { id: r.when.id, test: makeOp(r.when.op, r.when.value) },
          require: {
            id: r.require.id,
            test: (v: number, ctx: any) => {
              const rhs = valueOrRef(ctx, r.require!.ref, r.require!.fallback);
              return cmp(v, rhs, r.require!.op);
            },
            msg: (v: number, ctx: any) => {
              const rhs = valueOrRef(ctx, r.require!.ref, r.require!.fallback);
              return `${r.require!.id} ${prettyFail(r.require!.op)} ${fmt(rhs)} (was ${fmt(v)})`;
            },
          },
        });
      } else if (r.compare) {
        needId(r.compare.a);
        needId(r.compare.b);

        rules.push({
          id: r.id,
          level: r.level,
          where: r.where,
          when: { id: r.compare.a, test: () => true },
          require: {
            id: r.compare.a,
            test: (_: number, ctx: any) => {
              const a = ctx.getPx(r.compare!.a) ?? NaN;
              const b = ctx.getPx(r.compare!.b) ?? NaN;
              const delta = px(r.compare!.delta ?? 0) ?? 0;
              if (Number.isNaN(a) || Number.isNaN(b)) return true; // skip check if missing
              return cmp(a, b + delta, r.compare!.op);
            },
            msg: (_: number, ctx: any) => {
              const a = ctx.getPx(r.compare!.a);
              const b = ctx.getPx(r.compare!.b);
              const delta = px(r.compare!.delta ?? 0) ?? 0;
              return `${r.compare!.a} ${prettyFail(r.compare!.op)} ${fmt((b ?? 0) + delta)} (was ${fmt(a ?? NaN)})`;
            },
          },
        });
      }
    } catch (e: any) {
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
        if (s.length) log(`  did you mean: ${s.map((x) => `${x.id} (d=${x.d})`).join(', ')}`);
      }
    }
    if (skipped.length) {
      for (const s of skipped) log(`skipped rule ${s.id ?? '(no id)'} — ${s.reason}`);
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
export function loadCrossAxisRules(path: string, opts: LoadCrossAxisOptions = {}): CrossAxisRule[] {
  const { debug = false } = opts;
  const log = (...args: any[]) => {
    if (debug) console.log('[cross-axis]', ...args);
  };

  const rawRules = loadCrossAxisRulesFromFile(path);

  if (!rawRules) {
    log(`no rules file at ${path} (bp=${opts.bp ?? 'global'})`);
    return [];
  }

  const result = parseCrossAxisRules(rawRules, opts);
  return result.rules;
}

/**
 * Load + parse cross-axis rules AND return notices to surface (TASK-037).
 *
 * Unlike {@link loadCrossAxisRules}, a present-but-unusable file or a skipped
 * (invalid) rule produces a `warn`-level {@link ConstraintIssue} so it appears
 * in the validation result instead of vanishing into a silent "no rules → green".
 */
export function loadCrossAxisRulesDetailed(
  path: string,
  opts: LoadCrossAxisOptions = {},
): { rules: CrossAxisRule[]; notices: ConstraintIssue[] } {
  const file = readCrossAxisRulesFile(path);
  if (file.status === 'missing') return { rules: [], notices: [] };
  if (file.status === 'invalid') {
    return {
      rules: [],
      notices: [
        {
          id: 'cross-axis',
          rule: 'cross-axis',
          level: 'warn',
          where: path,
          message: `Cross-axis rules file present but unusable: ${file.reason}`,
        },
      ],
    };
  }
  const result = parseCrossAxisRules(file.rules, opts);
  const notices: ConstraintIssue[] = result.skipped.map((s) => ({
    id: `cross-axis:${s.id ?? '(no id)'}`,
    rule: 'cross-axis',
    level: 'warn' as const,
    message: `Cross-axis rule ${s.id ? `"${s.id}" ` : ''}skipped: ${s.reason}`,
  }));
  return { rules: result.rules, notices };
}

/**
 * Token ids a cross-axis file contributes to constraint coverage for a given
 * breakpoint scope (TASK-037). Mirrors compilation exactly: the SAME bp filter
 * and the SAME shape validation, so a rule that did not run cannot make coverage
 * look "matched" (which would suppress the "nothing was checked" note).
 *
 * `coverageKnown` is false only when the file is present-but-unusable.
 */
export function referencedIdsForFile(path: string, bp?: string): { ids: string[]; coverageKnown: boolean } {
  const file = readCrossAxisRulesFile(path);
  if (file.status === 'missing') return { ids: [], coverageKnown: true };
  if (file.status === 'invalid') return { ids: [], coverageKnown: false };
  const ids: string[] = [];
  for (const raw of file.rules) {
    if (!ruleMatchesBp(raw as RawCrossAxisRule, bp)) continue;
    const v = validateRawRule(raw);
    if (!v.ok) continue; // invalid rule did not compile → contributes no coverage
    const r = v.rule;
    if (r.when?.id) ids.push(r.when.id);
    if (r.require?.id) ids.push(r.require.id);
    if (r.require?.ref) ids.push(r.require.ref);
    if (r.compare?.a) ids.push(r.compare.a);
    if (r.compare?.b) ids.push(r.compare.b);
  }
  return { ids, coverageKnown: true };
}
