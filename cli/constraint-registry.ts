/**
 * Centralized constraint discovery and loading.
 *
 * This module provides a single source of truth for determining which constraints
 * are active for a given validation run. It replaces the scattered constraint-loading
 * logic previously split across engine-helpers.ts and constraints-loader.ts.
 *
 * Design principles:
 * - Constraints are discovered from config and filesystem in ONE place
 * - Core modules receive in-memory data (no filesystem access)
 * - All entry points (validate, set, graph) use this registry for consistency
 */

import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import type { Engine, ConstraintIssue, ConstraintPlugin } from '../core/engine.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';
import { MonotonicPlugin, parseSize as parseSizePx } from '../core/constraints/monotonic.js';
import { MonotonicLightness } from '../core/constraints/monotonic-lightness.js';
import { WcagContrastPlugin } from '../core/constraints/wcag.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
import { CrossAxisPlugin } from '../core/constraints/cross-axis.js';
import { loadCrossAxisRulesDetailed, referencedIdsForFile } from './cross-axis-loader.js';

/**
 * A plugin that emits a fixed set of pre-computed issues unconditionally (it
 * ignores the candidate set). Used to surface cross-axis loader notices —
 * present-but-unusable files and skipped invalid rules (TASK-037) — through the
 * normal issue channel so they appear as warnings instead of vanishing.
 */
function noticePlugin(notices: ConstraintIssue[]): ConstraintPlugin {
  return { id: 'cross-axis-notices', evaluate: () => notices };
}

// ============================================================================
// Types
// ============================================================================

export type OrderRule = [string, '<=' | '>=', string];

export type WcagRule = {
  fg: string;
  bg: string;
  min: number;
  where: string;
  backdrop?: string;
};

export type ThresholdRule = {
  id: string;
  op: '<=' | '>=';
  valuePx: number;
  where?: string;
  level?: 'error' | 'warn';
};

/**
 * Represents a constraint source discovered from config or filesystem.
 */
export type ConstraintSource =
  | { type: 'builtin-wcag'; enabled: boolean }
  | { type: 'builtin-threshold'; enabled: boolean }
  | { type: 'config-wcag'; rules: WcagRule[] }
  | { type: 'order-file'; axis: string; orders: OrderRule[]; path: string }
  | { type: 'lightness-file'; orders: OrderRule[]; path: string }
  | { type: 'cross-axis-file'; path: string; bp?: Breakpoint }
  | { type: 'custom-threshold'; rules: ThresholdRule[] };

export type DiscoveryOptions = {
  config: DcvConfig;
  basePath?: string;
  bp?: Breakpoint;
  constraintsDir?: string;
};

export type AttachOptions = {
  knownIds: Set<string>;
  crossAxisDebug?: boolean;
};

// Built-in default constraint rules. Shared by attachConstraints (to register
// plugins) and collectReferencedIds (to compute coverage) so the two never drift.
export const DEFAULT_WCAG_PAIRS: WcagRule[] = [
  { fg: 'color.role.text.default', bg: 'color.role.bg.surface', min: 4.5, where: 'Body text on surface' },
  { fg: 'color.role.accent.default', bg: 'color.role.bg.surface', min: 3.0, where: 'Accent on surface' },
  { fg: 'color.role.focus.ring', bg: 'color.role.bg.surface', min: 3.0, where: 'Focus ring on surface', backdrop: '#ffffff' },
];

export const DEFAULT_THRESHOLDS: ThresholdRule[] = [
  { id: 'control.size.min', op: '>=', valuePx: 44, where: 'Touch target (WCAG / Apple HIG)' },
];

// ============================================================================
// Discovery
// ============================================================================

/**
 * Discover all constraint sources for a given configuration and breakpoint.
 *
 * This function scans the filesystem and config to determine which constraints
 * should be active, but does not load or attach them yet.
 *
 * @param opts Discovery options (config, basePath, breakpoint)
 * @returns Array of constraint sources
 */
