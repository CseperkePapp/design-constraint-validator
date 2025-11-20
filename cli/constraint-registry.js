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
import { join } from 'node:path';
import { MonotonicPlugin, parseSize as parseSizePx } from '../core/constraints/monotonic.js';
import { MonotonicLightness } from '../core/constraints/monotonic-lightness.js';
import { WcagContrastPlugin } from '../core/constraints/wcag.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
import { loadCrossAxisPlugin } from '../core/cross-axis-config.js';
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
export function discoverConstraints(opts) {
    const { config, basePath = '.', bp, constraintsDir = 'themes' } = opts;
    const sources = [];
    const constraintsCfg = config.constraints ?? {};
    // 1. Built-in WCAG defaults
    const enableBuiltInWcag = constraintsCfg.enableBuiltInWcagDefaults === undefined ? true : !!constraintsCfg.enableBuiltInWcagDefaults;
    if (enableBuiltInWcag) {
        sources.push({ type: 'builtin-wcag', enabled: true });
    }
    // 2. Built-in threshold (44px touch target)
    const enableBuiltInThreshold = constraintsCfg.enableBuiltInThreshold === undefined ? true : !!constraintsCfg.enableBuiltInThreshold;
    if (enableBuiltInThreshold) {
        sources.push({ type: 'builtin-threshold', enabled: true });
    }
    // 3. Config-defined WCAG rules
    if (constraintsCfg.wcag && Array.isArray(constraintsCfg.wcag) && constraintsCfg.wcag.length > 0) {
        const rules = constraintsCfg.wcag.map((r) => ({
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
        const rules = constraintsCfg.thresholds.map((r) => ({
            id: r.id,
            op: r.op,
            valuePx: r.valuePx,
            where: r.where,
        }));
        sources.push({ type: 'custom-threshold', rules });
    }
    // 5. Order files (monotonic constraints)
    const axes = ['typography', 'spacing', 'layout'];
    for (const axis of axes) {
        const suffix = bp ? `.${bp}` : '';
        const orderPath = join(basePath, constraintsDir, `${axis}${suffix}.order.json`);
        if (existsSync(orderPath)) {
            try {
                const data = JSON.parse(readFileSync(orderPath, 'utf8'));
                const orders = data.order || [];
                if (orders.length > 0) {
                    sources.push({ type: 'order-file', axis, orders, path: orderPath });
                }
            }
            catch {
                // Silently skip malformed order files (consistent with old behavior)
            }
        }
    }
    // 6. Color lightness order files
    const suffix = bp ? `.${bp}` : '';
    const colorOrderPath = join(basePath, constraintsDir, `color${suffix}.order.json`);
    if (existsSync(colorOrderPath)) {
        try {
            const data = JSON.parse(readFileSync(colorOrderPath, 'utf8'));
            const orders = data.order || [];
            if (orders.length > 0) {
                sources.push({ type: 'lightness-file', orders, path: colorOrderPath });
            }
        }
        catch {
            // Silently skip malformed color order files
        }
    }
    // 7. Cross-axis rules (global)
    const crossAxisPath = join(basePath, constraintsDir, 'cross-axis.rules.json');
    if (existsSync(crossAxisPath)) {
        sources.push({ type: 'cross-axis-file', path: crossAxisPath });
    }
    // 8. Cross-axis rules (breakpoint-specific)
    if (bp) {
        const crossAxisBpPath = join(basePath, constraintsDir, `cross-axis.${bp}.rules.json`);
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
export function attachConstraints(engine, sources, opts) {
    const { knownIds, crossAxisDebug = false } = opts;
    for (const source of sources) {
        try {
            switch (source.type) {
                case 'builtin-wcag': {
                    if (source.enabled) {
                        const defaultWcagPairs = [
                            {
                                fg: 'color.role.text.default',
                                bg: 'color.role.bg.surface',
                                min: 4.5,
                                where: 'Body text on surface',
                            },
                            {
                                fg: 'color.role.accent.default',
                                bg: 'color.role.bg.surface',
                                min: 3.0,
                                where: 'Accent on surface',
                            },
                            {
                                fg: 'color.role.focus.ring',
                                bg: 'color.role.bg.surface',
                                min: 3.0,
                                where: 'Focus ring on surface',
                                backdrop: '#ffffff',
                            },
                        ];
                        engine.use(WcagContrastPlugin(defaultWcagPairs));
                    }
                    break;
                }
                case 'builtin-threshold': {
                    if (source.enabled) {
                        const defaultThresholds = [
                            {
                                id: 'control.size.min',
                                op: '>=',
                                valuePx: 44,
                                where: 'Touch target (WCAG / Apple HIG)',
                            },
                        ];
                        engine.use(ThresholdPlugin(defaultThresholds, 'threshold'));
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
                    // Note: This still uses the old loadCrossAxisPlugin helper which reads from filesystem.
                    // In Phase 3B, we'll refactor this to parse rules here and pass them to CrossAxisPlugin.
                    engine.use(loadCrossAxisPlugin(source.path, source.bp, {
                        debug: crossAxisDebug,
                        knownIds,
                    }));
                    break;
                }
            }
        }
        catch (err) {
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
export function setupConstraints(engine, discoveryOpts, attachOpts) {
    const sources = discoverConstraints(discoveryOpts);
    attachConstraints(engine, sources, attachOpts);
    return sources;
}
