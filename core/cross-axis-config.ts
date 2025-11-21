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

import fs from "node:fs";
import { CrossAxisPlugin, type CrossAxisRule, type Ctx } from "./constraints/cross-axis.js";

type When = { id: string; op: "<="|">="|"<"|">"|"=="|"!="; value: number };
type Require = { id: string; op: "<="|">="|"<"|">"|"=="|"!="; ref?: string; fallback?: string|number };
type Compare = { a: string; op: "<="|">="|"<"|">"|"=="|"!="; b: string; delta?: string|number };
type RawRule = { id: string; level?: "error"|"warn"; where?: string; bp?: string; when?: When; require?: Require; compare?: Compare; };

/**
 * @deprecated Use cli/cross-axis-loader.ts loadCrossAxisRules() + CrossAxisPlugin() instead.
 * This function will be removed in a future major version.
 */
export function loadCrossAxisPlugin(
  path: string,
  bp?: string,
  opts?: { debug?: boolean; knownIds?: Set<string> }
) {
  const debug = !!opts?.debug;
  const known = opts?.knownIds ?? new Set<string>();
  const log = (...args: any[]) => { if (debug) console.log("[cross-axis]", ...args); };

  if (!fs.existsSync(path)) {
    log(`no rules file at ${path} (bp=${bp ?? "global"})`);
    return CrossAxisPlugin([], bp);
  }

  const raw = JSON.parse(fs.readFileSync(path, "utf8")) as { rules: RawRule[] };
  const rules: CrossAxisRule[] = [];
  const unknownIds = new Set<string>();
  const skipped: Array<{ id?: string; reason: string }> = [];

  // Fuzzy suggestion helpers (lightweight Levenshtein)
  function levenshtein(a: string, b: string) {
    const dp = Array(b.length + 1).fill(0).map((_, j) => j);
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
  function suggest(id: string, k = 3) {
    return [...known].map(c => ({ id: c, d: levenshtein(id, c) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, k);
  }

  const needId = (id?: string) => {
    if (!id) return false;
    if (!known.has(id)) { unknownIds.add(id); }
    return true;
  };

  for (const r of raw.rules || []) {
    if (r.bp && bp && r.bp !== bp) { continue; }
    if (r.bp && !bp) { // rule targets specific breakpoint; skip in global run
      continue;
    }
    try {
      if (r.when && r.require) {
        // Validate IDs
        needId(r.when.id);
        needId(r.require.id);
        if (r.require.ref) needId(r.require.ref);

        rules.push({
          id: r.id, level: r.level, where: r.where,
          when: { id: r.when.id, test: makeOp(r.when.op, r.when.value) },
          require: {
            id: r.require.id,
            test: (v: number, ctx: Ctx) => {
              const rhs = valueOrRef(ctx, r.require!.ref, r.require!.fallback);
              return cmp(v, rhs, r.require!.op);
            },
            msg: (v: number, ctx: Ctx) => {
              const rhs = valueOrRef(ctx, r.require!.ref, r.require!.fallback);
              return `${r.require!.id} ${prettyFail(r.require!.op)} ${fmt(rhs)} (was ${fmt(v)})`;
            }
          }
        });
      } else if (r.compare) {
        needId(r.compare.a);
        needId(r.compare.b);

        rules.push({
          id: r.id, level: r.level, where: r.where,
          when: { id: r.compare.a, test: () => true },
          require: {
            id: r.compare.a,
            test: (_: number, ctx: Ctx) => {
              const a = ctx.getPx(r.compare!.a) ?? NaN;
              const b = ctx.getPx(r.compare!.b) ?? NaN;
              const delta = px(r.compare!.delta ?? 0);
              if (Number.isNaN(a) || Number.isNaN(b)) return true; // skip check if missing
              return cmp(a, b + delta, r.compare!.op);
            },
            msg: (_: number, ctx: Ctx) => {
              const a = ctx.getPx(r.compare!.a);
              const b = ctx.getPx(r.compare!.b);
              const delta = px(r.compare!.delta ?? 0);
              return `${r.compare!.a} ${prettyFail(r.compare!.op)} ${fmt((b ?? 0) + delta)} (was ${fmt(a ?? NaN)})`;
            }
          }
        });
      } else {
        skipped.push({ id: r.id, reason: "neither when+require nor compare present" });
      }
    } catch (e: any) {
      skipped.push({ id: r.id, reason: `exception: ${e?.message ?? e}` });
    }
  }

  log(`loaded ${rules.length} rule(s) from ${path}${bp ? ` [bp=${bp}]` : ""}`);
  if (unknownIds.size) {
    log(`unknown ids referenced:`, [...unknownIds].join(", "));
    for (const u of unknownIds) {
      const s = suggest(u, 3);
      if (s.length) log(`  did you mean: ${s.map(x => `${x.id} (d=${x.d})`).join(', ')}`);
    }
  }
  if (skipped.length) {
    for (const s of skipped) log(`skipped rule ${s.id ?? "(no id)"} — ${s.reason}`);
  }

  // Extra hint for common anchor pitfall
  for (const r of raw.rules || []) {
    if (r.require?.ref && !known.has(r.require.ref)) {
      log(`anchor missing: ${r.require.ref} → will use fallback=${JSON.stringify(r.require.fallback)} when evaluating`);
    }
  }

  return CrossAxisPlugin(rules, bp);
}

// helpers
const px = (v: string|number) => typeof v === "number" ? v : parseFloat(String(v)) * (String(v).trim().endsWith("rem") ? 16 : 1);
const cmp = (a:number,b:number,op:When["op"]) =>
  op === ">="? a>=b : op === ">"? a>b : op === "<="? a<=b : op === "<"? a<b : op === "=="? a===b : a!==b;
const prettyFail = (op: string) => ({">=":"<",">":"≤","<=":">","<": "≥","==":"≠","!=":"="} as any)[op] || "≠";
const fmt = (v:number|string) => Number.isFinite(Number(v)) ? `${Number(v)}px` : String(v);
function valueOrRef(ctx: Ctx, ref?: string, fallback?: string|number) {
  if (ref) {
    const v = ctx.getPx(ref);
    if (v != null) return v;
  }
  return typeof fallback === "number" ? fallback : px(fallback ?? 0);
}
function makeOp(op: When["op"], rhs: number) {
  return (v: number) => cmp(v, rhs, op);
}