/**
 * DTCG 2025.10 stable-spec value normalization.
 *
 * The stable spec (2025-10-28) made color and dimension tokens **structured
 * objects** rather than CSS strings — e.g. Figma's native export emits
 *   { "colorSpace": "srgb", "components": [0.53, 0.53, 0.53], "alpha": 1, "hex": "#888888" }
 * and
 *   { "value": 16, "unit": "px" }.
 *
 * The engine and constraint plugins (WCAG, threshold, monotonic) consume the
 * legacy string/number forms. We normalize structured values to those forms in
 * ONE place — the flatten boundary — so `core/color.ts`'s verified math stays
 * untouched and string aliases (`"{dot.path}"`) keep flowing through unchanged.
 *
 * Non-sRGB color spaces are deliberately NOT coerced into sRGB math: we refuse
 * to treat e.g. display-p3 components as sRGB (that would silently corrupt
 * contrast). Without a `hex` fallback they normalize to a sentinel string that
 * the color parser rejects, producing an explicit "Unparseable color(s)"
 * warning naming the color space — never a wrong-but-silent ratio.
 */

export type DtcgColorValue = {
  colorSpace?: string;
  components?: number[];
  alpha?: number;
  hex?: string;
};

export type DtcgDimensionValue = {
  value?: number;
  unit?: string;
};

function toByte(c: number): number {
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

function srgbComponentsToCss(c: DtcgColorValue): string | null {
  if (!Array.isArray(c.components) || c.components.length < 3) return null;
  const [r, g, b] = c.components;
  if (![r, g, b].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  const a = typeof c.alpha === 'number' ? c.alpha : 1;
  const R = toByte(r);
  const G = toByte(g);
  const B = toByte(b);
  if (a >= 1) {
    const hx = (n: number) => n.toString(16).padStart(2, '0');
    return `#${hx(R)}${hx(G)}${hx(B)}`;
  }
  return `rgba(${R}, ${G}, ${B}, ${a})`;
}

function normalizeColor(v: DtcgColorValue): string {
  // Prefer the spec's `hex` convenience field when present (works for any space).
  if (typeof v.hex === 'string' && v.hex.trim()) return v.hex.trim();
  // Only gamma-encoded sRGB components map 1:1 to the existing color math.
  if ((v.colorSpace ?? '').toLowerCase() === 'srgb') {
    const css = srgbComponentsToCss(v);
    if (css) return css;
  }
  // Unsupported space with no hex fallback → sentinel the parser rejects.
  return `<unsupported colorSpace: ${v.colorSpace ?? 'unknown'}>`;
}

function normalizeDimension(v: DtcgDimensionValue): string {
  if (typeof v.value !== 'number' || !Number.isFinite(v.value)) {
    return '<invalid dimension>';
  }
  const unit = typeof v.unit === 'string' && v.unit ? v.unit : 'px';
  return `${v.value}${unit}`;
}

function isColorObject(obj: Record<string, unknown>, type?: string): boolean {
  return (
    (type ?? '').toLowerCase() === 'color' ||
    'colorSpace' in obj ||
    'components' in obj ||
    'hex' in obj
  );
}

function isDimensionObject(obj: Record<string, unknown>, type?: string): boolean {
  if ((type ?? '').toLowerCase() === 'dimension') return true;
  // A bare { value: <number> } (with or without `unit`) is a dimension even when
  // $type is absent — normalizeDimension defaults the unit to px. Previously this
  // required `unit` too, so a unit-less dimension became an <unsupported> sentinel
  // (TASK-035 E). isColorObject runs first, so a numeric `value` here is a length.
  return 'value' in obj && typeof obj.value === 'number';
}

/**
 * Normalize a raw DTCG `$value` to the string/number form the engine expects.
 * Strings (including `"{alias}"` references) and numbers pass through untouched.
 * Structured objects are converted; unrecognized objects (composite types such
 * as typography/shadow — out of scope) become a non-crashing sentinel string.
 */
export function normalizeDtcgValue(raw: unknown, type?: string): string | number {
  if (typeof raw === 'string' || typeof raw === 'number') return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (isColorObject(obj, type)) return normalizeColor(obj as DtcgColorValue);
    if (isDimensionObject(obj, type)) return normalizeDimension(obj as DtcgDimensionValue);
    return `<unsupported $value: ${(type ?? 'object').toLowerCase()}>`;
  }
  // null / undefined / boolean — return an empty string so nothing downstream crashes.
  return '';
}
