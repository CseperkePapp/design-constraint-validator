/**
 * Pure derivation logic for the read-only insight tools
 * (`list-constraints`, `explain`, `suggest-fix`).
 *
 * Everything here is side-effect free: no filesystem, no engine construction, no
 * writes. Callers pass in a value resolver and the already-discovered constraint
 * sources; these functions turn raw violations into explanations and verified
 * suggestions. The WCAG math reuses core/color so suggestions are checked against
 * the same contrast pipeline the validator uses.
 */
import {
  DEFAULT_THRESHOLDS,
  DEFAULT_WCAG_PAIRS,
  type ConstraintSource,
  type OrderRule,
} from '../cli/constraint-registry.js';
import { parseSize } from '../core/constraints/monotonic.js';
import { parseLightness } from '../core/constraints/monotonic-lightness.js';
import {
  parseCssColor,
  compositeOver,
  relativeLuminance,
  contrastRatio,
  type RGBA,
} from '../core/color.js';

/** Thrown for caller-facing problems (bad input, unsupported rule). The MCP
 *  handler maps `.code` onto a structured tool error. */
export class InsightError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Resolves a token id to its value string, or returns the argument unchanged
 *  when it is a literal (e.g. a backdrop color), mirroring the WCAG plugin. */
export type ValueResolver = (idOrLiteral: string) => string;

// ---------------------------------------------------------------------------
// list-constraints
// ---------------------------------------------------------------------------

export type ConstraintDescriptor =
  | { kind: 'wcag'; source: 'builtin' | 'config'; foreground: string; background: string; minRatio: number; backdrop?: string; where?: string }
  | { kind: 'threshold'; source: 'builtin' | 'config'; tokenId: string; op: '>=' | '<='; valuePx: number; where?: string }
  | { kind: 'order'; source: 'file'; axis: string; path: string; orders: OrderRule[] }
  | { kind: 'lightness'; source: 'file'; path: string; orders: OrderRule[] }
  | { kind: 'cross-axis'; source: 'file'; path: string; breakpoint?: string };

