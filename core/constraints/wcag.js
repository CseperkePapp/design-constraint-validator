import { parseCssColor, compositeOver, relativeLuminance, contrastRatio } from "../color.js";
function resolveColor(engineGet, x) {
    if (typeof x !== "string")
        return undefined;
    // If it's a CSS color literal, return as is; else treat as token id.
    const isLiteral = /^#|^rgb|^hsl|^oklch|^oklab|^transparent/i.test(x);
    return isLiteral ? x : String(engineGet(x) ?? "");
}
export function WcagContrastPlugin(pairs) {
    return {
        id: "wcag-contrast",
        evaluate(engine, candidates) {
            const issues = [];
            for (const p of pairs) {
                if (!candidates.has(p.fg) && !candidates.has(p.bg))
                    continue;
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
                        level: "warn",
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
                        level: "error",
                        where: p.where,
                        message: `Contrast ${ratio.toFixed(2)}:1 < ${p.min}:1`
                    });
                }
            }
            return issues;
        }
    };
}
