// core/constraints/cross-axis.ts
import type { ConstraintPlugin } from "../engine.js";

export type CrossAxisRule =
  | {
      id: string; level?: "error"|"warn"; where?: string;
      when: { id: string; test: (v: number) => boolean };
      require: { id: string; test: (v: number, ctx: Ctx) => boolean; msg: (v:number, ctx: Ctx)=> string };
    }
  | {
      id: string; level?: "error"|"warn"; where?: string;
      contrast: { text: string; bg: string; min: (bp?: string)=> number; ratio: (text:string,bg:string,ctx: Ctx)=> number };
    };

export type Ctx = {
  getPx(id: string): number | null;
  get(id: string): unknown;
  bp?: string;
};

// Shares the hardened finite-size policy used by monotonic/threshold (TASK-037):
// bare numbers / unitless as px, `rem`/`em` as 16px-relative, real numbers only
// (rejects ".", "5.", "1.2.3px"), and non-finite guarded. The one addition over
// the canonical parser is a clamp()/min()/max()/calc() heuristic — but it is
// gated on a `(` so a malformed bare value like "1.2.3px" is rejected rather
// than silently yielding a partial parse.
const px = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  // Direct simple form: bare number / px / rem / em.
  const m = trimmed.match(/^(\d*\.?\d+)\s*(px|rem|em)?$/i);
  if (m) {
    const n = parseFloat(m[1]);
    if (!Number.isFinite(n)) return null;
    const unit = (m[2] || 'px').toLowerCase();
    return unit === 'rem' || unit === 'em' ? n * 16 : n;
  }
  // Heuristic: first px/rem/em token inside a CSS function expression (clamp(),
  // min(), max(), calc(), …). Gated on `(` so garbage simple values don't leak.
  if (trimmed.includes('(')) {
    const inner = trimmed.match(/(\d*\.?\d+)\s*(px|rem|em)/i);
    if (inner) {
      const n = parseFloat(inner[1]);
      if (!Number.isFinite(n)) return null;
      return inner[2].toLowerCase() === 'px' ? n : n * 16;
    }
  }
  return null;
};

// Distinguish "operand absent" (skip silently) from "operand present but
// unparseable" (warn loudly) — a silent skip of a present value is a false green.
const presentButUnparseable = (raw: unknown): boolean =>
  raw != null && raw !== '' && px(raw) === null;

export function CrossAxisPlugin(rules: CrossAxisRule[], bp?: string): ConstraintPlugin {
  return {
    id: "cross-axis",
    evaluate(engine, candidates) {
      const ctx: Ctx = {
        getPx: (id) => px(engine.get(id)),
        get: (id) => engine.get(id),
        bp
      };
      const issues: Array<{
        id: string;
        rule: string;
        level: "error" | "warn";
        where?: string;
        message: string;
      }> = [];
      for (const r of rules) {
        if ("when" in r) {
          // Evaluate if either referenced id is among candidates (looser gating so global validate works)
          if (!candidates.has(r.when.id) && !candidates.has(r.require.id)) continue;
          // Present-but-unparseable operand → warn, don't silently skip (TASK-037).
          if (presentButUnparseable(ctx.get(r.when.id)) || presentButUnparseable(ctx.get(r.require.id))) {
            issues.push({
              id: r.require.id,
              rule: "cross-axis",
              level: "warn",
              where: r.where,
              message: `Cannot check cross-axis rule "${r.id}": unparseable size value(s)`
            });
            continue;
          }
          const wv = ctx.getPx(r.when.id);
          // compare-style loader rules set when.id = a, require.id = a; use same value if second missing
          let rv = ctx.getPx(r.require.id);
          if (rv == null && r.require.id === r.when.id) rv = wv;
          if (wv == null || rv == null) continue;
          if (r.when.test(wv) && !r.require.test(rv, ctx)) {
            issues.push({
              id: r.require.id,
              rule: "cross-axis",
              level: r.level ?? "error",
              where: r.where,
              message: r.require.msg(rv, ctx)
            });
          }
        } else if ("contrast" in r) {
          // simple contrast hook; delegate to supplied ratio
          if (!candidates.has(r.contrast.text) && !candidates.has(r.contrast.bg)) continue;
          const min = r.contrast.min(bp);
          const ratio = r.contrast.ratio(r.contrast.text, r.contrast.bg, ctx);
          if (ratio < min) {
            issues.push({
              id: `${r.contrast.text}|${r.contrast.bg}`,
              rule: "cross-axis",
              level: r.level ?? "warn",
              where: r.where,
              message: `Contrast ${ratio.toFixed(1)}:1 < ${min}:1`
            });
          }
        }
      }
      return issues;
    }
  };
}

// Helper rule factory: enforce a minimum delta between headings and body size.
export function headingEmphasisRules(heads: string[], bodyId: string, deltaPx = 2): CrossAxisRule[] {
  return heads.map(hid => ({
    id: `heading-emphasis-${hid}`,
    level: 'warn' as const,
    where: 'Heading emphasis',
    when: { id: bodyId, test: () => true }, // always evaluate
    require: {
      id: hid,
      test: (h: number, ctx) => {
        const body = ctx.getPx(bodyId) ?? 16;
        return h >= body + deltaPx;
      },
      msg: (h: number, ctx) => {
        const body = ctx.getPx(bodyId) ?? 16;
        return `${hid} too close to body: ${h}px < ${body + deltaPx}px`;
      }
    }
  }));
}