/** Flatten discovered constraint sources into a stable, agent-friendly list. */
export function describeConstraints(sources: ConstraintSource[]): ConstraintDescriptor[] {
  const out: ConstraintDescriptor[] = [];
  for (const s of sources) {
    switch (s.type) {
      case 'builtin-wcag':
        if (s.enabled) {
          for (const p of DEFAULT_WCAG_PAIRS) {
            out.push({ kind: 'wcag', source: 'builtin', foreground: p.fg, background: p.bg, minRatio: p.min, ...(p.backdrop ? { backdrop: p.backdrop } : {}), ...(p.where ? { where: p.where } : {}) });
          }
        }
        break;
      case 'builtin-threshold':
        if (s.enabled) {
          for (const t of DEFAULT_THRESHOLDS) {
            out.push({ kind: 'threshold', source: 'builtin', tokenId: t.id, op: t.op, valuePx: t.valuePx, ...(t.where ? { where: t.where } : {}) });
          }
        }
        break;
      case 'config-wcag':
        for (const r of s.rules) {
          out.push({ kind: 'wcag', source: 'config', foreground: r.fg, background: r.bg, minRatio: r.min, ...(r.backdrop ? { backdrop: r.backdrop } : {}), ...(r.where ? { where: r.where } : {}) });
        }
        break;
      case 'custom-threshold':
        for (const r of s.rules) {
          out.push({ kind: 'threshold', source: 'config', tokenId: r.id, op: r.op, valuePx: r.valuePx, ...(r.where ? { where: r.where } : {}) });
        }
        break;
      case 'order-file':
        out.push({ kind: 'order', source: 'file', axis: s.axis, path: s.path, orders: s.orders });
        break;
      case 'lightness-file':
        out.push({ kind: 'lightness', source: 'file', path: s.path, orders: s.orders });
        break;
      case 'cross-axis-file':
        out.push({ kind: 'cross-axis', source: 'file', path: s.path, ...(s.bp ? { breakpoint: s.bp } : {}) });
        break;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// shared helpers
// ---------------------------------------------------------------------------

type RuleKind = 'wcag' | 'threshold' | 'monotonic' | 'monotonic-lightness';

function classifyRule(ruleId: string): RuleKind {
  switch (ruleId) {
    case 'wcag-contrast':
      return 'wcag';
    case 'threshold':
    case 'custom-threshold':
      return 'threshold';
    case 'monotonic':
      return 'monotonic';
    case 'monotonic-lightness':
      return 'monotonic-lightness';
    default:
      throw new InsightError('unsupported_rule', `explain/suggest-fix does not support rule "${ruleId}" (supported: wcag-contrast, threshold, custom-threshold, monotonic, monotonic-lightness).`);
  }
}

/** A monotonic issue id is `a|b`; a caller may also pass [a, b] directly. */
function orderPair(nodes: string[]): [string, string] {
  if (nodes.length === 1 && nodes[0].includes('|')) {
    const parts = nodes[0].split('|');
    if (parts.length !== 2) {
      throw new InsightError('invalid_input', `A monotonic node id must be "a|b" (got ${parts.length} segments in "${nodes[0]}").`);
    }
    return [parts[0], parts[1]];
  }
  if (nodes.length === 2) return [nodes[0], nodes[1]];
  throw new InsightError('invalid_input', 'A monotonic violation needs exactly two token ids (nodes: [a, b] or ["a|b"]).');
}

function findOrderOp(descriptors: ConstraintDescriptor[], kind: 'order' | 'lightness', a: string, b: string): '<=' | '>=' | undefined {
  for (const d of descriptors) {
    if (d.kind !== kind) continue;
    for (const [x, op, y] of d.orders) {
      if (x === a && y === b) return op;
    }
  }
  return undefined;
}

// mirrors the px-default parser in core/constraints/threshold.ts
function parseThresholdPx(v: string): number | null {
  const m = v.trim().match(/^([0-9.]+)\s*(px|rem)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return (m[2] || 'px').toLowerCase() === 'rem' ? n * 16 : n;
}

function round2(n: number): number {
  return Number(n.toFixed(2));
}

function toHex(c: RGBA): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`;
}

/** Effective (alpha-composited) contrast for a fg/bg/backdrop triplet, or null
 *  when any color is unparseable. Same pipeline as WcagContrastPlugin. */
function effectiveContrast(fgVal: string, bgVal: string, backdropVal: string): { ratio: number; effFg: RGBA; effBg: RGBA } | null {
  const fg = parseCssColor(fgVal);
  const bg = parseCssColor(bgVal);
  const backdrop = parseCssColor(backdropVal || '#ffffff');
  if (!fg || !bg || !backdrop) return null;
  const effBg = bg.a < 1 ? compositeOver(bg, backdrop) : bg;
  const effFg = fg.a < 1 ? compositeOver(fg, effBg) : fg;
  return { ratio: contrastRatio(relativeLuminance(effFg), relativeLuminance(effBg)), effFg, effBg };
}

// ---------------------------------------------------------------------------
// explain
// ---------------------------------------------------------------------------

export interface InsightRequest {
  ruleId: string;
  nodes: string[];
  context?: Record<string, unknown>;
  getValue: ValueResolver;
  descriptors: ConstraintDescriptor[];
}

export interface ExplainResult {
  ok: true;
  ruleId: string;
  kind: RuleKind;
  nodes: string[];
  facts: Record<string, unknown>;
  explanation: string;
}

export function explain(req: InsightRequest): ExplainResult {
  const kind = classifyRule(req.ruleId);
  const { getValue, descriptors, context } = req;
  const whereSuffix = (where?: string) => (where ? ` (${where})` : '');

  if (kind === 'wcag') {
    if (req.nodes.length < 2) {
      throw new InsightError('invalid_input', 'A WCAG violation needs nodes: [foreground, background].');
    }
    const [fg, bg] = req.nodes;
    const rule = descriptors.find((d) => d.kind === 'wcag' && d.foreground === fg && d.background === bg) as Extract<ConstraintDescriptor, { kind: 'wcag' }> | undefined;
    const required = rule?.minRatio ?? (typeof context?.required === 'number' ? (context.required as number) : undefined);
    if (required === undefined) {
      throw new InsightError('invalid_input', `No active WCAG rule found for ${fg} on ${bg}, and no required ratio in context.`);
    }
    const fgVal = getValue(fg);
    const bgVal = getValue(bg);
    const backdropVal = getValue(rule?.backdrop ?? '#ffffff');
    const computed = effectiveContrast(fgVal, bgVal, backdropVal);
    const where = rule?.where;
    const actual = computed ? round2(computed.ratio) : null;
    const facts = {
      foreground: fg,
      background: bg,
      foregroundValue: fgVal,
      backgroundValue: bgVal,
      backdrop: rule?.backdrop ?? '#ffffff',
      requiredRatio: required,
      actualRatio: actual,
      parseable: computed !== null,
      ...(where ? { where } : {}),
    };
    const explanation = computed
      ? `Contrast of ${fg} (${fgVal}) on ${bg} (${bgVal}) is ${actual}:1, ${computed.ratio < required ? 'below' : 'at or above'} the required ${required}:1${whereSuffix(where)}.`
      : `Could not compute contrast for ${fg} (${fgVal}) on ${bg} (${bgVal}) — one or more colors are unparseable.`;
    return { ok: true, ruleId: req.ruleId, kind, nodes: [fg, bg], facts, explanation };
  }

  if (kind === 'threshold') {
    const id = req.nodes[0];
    if (!id) throw new InsightError('invalid_input', 'A threshold violation needs nodes: [tokenId].');
    const rule = descriptors.find((d) => d.kind === 'threshold' && d.tokenId === id) as Extract<ConstraintDescriptor, { kind: 'threshold' }> | undefined;
    const op = rule?.op ?? (context?.op as '<=' | '>=' | undefined);
    const valuePx = rule?.valuePx ?? (typeof context?.threshold === 'number' ? (context.threshold as number) : undefined);
    if (op === undefined || valuePx === undefined) {
      throw new InsightError('invalid_input', `No active threshold rule found for ${id}, and no op/threshold in context.`);
    }
    const val = getValue(id);
    const actualPx = parseThresholdPx(val);
    const satisfied = actualPx === null ? null : op === '>=' ? actualPx >= valuePx : actualPx <= valuePx;
    const where = rule?.where;
    const facts = { tokenId: id, value: val, actualPx, op, requiredPx: valuePx, satisfied, ...(where ? { where } : {}) };
    const explanation =
      actualPx === null
        ? `${id} is "${val}", which is not a parseable px/rem size; it must be ${op} ${valuePx}px${whereSuffix(where)}.`
        : `${id} is ${actualPx}px, but must be ${op} ${valuePx}px${whereSuffix(where)}.`;
    return { ok: true, ruleId: req.ruleId, kind, nodes: [id], facts, explanation };
  }

  // monotonic (size) or monotonic-lightness (relative luminance)
  const [a, b] = orderPair(req.nodes);
  const isLightness = kind === 'monotonic-lightness';
  const op = findOrderOp(descriptors, isLightness ? 'lightness' : 'order', a, b);
  if (op === undefined) {
    throw new InsightError('invalid_input', `No active ${isLightness ? 'lightness' : 'order'} constraint found for ${a} ${'<=/>='} ${b}.`);
  }
  const aVal = getValue(a);
  const bVal = getValue(b);
  const parse = isLightness ? parseLightness : parseSize;
  const na = parse(aVal);
  const nb = parse(bVal);
  const unit = isLightness ? 'luminance' : 'px';
  // Actually compare — explain accepts a loose {ruleId, nodes} pair, so the order
  // may hold; don't unconditionally claim a violation (TASK-032).
  const comparable = na !== null && nb !== null;
  const satisfied = comparable ? (op === '>=' ? na >= nb : na <= nb) : null;
  const facts = {
    left: a,
    right: b,
    leftValue: aVal,
    rightValue: bVal,
    op,
    unit,
    leftMeasure: na,
    rightMeasure: nb,
    satisfied,
  };
  const explanation = !comparable
    ? `${a} (${aVal}) ${op} ${b} (${bVal}) can't be evaluated — one or both values aren't parseable as ${unit}.`
    : satisfied
      ? `${a} (${aVal}) ${op} ${b} (${bVal}) by ${unit} — the order holds.`
      : `${a} (${aVal}) must be ${op} ${b} (${bVal}) by ${unit}, but the order is violated — the scale is out of order.`;
  return { ok: true, ruleId: req.ruleId, kind, nodes: [a, b], facts, explanation };
}

// ---------------------------------------------------------------------------
// suggest-fix
// ---------------------------------------------------------------------------

export interface Suggestion {
  tokenId: string;
  role: string;
  currentValue: string;
  suggestedValue: string;
  resultingValue: number;
  satisfies: string;
  why: string;
}

export interface SuggestResult {
  ok: true;
  ruleId: string;
  kind: RuleKind;
  nodes: string[];
  suggestions: Suggestion[];
  note?: string;
}

export interface SuggestRequest extends InsightRequest {
  target?: 'foreground' | 'background';
}

/**
 * Find the smallest change to `color` (toward white or black) whose contrast
 * against a fixed luminance reaches `min`. Returns an opaque, integer-channel
 * RGBA already verified to clear `min`, or null when neither endpoint reaches it.
 *
 * We scan in fine steps rather than binary-search because contrast is NOT
 * monotonic along the blend when `otherLum` falls between the start and the
 * target (it dips to 1:1 as the colors cross). Scanning from the original
 * outward returns the first — i.e. minimal — integer color that genuinely
 * clears the ratio; we keep the closer of the two directions.
 */
function pushToContrast(color: RGBA, otherLum: number, min: number): RGBA | null {
  const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
  const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
  const STEPS = 256;
  const blendSnap = (target: RGBA, t: number): RGBA => ({
    r: Math.round(color.r + (target.r - color.r) * t),
    g: Math.round(color.g + (target.g - color.g) * t),
    b: Math.round(color.b + (target.b - color.b) * t),
    a: 1,
  });
  const ratioAt = (cand: RGBA) => contrastRatio(relativeLuminance(cand), otherLum);
  const dist = (c: RGBA) => (c.r - color.r) ** 2 + (c.g - color.g) ** 2 + (c.b - color.b) ** 2;

  let best: RGBA | null = null;
  let bestDist = Infinity;
  for (const target of [white, black]) {
    for (let i = 1; i <= STEPS; i++) {
      const cand = blendSnap(target, i / STEPS);
      if (ratioAt(cand) >= min) {
        const d = dist(cand);
        if (d < bestDist) {
          bestDist = d;
          best = cand;
        }
        break; // first satisfying step in a direction is that direction's minimal change
      }
    }
  }
  return best;
}

/**
 * Find the smallest change to an (opaque) background that clears `min` against
 * `fg`. Unlike a foreground tweak, changing the background also changes the
 * EFFECTIVE foreground when `fg` is semi-transparent (it composites over the new
 * background), so the ratio is recomputed through the full pipeline for every
 * candidate — never against a stale precomputed foreground. Returns a verified
 * opaque RGBA, or null when no candidate reaches `min`.
 */
function pushBackgroundToContrast(fg: RGBA, bgStart: RGBA, min: number): RGBA | null {
  const white: RGBA = { r: 255, g: 255, b: 255, a: 1 };
  const black: RGBA = { r: 0, g: 0, b: 0, a: 1 };
  const STEPS = 256;
  const blendSnap = (target: RGBA, t: number): RGBA => ({
    r: Math.round(bgStart.r + (target.r - bgStart.r) * t),
    g: Math.round(bgStart.g + (target.g - bgStart.g) * t),
    b: Math.round(bgStart.b + (target.b - bgStart.b) * t),
    a: 1,
  });
  const trueRatio = (bgCand: RGBA): number => {
    const effFg = fg.a < 1 ? compositeOver(fg, bgCand) : fg;
    return contrastRatio(relativeLuminance(effFg), relativeLuminance(bgCand));
  };
  const dist = (c: RGBA) => (c.r - bgStart.r) ** 2 + (c.g - bgStart.g) ** 2 + (c.b - bgStart.b) ** 2;

  let best: RGBA | null = null;
  let bestDist = Infinity;
  for (const target of [white, black]) {
    for (let i = 1; i <= STEPS; i++) {
      const cand = blendSnap(target, i / STEPS);
      if (trueRatio(cand) >= min) {
        const d = dist(cand);
        if (d < bestDist) {
          bestDist = d;
          best = cand;
        }
        break;
      }
    }
  }
  return best;
}

export function suggestFix(req: SuggestRequest): SuggestResult {
  const kind = classifyRule(req.ruleId);
  const { getValue, descriptors, context } = req;

  if (kind === 'wcag') {
    if (req.nodes.length < 2) {
      throw new InsightError('invalid_input', 'A WCAG violation needs nodes: [foreground, background].');
    }
    const [fg, bg] = req.nodes;
    const rule = descriptors.find((d) => d.kind === 'wcag' && d.foreground === fg && d.background === bg) as Extract<ConstraintDescriptor, { kind: 'wcag' }> | undefined;
    const min = rule?.minRatio ?? (typeof context?.required === 'number' ? (context.required as number) : undefined);
    if (min === undefined) {
      throw new InsightError('invalid_input', `No active WCAG rule found for ${fg} on ${bg}, and no required ratio in context.`);
    }
    const fgVal = getValue(fg);
    const bgVal = getValue(bg);
    const backdropVal = getValue(rule?.backdrop ?? '#ffffff');
    const fgColor = parseCssColor(fgVal);
    const bgColor = parseCssColor(bgVal);
    const backdrop = parseCssColor(backdropVal || '#ffffff');
    if (!fgColor || !bgColor || !backdrop) {
      throw new InsightError('invalid_input', `Cannot suggest a fix: unparseable color(s) — foreground "${fgVal}", background "${bgVal}".`);
    }
    const effBg = bgColor.a < 1 ? compositeOver(bgColor, backdrop) : bgColor;
    const effFg = fgColor.a < 1 ? compositeOver(fgColor, effBg) : fgColor;
    const sides: Array<'foreground' | 'background'> = req.target ? [req.target] : ['foreground', 'background'];
    const suggestions: Suggestion[] = [];

    for (const side of sides) {
      if (side === 'foreground') {
        const adj = pushToContrast(effFg, relativeLuminance(effBg), min);
        if (adj) {
          const ratio = contrastRatio(relativeLuminance(adj), relativeLuminance(effBg));
          if (ratio >= min) {
            suggestions.push({
              tokenId: fg,
              role: 'foreground',
              currentValue: fgVal,
              suggestedValue: toHex(adj),
              resultingValue: round2(ratio),
              satisfies: `wcag-contrast >= ${min}:1`,
              why: 'Foreground lightness adjusted (opaque) until contrast clears the ratio; verified with WCAG contrast math.',
            });
          }
        }
      } else {
        // Recompute the effective foreground over the candidate background: when
        // the foreground has alpha, changing the background changes the composited
        // foreground too, so a fixed precomputed effFg would over-report contrast.
        const adj = pushBackgroundToContrast(fgColor, effBg, min);
        if (adj) {
          const effFgOverAdj = fgColor.a < 1 ? compositeOver(fgColor, adj) : fgColor;
          const ratio = contrastRatio(relativeLuminance(effFgOverAdj), relativeLuminance(adj));
          if (ratio >= min) {
            suggestions.push({
              tokenId: bg,
              role: 'background',
              currentValue: bgVal,
              suggestedValue: toHex(adj),
              resultingValue: round2(ratio),
              satisfies: `wcag-contrast >= ${min}:1`,
              why: 'Background lightness adjusted (opaque) until contrast clears the ratio; verified against the recomposited foreground.',
            });
          }
        }
      }
    }

    const note = suggestions.length === 0
      ? `No sRGB ${req.target ?? 'foreground or background'} color reaches ${min}:1 against the other color; widen the lightness separation or change the backdrop.`
      : undefined;
    return { ok: true, ruleId: req.ruleId, kind, nodes: [fg, bg], suggestions, ...(note ? { note } : {}) };
  }

  if (kind === 'threshold') {
    const id = req.nodes[0];
    if (!id) throw new InsightError('invalid_input', 'A threshold violation needs nodes: [tokenId].');
    const rule = descriptors.find((d) => d.kind === 'threshold' && d.tokenId === id) as Extract<ConstraintDescriptor, { kind: 'threshold' }> | undefined;
    const op = rule?.op ?? (context?.op as '<=' | '>=' | undefined);
    const valuePx = rule?.valuePx ?? (typeof context?.threshold === 'number' ? (context.threshold as number) : undefined);
    if (op === undefined || valuePx === undefined) {
      throw new InsightError('invalid_input', `No active threshold rule found for ${id}, and no op/threshold in context.`);
    }
    const current = getValue(id);
    const suggestion: Suggestion = {
      tokenId: id,
      role: op === '>=' ? 'raise-to-min' : 'lower-to-max',
      currentValue: current,
      suggestedValue: `${valuePx}px`,
      resultingValue: valuePx,
      satisfies: `${id} ${op} ${valuePx}px`,
      why: op === '>=' ? `Set to the ${valuePx}px minimum (the boundary that satisfies ${op}).` : `Set to the ${valuePx}px maximum (the boundary that satisfies ${op}).`,
    };
    return { ok: true, ruleId: req.ruleId, kind, nodes: [id], suggestions: [suggestion] };
  }

  if (kind === 'monotonic-lightness') {
    throw new InsightError('unsupported_rule', 'suggest-fix does not synthesize colors for lightness ordering; adjust the out-of-order token\'s lightness manually (use explain to see the luminance gap).');
  }

  // monotonic (size): a op b violated → raise the low side or lower the high side
  // to the boundary. Both candidates satisfy the order at equality.
  const [a, b] = orderPair(req.nodes);
  const op = findOrderOp(descriptors, 'order', a, b);
  if (op === undefined) {
    throw new InsightError('invalid_input', `No active order constraint found for ${a} .. ${b}.`);
  }
  const aVal = getValue(a);
  const bVal = getValue(b);
  const na = parseSize(aVal);
  const nb = parseSize(bVal);
  if (na === null || nb === null) {
    throw new InsightError('invalid_input', `Cannot compute a numeric boundary: ${a}="${aVal}" or ${b}="${bVal}" is not a parseable size.`);
  }
  // The order holds at equality regardless of `op`, so the boundary is the same
  // either way: move `a` to b's value, or move `b` to a's value. (The earlier
  // op-conditional made the `<=` case suggest each token's own value — a no-op.)
  // Role reflects the real direction of the move for the reported value.
  const aTarget = round2(nb);
  const bTarget = round2(na);
  const direction = (from: number, to: number): string => (to > from ? 'raise' : to < from ? 'lower' : 'keep');
  const suggestions: Suggestion[] = [
    {
      tokenId: a,
      role: direction(na, aTarget),
      currentValue: aVal,
      suggestedValue: `${aTarget}px`,
      resultingValue: aTarget,
      satisfies: `${a} ${op} ${b}`,
      why: `Set ${a} to ${b}'s value (${aTarget}px) so the order holds at equality.`,
    },
    {
      tokenId: b,
      role: direction(nb, bTarget),
      currentValue: bVal,
      suggestedValue: `${bTarget}px`,
      resultingValue: bTarget,
      satisfies: `${a} ${op} ${b}`,
      why: `Set ${b} to ${a}'s value (${bTarget}px) so the order holds at equality.`,
    },
  ];
  return { ok: true, ruleId: req.ruleId, kind, nodes: [a, b], suggestions };
}