export function discoverConstraints(opts: DiscoveryOptions): ConstraintSource[] {
  const { config, basePath = '.', bp, constraintsDir = 'themes' } = opts;
  const sources: ConstraintSource[] = [];
  const constraintsCfg = config.constraints ?? {};
  const constraintsRoot = isAbsolute(constraintsDir) ? constraintsDir : join(basePath, constraintsDir);

  // 1. Built-in WCAG defaults
  const enableBuiltInWcag =
    constraintsCfg.enableBuiltInWcagDefaults === undefined ? true : !!constraintsCfg.enableBuiltInWcagDefaults;

  if (enableBuiltInWcag) {
    sources.push({ type: 'builtin-wcag', enabled: true });
  }

  // 2. Built-in threshold (44px touch target)
  const enableBuiltInThreshold =
    constraintsCfg.enableBuiltInThreshold === undefined ? true : !!constraintsCfg.enableBuiltInThreshold;

  if (enableBuiltInThreshold) {
    sources.push({ type: 'builtin-threshold', enabled: true });
  }

  // 3. Config-defined WCAG rules
  if (constraintsCfg.wcag && Array.isArray(constraintsCfg.wcag) && constraintsCfg.wcag.length > 0) {
    const rules: WcagRule[] = constraintsCfg.wcag.map((r: any) => ({
      fg: r.foreground,
      bg: r.background,
      min: r.ratio || 4.5,
      where: r.description || 'Unknown',
      backdrop: r.backdrop,
    }));
    sources.push({ type: 'config-wcag', rules });
  }

  // 4. Config-defined threshold rules
  if (constraintsCfg.thresholds && Array.isArray(constraintsCfg.thresholds) && constraintsCfg.thresholds.length > 0) {
    const rules: ThresholdRule[] = constraintsCfg.thresholds.map((r: any) => ({
      id: r.id,
      op: r.op,
      valuePx: r.valuePx,
      where: r.where,
      // Preserve configured severity (TASK-037): the core plugin honors `level`,
      // but dropping it here silently promoted a `warn` threshold to an error.
      level: r.level,
    }));
    sources.push({ type: 'custom-threshold', rules });
  }

  // A breakpoint uses its own `<axis>.<bp>.order.json` when present, but MUST fall
  // back to the global `<axis>.order.json` otherwise — without this, any axis
  // lacking a per-bp file (e.g. spacing) contributed ZERO constraints under
  // --breakpoint/--all-breakpoints, a silent false-pass (TASK-034).
  const orderPathFor = (base: string): string | undefined => {
    const bpPath = bp ? join(constraintsRoot, `${base}.${bp}.order.json`) : undefined;
    if (bpPath && existsSync(bpPath)) return bpPath;
    const globalPath = join(constraintsRoot, `${base}.order.json`);
    return existsSync(globalPath) ? globalPath : undefined;
  };

  // 5. Order files (monotonic constraints)
  const axes = ['typography', 'spacing', 'layout'] as const;
  for (const axis of axes) {
    const orderPath = orderPathFor(axis);
    if (orderPath) {
      try {
        const data = JSON.parse(readFileSync(orderPath, 'utf8'));
        const orders: OrderRule[] = data.order || [];
        if (orders.length > 0) {
          sources.push({ type: 'order-file', axis, orders, path: orderPath });
        }
      } catch {
        // Silently skip malformed order files (consistent with old behavior)
      }
    }
  }

  // 6. Color lightness order files (same bp → global fallback)
  const colorOrderPath = orderPathFor('color');
  if (colorOrderPath) {
    try {
      const data = JSON.parse(readFileSync(colorOrderPath, 'utf8'));
      const orders: OrderRule[] = data.order || [];
      if (orders.length > 0) {
        sources.push({ type: 'lightness-file', orders, path: colorOrderPath });
      }
    } catch {
      // Silently skip malformed color order files
    }
  }

  // 7. Cross-axis rules (global)
  const crossAxisPath = join(constraintsRoot, 'cross-axis.rules.json');
  if (existsSync(crossAxisPath)) {
    sources.push({ type: 'cross-axis-file', path: crossAxisPath });
  }

  // 8. Cross-axis rules (breakpoint-specific)
  if (bp) {
    const crossAxisBpPath = join(constraintsRoot, `cross-axis.${bp}.rules.json`);
    if (existsSync(crossAxisBpPath)) {
      sources.push({ type: 'cross-axis-file', path: crossAxisBpPath, bp });
    }
  }

  return sources;
}

// ============================================================================
// Attachment
// ============================================================================

/**
 * Attach constraint plugins to an engine based on discovered sources.
 *
 * This function takes the output of `discoverConstraints()` and registers
 * the appropriate plugins on the engine.
 *
 * @param engine Engine to attach plugins to
 * @param sources Constraint sources (from discoverConstraints)
 * @param opts Attachment options (knownIds, debug flags)
 */
