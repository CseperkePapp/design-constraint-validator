// core/constraints/monotonic.ts
import type { ConstraintPlugin } from "../engine.js";
import type { Order } from "../poset.js";

export function MonotonicPlugin(
  orders: Order[], 
  parse: (v: unknown) => number | null,
  ruleId = "monotonic"
): ConstraintPlugin {
  return {
    id: ruleId,
    evaluate(engine, candidates) {
      const issues = [];
      for (const [a, op, b] of orders) {
        if (!candidates.has(a) && !candidates.has(b)) continue; // incremental
        const rawA = engine.get(a);
        const rawB = engine.get(b);
        const va = parse(rawA);
        const vb = parse(rawB);
        // A present-but-unparseable size operand (e.g. "50%", "10vw") can't be
        // compared — warn instead of silently skipping (TASK-031).
        if ((rawA != null && rawA !== "" && va == null) || (rawB != null && rawB !== "" && vb == null)) {
          issues.push({
            id: `${a}|${b}`,
            rule: "monotonic",
            level: "warn" as const,
            message: `Cannot check ${a} ${op} ${b}: unparseable size value(s)`
          });
          continue;
        }
        if (va == null || vb == null) continue; // operand absent — nothing to check
        const ok = op === ">=" ? va >= vb : va <= vb;
        if (!ok) {
          issues.push({
            id: `${a}|${b}`,
            rule: "monotonic",
            level: "error" as const,
            message: `${a} ${op} ${b} violated: ${va} vs ${vb}`
          });
        }
      }
      return issues;
    }
  };
}

// Parse a size to px for comparison. Coerces bare numbers and unitless strings to
// px (TASK-031: numeric `$value` and aliases-to-numbers previously returned null,
// silently skipping the rule). `rem`/`em` are 16px-relative. Returns null only for
// genuinely unparseable operands (e.g. "50%", "10vw") — callers warn, not skip.
export const parseSize = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null; // bare number == px
  if (typeof v !== "string") return null;
  // Real number only: rejects ".", "5.", "1.2.3px" (which previously slipped
  // through `[0-9.]+` + parseFloat as NaN/garbage and became spurious errors).
  const m = v.trim().match(/^(\d*\.?\d+)\s*(px|rem|em)?$/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (!Number.isFinite(num)) return null;
  const unit = (m[2] || "px").toLowerCase();
  return unit === "rem" || unit === "em" ? num * 16 : num; // px and unitless as-is
};

// Parser for unitless numbers (like scale factors)
export const parseNumber = (v: unknown): number | null => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const num = parseFloat(v.trim());
    return isNaN(num) ? null : num;
  }
  return null;
};

// Parser for color lightness (OKLCH L channel)
export const parseLightness = (v: unknown): number | null => {
  if (typeof v !== "string") return null;
  
  // Match oklch(L C H / A) format
  const oklchMatch = v.trim().match(/oklch\s*\(\s*([0-9.]+)\s+/i);
  if (oklchMatch) {
    return parseFloat(oklchMatch[1]);
  }
  
  // For hex colors, rough approximation (you'd want a proper converter)
  const hexMatch = v.trim().match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    const r = parseInt(hexMatch[1].slice(0, 2), 16) / 255;
    const g = parseInt(hexMatch[1].slice(2, 4), 16) / 255;
    const b = parseInt(hexMatch[1].slice(4, 6), 16) / 255;
    // Simple luminance approximation
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  
  return null;
};
