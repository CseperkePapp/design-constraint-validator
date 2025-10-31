import type { ConstraintPlugin } from "../engine";
import type { TokenId } from "../flatten";
import { parseCssColor, compositeOver, relativeLuminance, contrastRatio } from "../color";

export type ContrastPair = {
  fg: TokenId;
  bg: TokenId;
  min: number;           // e.g., 4.5
  where?: string;
  // Optional ultimate backdrop if bg is transparent; token id or literal color.
  backdrop?: TokenId | string; // default: "#ffffff"
};

function resolveColor(engineGet: (id: TokenId)=>unknown, x: TokenId | string): string | undefined {
  if (typeof x !== "string") return undefined;
  // If it's a CSS color literal, return as is; else treat as token id.
  const isLiteral = /^#|^rgb|^hsl|^oklch|^oklab|^transparent/i.test(x);
  return isLiteral ? x : String(engineGet(x) ?? "");
}

export function WcagContrastPlugin(pairs: ContrastPair[]): ConstraintPlugin {
  return {
    id: "wcag-contrast",
    evaluate(engine, candidates) {
      const issues = [];
      for (const p of pairs) {
        if (!candidates.has(p.fg) && !candidates.has(p.bg)) continue;

        const fgStr = String(engine.get(p.fg) ?? "");
        const bgStr = String(engine.get(p.bg) ?? "");
        const fg = parseCssColor(fgStr);
        const bgRaw = parseCssColor(bgStr);

        const backdropStr = resolveColor(engine.get.bind(engine), p.backdrop ?? "#ffffff");
        const backdrop = parseCssColor(backdropStr || "#ffffff");

        if (!fg || !bgRaw || !backdrop) {
          issues.push({
            id: `${p.fg}|${p.bg}`,
            rule: "wcag-contrast",
            level: "warn" as const,
            where: p.where,
            message: `Unparseable color(s): fg="${fgStr}" bg="${bgStr}" backdrop="${backdropStr}"`
          });
          continue;
        }

        // Effective background (handle bg alpha)
        const effBg = bgRaw.a < 1 ? compositeOver(bgRaw, backdrop) : bgRaw;
        // Effective foreground over effective background
        const effFg = fg.a < 1 ? compositeOver(fg, effBg) : fg;

        const Lfg = relativeLuminance(effFg);
        const Lbg = relativeLuminance(effBg);
        const ratio = contrastRatio(Lfg, Lbg);

        if (ratio < p.min) {
          issues.push({
            id: `${p.fg}|${p.bg}`,
            rule: "wcag-contrast",
            level: "error" as const,
            where: p.where,
            message: `Contrast ${ratio.toFixed(2)}:1 < ${p.min}:1`
          });
        }
      }
      return issues;
    }
  };
}
