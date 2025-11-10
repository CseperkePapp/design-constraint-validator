// src/core/resolver.ts — Pure Computation: VT + DT → EffectiveConfig
// NO GUARDS. DCV validates later. Deterministic always.

import { VT, DT, EffectiveConfig, ColorOKLCH } from '../types';
import { hashJSON } from './hash';  // Assume you have this

export function computeEffectiveConfig(vt: VT, dt: DT): EffectiveConfig {
  const resolved: Record<string, string> = {};

  // 1. Resolve Colors (Tone Axis)
  const colors = resolveColors(vt, dt);
  Object.entries(colors).forEach(([name, oklch]) => {
    resolved[`--color-${name}`] = `oklch(${oklch.L} ${oklch.C} ${oklch.H})`;
  });

  // 2. Resolve Typography (Size Axis)
  const typography = resolveTypography(vt, dt);
  Object.entries(typography).forEach(([key, value]) => {
    resolved[key] = value;
  });

  // 3. Resolve Spacing (Density Axis)
  const spacing = resolveSpacing(vt, dt);
  Object.entries(spacing).forEach(([key, value]) => {
    resolved[key] = value;
  });

  // 4. Resolve Corners (Shape Axis)
  const corners = resolveCorners(vt, dt);
  Object.entries(corners).forEach(([key, value]) => {
    resolved[key] = value;
  });

  // 5. Resolve Borders (Shape Axis)
  const borders = resolveBorders(vt, dt);
  Object.entries(borders).forEach(([key, value]) => {
    resolved[key] = value;
  });

  // 6. Resolve Semantics (Mappings)
  const semantics = resolveSemantics(vt, dt, resolved);
  Object.entries(semantics).forEach(([key, value]) => {
    resolved[key] = value;
  });

  // 7. Fonts
  if (vt.fonts?.body) resolved['--font-family-body'] = vt.fonts.body;
  if (vt.fonts?.heading) resolved['--font-family-heading'] = vt.fonts.heading;

  // 8. Motion (if present)
  if (vt.motion && dt.motion) {
    resolved['--motion-duration-base'] = `${vt.motion.baseDuration * dt.motion.durationScale}ms`;
    resolved['--motion-speed-scale'] = `${dt.motion.speedScale}`;
  }

  // 9. Hash: Source of Truth
  const hash = hashJSON({ vt, dt, schemaVersions: { vt: vt.schemaVersion, dt: dt.schemaVersion } });

  return {
    resolved,
    hash: `v4:${hash.slice(0, 16)}`,
    source: { vt: 'brand-v1', dt: dt.name || 'default' }
  };
}

// Color Resolution (Derivations in DT)
function resolveColors(vt: VT, dt: DT): Record<string, ColorOKLCH> {
  const colors = { ...vt.colors };

  for (const [name, rule] of Object.entries(dt.colors || {})) {
    if (rule.derivation?.mode === 'derived' && rule.derivation.deriveFrom) {
      const base = colors[rule.derivation.deriveFrom];
      if (base) {
        colors[name as keyof VT['colors']] = {
          L: base.L + (rule.derivation.offset?.L || 0),
          C: Math.max(0, base.C + (rule.derivation.offset?.C || 0)),
          H: (base.H + (rule.derivation.offset?.H || 0) + 360) % 360
        };
      }
    }
  }

  return colors;
}

// Typography Resolution
function resolveTypography(vt: VT, dt: DT): Record<string, string> {
  const base = vt.typography.baseFontSize;
  const ratio = vt.typography.textScaleRatio;
  const typo = dt.typography || { h1Exponent: 3, h2Exponent: 2, h3Exponent: 1, h4Exponent: 0, smallExponent: -1, bodyLineHeight: 1.5 };

  return {
    '--font-size-h1': `${base * Math.pow(ratio, typo.h1Exponent)}px`,
    '--font-size-h2': `${base * Math.pow(ratio, typo.h2Exponent)}px`,
    '--font-size-h3': `${base * Math.pow(ratio, typo.h3Exponent)}px`,
    '--font-size-h4': `${base * Math.pow(ratio, typo.h4Exponent)}px`,
    '--font-size-small': `${base * Math.pow(ratio, typo.smallExponent)}px`,
    '--font-size-body': `${base}px`,
    '--line-height-body': `${typo.bodyLineHeight}`
  };
}

// Spacing Resolution (H/V Axes)
function resolveSpacing(vt: VT, dt: DT): Record<string, string> {
  const base = vt.spacing.baseSpacing;
  const scale = vt.spacing.spacingScale;
  const axes = dt.spacing?.axes || { horizontal: 1.0, vertical: 1.0 };
  const exponents = dt.spacing || { xsExponent: -2, smExponent: -1, mdExponent: 0, lgExponent: 1, xlExponent: 2 };

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  const spacing: Record<string, string> = {};

  sizes.forEach(size => {
    const exp = exponents[`${size}Exponent` as keyof typeof exponents];
    const value = base * Math.pow(scale, exp);
    spacing[`--size-spacing-${size}-horizontal`] = `${value * axes.horizontal}px`;
    spacing[`--size-spacing-${size}-vertical`] = `${value * axes.vertical}px`;
    // Legacy alias
    spacing[`--size-spacing-${size}`] = spacing[`--size-spacing-${size}-vertical`];
  });

  return spacing;
}

// Corners Resolution
function resolveCorners(vt: VT, dt: DT): Record<string, string> {
  const base = vt.corners.baseRadius;
  const scale = 1.2;  // Fixed or from VT?
  const corners = dt.corners || { xsExponent: -1, smExponent: 0, mdExponent: 1, lgExponent: 2, xlExponent: 3, nestedOffset: -0.5 };

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  const resolved: Record<string, string> = {};

  sizes.forEach(size => {
    const exp = corners[`${size}Exponent` as keyof typeof corners];
    resolved[`--corner-radius-${size}`] = `${base * Math.pow(scale, exp)}px`;
  });

  if (corners.nestedOffset) {
    resolved['--corner-nested-offset'] = `${corners.nestedOffset}px`;
  }

  return resolved;
}

// Borders Resolution
function resolveBorders(vt: VT, dt: DT): Record<string, string> {
  const base = vt.borders.baseWidth;
  const borders = dt.borders || { panelScale: 1.0, buttonScale: 1.0, inputScale: 1.0, cardScale: 1.25, dividerScale: 0.5 };

  return {
    '--border-width-panel': `${base * borders.panelScale}px`,
    '--border-width-button': `${base * borders.buttonScale}px`,
    '--border-width-input': `${base * borders.inputScale}px`,
    '--border-width-card': `${base * borders.cardScale}px`,
    '--border-width-divider': `${base * borders.dividerScale}px`
    // Add multipliers/shifts as needed
  };
}

// Semantics Resolution (Mappings)
function resolveSemantics(vt: VT, dt: DT, resolved: Record<string, string>): Record<string, string> {
  const semantics = dt.semantics || { h1Color: 'primary', buttonPadding: 'md' };

  return {
    [`--color-h1`]: resolved[`--color-${semantics.h1Color}`],
    [`--spacing-button-padding`]: resolved[`--size-spacing-${semantics.buttonPadding}-horizontal`],
    [`--corner-radius-card`]: resolved[`--corner-radius-${semantics.cardRadius || 'lg'}`]
  };
}
