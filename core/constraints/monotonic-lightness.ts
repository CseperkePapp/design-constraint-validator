import type { ConstraintPlugin } from "../engine.js";
import { parseCssColor, relativeLuminance } from "../color.js";

export function parseLightness(v: unknown): number | null {
  if (typeof v !== "string") return null;
  // ONE consistent lightness scale for every format. parseCssColor handles
  // hex / rgb / hsl / oklch (oklch→sRGB is the verified TASK-005 pipeline), so we
  // always compare WCAG relative luminance.
  //
  // BUG FIXED (TASK-009): oklch() previously short-circuited to its raw perceptual
  // L coordinate — a DIFFERENT scale from the relative luminance used for hex. A
  // scale mixing the two formats then compared incomparable numbers (e.g. oklch L
  // 0.60 vs hex luminance 0.216 for the same gray), yielding false pass/fail.
  const rgba = parseCssColor(v.trim());
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
