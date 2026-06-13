import type { ConstraintPlugin } from "../engine.js";

export type ThresholdRule = {
  id: string;                    // token id to check
  op: ">=" | "<=";               // comparison
  valuePx: number;               // threshold in px
  where?: string;                // optional context label
  level?: "error" | "warn";      // default error
};

// Coerces bare numbers and unitless strings to px (TASK-031: numeric `$value`
// previously returned null, silently skipping the threshold). `rem`/`em` are
// 16px-relative. Returns null only for genuinely unparseable operands.
const parseSizePx = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^([0-9.]+)\s*(px|rem|em)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "px").toLowerCase();
  return unit === "rem" || unit === "em" ? n * 16 : n;
};

export function ThresholdPlugin(rules: ThresholdRule[], ruleId = "threshold"): ConstraintPlugin {
  return {
    id: ruleId,
    evaluate(engine, candidates) {
      const issues = [];
      for (const r of rules) {
        if (!candidates.has(r.id)) continue; // incremental
        const raw = engine.get(r.id);
        const px = parseSizePx(raw);
        if (px == null) {
          // Present-but-unparseable size — warn instead of silently skipping (TASK-031).
          if (raw != null && raw !== "") {
            issues.push({
              id: r.id,
              rule: ruleId,
              level: "warn" as const,
              where: r.where,
              message: `Cannot check ${r.id} ${r.op} ${r.valuePx}px: unparseable size value`
            });
          }
          continue;
        }
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
