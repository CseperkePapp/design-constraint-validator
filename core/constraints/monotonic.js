export function MonotonicPlugin(orders, parse, ruleId = "monotonic") {
    return {
        id: ruleId,
        evaluate(engine, candidates) {
            const issues = [];
            for (const [a, op, b] of orders) {
                const va = parse(engine.get(a));
                const vb = parse(engine.get(b));
                if (va == null || vb == null)
                    continue; // skip unparseable
                const ok = op === ">=" ? va >= vb : va <= vb;
                if (!ok && (candidates.has(a) || candidates.has(b))) {
                    issues.push({
                        id: `${a}|${b}`,
                        rule: "monotonic",
                        level: "error",
                        message: `${a} ${op} ${b} violated: ${va} vs ${vb}`
                    });
                }
            }
            return issues;
        }
    };
}
// a minimal parser for "rem"/"px" numbers
export const parseSize = (v) => {
    if (typeof v !== "string")
        return null;
    const m = v.trim().match(/^([0-9.]+)(rem|px)?$/i);
    if (!m)
        return null;
    const num = parseFloat(m[1]);
    const unit = (m[2] || "rem").toLowerCase();
    return unit === "px" ? num : num * 16; // assume 1rem=16px for comparisons
};
// Parser for unitless numbers (like scale factors)
export const parseNumber = (v) => {
    if (typeof v === "number")
        return v;
    if (typeof v === "string") {
        const num = parseFloat(v.trim());
        return isNaN(num) ? null : num;
    }
    return null;
};
// Parser for color lightness (OKLCH L channel)
export const parseLightness = (v) => {
    if (typeof v !== "string")
        return null;
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
