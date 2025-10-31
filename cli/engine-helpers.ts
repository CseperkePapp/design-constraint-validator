import { flattenTokens, type TokenNode, type FlatToken } from '../core/flatten.js';
import { Engine } from '../core/engine.js';
import { MonotonicPlugin, parseSize as parseSizePx } from '../core/constraints/monotonic.js';
import { MonotonicLightness } from '../core/constraints/monotonic-lightness.js';
import { WcagContrastPlugin } from '../core/constraints/wcag.js';
import { loadOrders as loadOrdersBP, loadTokensWithBreakpoint, type Breakpoint } from '../core/breakpoints.js';
import type { LarissaConfig } from './types.js';

export function createEngine(tokensRoot: TokenNode, config: LarissaConfig = {}): Engine {
  const { flat, edges } = flattenTokens(tokensRoot);
  const init: Record<string, string | number> = {};
  for (const [id, token] of Object.entries(flat)) init[id] = (token as FlatToken).value;
  const engine = new Engine(init, edges);
  function loadOrders(path: string) {
    try { return JSON.parse(require('node:fs').readFileSync(path, 'utf8')).order as [string, '<='|'>=', string][]; } catch { return []; }
  }
  const typOrders = loadOrders('themes/typography.order.json');
  const spacingOrders = loadOrders('themes/spacing.order.json');
  const layoutOrders = loadOrders('themes/layout.order.json');
  const colorOrders = loadOrders('themes/color.order.json');
  if (typOrders.length) engine.use(MonotonicPlugin(typOrders, parseSizePx, 'monotonic-typography'));
  if (spacingOrders.length) engine.use(MonotonicPlugin(spacingOrders, parseSizePx, 'monotonic-spacing'));
  if (layoutOrders.length) engine.use(MonotonicPlugin(layoutOrders, parseSizePx, 'monotonic-layout'));
  if (colorOrders.length) engine.use(MonotonicLightness(colorOrders));
  if (config.constraints?.wcag) {
    const wcagRules = config.constraints.wcag.map(r => ({ fg: r.foreground, bg: r.background, min: r.ratio || 4.5, where: r.description || 'Unknown' }));
    engine.use(WcagContrastPlugin(wcagRules));
  }
  const defaultWcagPairs = [
    { fg: 'color.role.text.default', bg: 'color.role.bg.surface', min: 4.5, where: 'Body text on surface' },
    { fg: 'color.role.accent.default', bg: 'color.role.bg.surface', min: 3.0, where: 'Accent on surface' },
    { fg: 'color.role.focus.ring', bg: 'color.role.bg.surface', min: 3.0, where: 'Focus ring on surface', backdrop: '#ffffff' }
  ];
  engine.use(WcagContrastPlugin(defaultWcagPairs));
  return engine;
}

export function createValidationEngine(tokensRoot: TokenNode, bp: Breakpoint | undefined, config: LarissaConfig): Engine {
  const { flat, edges } = flattenTokens(tokensRoot);
  const init: Record<string, string | number> = {};
  for (const t of Object.values(flat)) init[(t as FlatToken).id] = (t as FlatToken).value;
  const engine = new Engine(init, edges);
  const typ = loadOrdersBP('typography', bp);
  const spc = loadOrdersBP('spacing', bp);
  const lay = loadOrdersBP('layout', bp);
  const col = loadOrdersBP('color', bp);
  if (typ.length) engine.use(MonotonicPlugin(typ, parseSizePx, 'monotonic-typography'));
  if (spc.length) engine.use(MonotonicPlugin(spc, parseSizePx, 'monotonic-spacing'));
  if (lay.length) engine.use(MonotonicPlugin(lay, parseSizePx, 'monotonic-layout'));
  if (col.length) engine.use(MonotonicLightness(col));
  if (config.constraints?.wcag) {
    const wcagRules = config.constraints.wcag.map(rule => ({ fg: rule.foreground, bg: rule.background, min: rule.ratio || 4.5, where: rule.description || 'Unknown' }));
    engine.use(WcagContrastPlugin(wcagRules));
  }
  return engine;
}

export { loadTokensWithBreakpoint };
