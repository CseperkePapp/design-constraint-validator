import type { ConstraintPlugin } from "../engine";
import { parseCssColor, relativeLuminance } from "../color";

export function parseLightness(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  const m = /^oklch\(\s*([0-9.]+%?)\s+/.exec(s);
  if (m) return m[1].includes("%") ? parseFloat(m[1]) / 100 : parseFloat(m[1]);
  const rgba = parseCssColor(s);
  return rgba ? relativeLuminance(rgba) : null;
}

export type Order = [string, "<=" | ">=", string];

export function MonotonicLightness(orders: Order[]): ConstraintPlugin {
  return {
    id: "monotonic-lightness",
    evaluate(engine, candidates) {
      const issues = [];
      for (const [a, op, b] of orders) {
        if (!candidates.has(a) && !candidates.has(b)) continue;
        const La = parseLightness(engine.get(a));
        const Lb = parseLightness(engine.get(b));
        if (La == null || Lb == null) continue;
        const ok = op === ">=" ? La >= Lb : La <= Lb;
        if (!ok) {
          issues.push({
            id: `${a}|${b}`,
            rule: "monotonic-lightness",
            level: "error" as const,
            message: `Lightness order violated: ${a} ${op} ${b} (${La.toFixed(3)} vs ${Lb.toFixed(3)})`
          });
        }
      }
      return issues;
    }
  };
}
