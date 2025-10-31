import type { ConstraintPlugin } from "../engine";

export type ThresholdRule = {
  id: string;                    // token id to check
  op: ">=" | "<=";               // comparison
  valuePx: number;               // threshold in px
  where?: string;                // optional context label
  level?: "error" | "warn";      // default error
};

const parseSizePx = (v: unknown): number | null => {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^([0-9.]+)\s*(px|rem)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "px").toLowerCase();
  return unit === "rem" ? n * 16 : n;
};

export function ThresholdPlugin(rules: ThresholdRule[], ruleId = "threshold"): ConstraintPlugin {
  return {
    id: ruleId,
    evaluate(engine, candidates) {
      const issues = [];
      for (const r of rules) {
        if (!candidates.has(r.id)) continue; // incremental
        const px = parseSizePx(engine.get(r.id));
        if (px == null) continue;
        const ok = r.op === ">=" ? px >= r.valuePx : px <= r.valuePx;
        if (!ok) {
          issues.push({
            id: r.id,
            rule: ruleId,
            level: r.level ?? "error",
            where: r.where,
            message: `${r.id} ${r.op} ${r.valuePx}px violated: ${px}px`
          });
        }
      }
      return issues;
    }
  };
}
