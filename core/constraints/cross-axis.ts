// core/constraints/cross-axis.ts
import type { ConstraintPlugin } from "../engine";

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

const px = (v: unknown): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  // Direct simple form
  let m = trimmed.match(/^([0-9.]+)\s*(px|rem)?$/i);
  if (m) {
    const n = parseFloat(m[1]);
    return (m[2] || 'px').toLowerCase() === 'rem' ? n * 16 : n;
  }
  // Heuristic: extract first numeric size token (px or rem) inside complex expressions (e.g., clamp())
  const inner = trimmed.match(/([0-9.]+)\s*(px|rem)/i);
  if (inner) {
    const n = parseFloat(inner[1]);
    return inner[2].toLowerCase() === 'rem' ? n * 16 : n;
  }
  return null;
};

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