export function attachConstraints(engine: Engine, sources: ConstraintSource[], opts: AttachOptions): void {
  const { knownIds, crossAxisDebug = false } = opts;

  for (const source of sources) {
    try {
      switch (source.type) {
        case 'builtin-wcag': {
          if (source.enabled) {
            engine.use(WcagContrastPlugin(DEFAULT_WCAG_PAIRS));
          }
          break;
        }

        case 'builtin-threshold': {
          if (source.enabled) {
            engine.use(ThresholdPlugin(DEFAULT_THRESHOLDS, 'threshold'));
          }
          break;
        }

        case 'config-wcag': {
          engine.use(WcagContrastPlugin(source.rules));
          break;
        }

        case 'custom-threshold': {
          engine.use(ThresholdPlugin(source.rules, 'custom-threshold'));
          break;
        }

        case 'order-file': {
          const pluginId = `monotonic-${source.axis}`;
          engine.use(MonotonicPlugin(source.orders, parseSizePx, pluginId));
          break;
        }

        case 'lightness-file': {
          engine.use(MonotonicLightness(source.orders));
          break;
        }

        case 'cross-axis-file': {
          // Phase 3B: Load rules from filesystem in CLI layer, pass to core plugin.
          // Detailed load also surfaces notices (unusable file / skipped invalid
          // rules) as warnings so they are never silently dropped (TASK-037).
          const { rules, notices } = loadCrossAxisRulesDetailed(source.path, {
            bp: source.bp,
            knownIds,
            debug: crossAxisDebug,
          });
          engine.use(CrossAxisPlugin(rules, source.bp));
          if (notices.length) engine.use(noticePlugin(notices));
          break;
        }
      }
    } catch {
      // Silently skip failed constraint attachments (consistent with old behavior)
      // In the future, we may want to surface these as warnings
    }
  }
}

// ============================================================================
// Convenience
// ============================================================================

/**
 * Discover and attach constraints in one call.
 *
 * This is the main entry point for most use cases.
 *
 * @param engine Engine to attach plugins to
 * @param discoveryOpts Discovery options
 * @param attachOpts Attachment options
 */
export function setupConstraints(
  engine: Engine,
  discoveryOpts: DiscoveryOptions,
  attachOpts: AttachOptions,
): ConstraintSource[] {
  const sources = discoverConstraints(discoveryOpts);
  attachConstraints(engine, sources, attachOpts);
  return sources;
}

/**
 * Collect the token ids referenced by the active constraint sources, plus
 * whether that coverage is fully enumerable.
 *
 * Used to detect the silent-pass case: a token file that validates with zero
 * errors only because no active constraint references any of its tokens. Cross-
 * axis rule ids are not enumerated here, so when any cross-axis source is present
 * `coverageKnown` is false and callers must stay conservative (never claim
 * "nothing was checked" when they cannot be sure).
 */
export function collectReferencedIds(sources: ConstraintSource[]): { ids: Set<string>; coverageKnown: boolean } {
  const ids = new Set<string>();
  let coverageKnown = true;
  const addOrders = (orders: OrderRule[]) => {
    for (const [a, , b] of orders) {
      ids.add(a);
      ids.add(b);
    }
  };

  for (const source of sources) {
    switch (source.type) {
      case 'builtin-wcag':
        for (const p of DEFAULT_WCAG_PAIRS) {
          ids.add(p.fg);
          ids.add(p.bg);
        }
        break;
      case 'builtin-threshold':
        for (const t of DEFAULT_THRESHOLDS) ids.add(t.id);
        break;
      case 'config-wcag':
        for (const r of source.rules) {
          ids.add(r.fg);
          ids.add(r.bg);
        }
        break;
      case 'custom-threshold':
        for (const r of source.rules) ids.add(r.id);
        break;
      case 'order-file':
      case 'lightness-file':
        addOrders(source.orders);
        break;
      case 'cross-axis-file': {
        // TASK-031/037: enumerate referenced ids so coverage stays KNOWN, but
        // MIRROR attach exactly — same `source.bp` filter and same shape
        // validation. A rule that did not run (wrong breakpoint, or invalid)
        // must not make coverage look "matched" and suppress the no-match note.
        // An unusable file stays conservative (coverageKnown=false).
        const { ids: caIds, coverageKnown: known } = referencedIdsForFile(source.path, source.bp);
        if (!known) {
          coverageKnown = false;
          break;
        }
        for (const id of caIds) ids.add(id);
        break;
      }
    }
  }

  return { ids, coverageKnown };
}
