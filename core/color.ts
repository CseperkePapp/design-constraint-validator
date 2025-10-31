// Modern CSS color parsing + OKLCH → sRGB, HSL → sRGB, hex/rgb[a].
// Alpha compositing in *linear* light (correct for WCAG).
// All channels are 0..255; alpha 0..1.

export type RGBA = { r: number; g: number; b: number; a: number };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const clamp255 = (x: number) => Math.min(255, Math.max(0, x));

/* ---------- sRGB gamma <-> linear ---------- */
export function srgbToLin(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
export function linToSrgb(c: number): number {
  return clamp255(
    (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255
  );
}

/* ---------- Relative luminance (WCAG 2.x, sRGB) ---------- */
export function relativeLuminance(rgb: RGBA): number {
  // assume opaque input; if not, composite first
  const R = srgbToLin(rgb.r);
  const G = srgbToLin(rgb.g);
  const B = srgbToLin(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
export function contrastRatio(L1: number, L2: number): number {
  const [a, b] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

/* ---------- Parsing ---------- */
const num = (s: string) => parseFloat(s);
const pct = (s: string) => parseFloat(s) / 100;

export function parseCssColor(input: string | undefined | null): RGBA | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // hex #rgb/#rgba/#rrggbb/#rrggbbaa
  let m = /^#([0-9a-f]{3,4})$/.exec(s);
  if (m) {
    const h = m[1];
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    const a = h.length === 4 ? parseInt(h[3] + h[3], 16) / 255 : 1;
    return { r, g, b, a };
  }
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(s);
  if (m) {
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
    return { r, g, b, a };
  }

  // rgb/rgba: allow % or 0-255
  m = /^rgba?\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^,/ )]+)(?:\s*[,/]\s*([^)]+))?\s*\)$/.exec(s);
  if (m) {
    const ch = (x: string) =>
      x.includes("%") ? clamp255(255 * pct(x)) : clamp255(num(x));
    const r = ch(m[1]), g = ch(m[2]), b = ch(m[3]);
    const a = m[4] ? (m[4].includes("%") ? pct(m[4]) : num(m[4])) : 1;
    return { r, g, b, a: clamp01(a) };
  }

  // hsl/hsla: h in deg, s/l in %
  m = /^hsla?\(\s*([^,]+)\s*,\s*([^,]+)%\s*,\s*([^,/ )]+)%(?:\s*[,/]\s*([^)]+))?\s*\)$/.exec(s);
  if (m) {
    const H = ((num(m[1]) % 360) + 360) % 360;
    const S = clamp01(pct(m[2]));
    const L = clamp01(pct(m[3]));
    const a = m[4] ? (m[4].includes("%") ? pct(m[4]) : num(m[4])) : 1;
    const { r, g, b } = hslToRgb(H, S, L);
    return { r, g, b, a: clamp01(a) };
  }

  // oklch(L C h / a) — L supports % or 0..1, C in 0..~0.4, h in deg
  m = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:deg)?(?:\s*[/,]\s*([^)]+))?\s*\)$/.exec(s);
  if (m) {
    const L = m[1].includes("%") ? clamp01(pct(m[1])) : clamp01(num(m[1]));
    const C = Math.max(0, num(m[2]));
    const h = ((num(m[3]) % 360) + 360) % 360;
    const a = m[4] ? (m[4].includes("%") ? pct(m[4]) : num(m[4])) : 1;
    const [r, g, b] = oklchToSrgb(L, C, h).map(v => clamp255(v * 255));
    return { r, g, b, a: clamp01(a) };
  }

  // named "transparent"
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  return null; // extend with more named colors if you want
}

/* ---------- HSL → sRGB (0..255) ---------- */
function hslToRgb(H: number, S: number, L: number): RGBA {
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const h = H / 60;
  const X = C * (1 - Math.abs((h % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 1) [r, g, b] = [C, X, 0];
  else if (1 <= h && h < 2) [r, g, b] = [X, C, 0];
  else if (2 <= h && h < 3) [r, g, b] = [0, C, X];
  else if (3 <= h && h < 4) [r, g, b] = [0, X, C];
  else if (4 <= h && h < 5) [r, g, b] = [X, 0, C];
  else [r, g, b] = [C, 0, X];
  const m = L - C / 2;
  return { r: clamp255((r + m) * 255), g: clamp255((g + m) * 255), b: clamp255((b + m) * 255), a: 1 };
}

/* ---------- OKLCH → sRGB (0..1 channels) ---------- */
function oklchToSrgb(L: number, C: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  // OKLCH -> OKLab
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  // OKLab -> LMS^
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  // LMS -> linear sRGB
  const R = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  // clamp to [0,1] (gamut clip)
  return [clamp01(R), clamp01(G), clamp01(B)];
}

/* ---------- Alpha compositing (linear light) ---------- */
export function compositeOver(fg: RGBA, bg: RGBA): RGBA {
  // Convert to linear, compose, convert back to sRGB
  const fr = srgbToLin(fg.r), fgG = srgbToLin(fg.g), fb = srgbToLin(fg.b);
  const br = srgbToLin(bg.r), bgG = srgbToLin(bg.g), bb = srgbToLin(bg.b);
  const a = fg.a + bg.a * (1 - fg.a);
  const rLin = (fr * fg.a + br * bg.a * (1 - fg.a)) / (a || 1);
  const gLin = (fgG * fg.a + bgG * bg.a * (1 - fg.a)) / (a || 1);
  const bLin = (fb * fg.a + bb * bg.a * (1 - fg.a)) / (a || 1);
  return { r: linToSrgb(rLin), g: linToSrgb(gLin), b: linToSrgb(bLin), a: a };
}

/* ---------- Helpers ---------- */
export function isOpaque(c: RGBA): boolean { return c.a >= 0.999; }
