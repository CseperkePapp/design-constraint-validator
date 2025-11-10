// ============================================================================
// DecisionThemes Studio - Type Definitions (Hybrid: Rich + Pure VT/DT)
// ============================================================================

import type { SliderRangeMap, SliderRangeConfig } from './core/sliderRanges';

/**
 * OKLCH Color representation
 * L: Lightness (0-1)
 * C: Chroma/Saturation (0-0.37 typically)
 * H: Hue (0-360 degrees)
 * opacity: Opacity (0-1), default 1
 */
export interface ColorOKLCH {
  L: number;
  C: number;
  H: number;
  opacity?: number;
}

// ============================================================================
// VT: Brand DNA — NUMERIC VALUES ONLY (No formulas, no derivations)
// ============================================================================

export interface VT {
  schemaVersion: 2;

  // Tone Axis: Named colors (DX)
  colors: {
    primary: ColorOKLCH;
    secondary: ColorOKLCH;
    accent: ColorOKLCH;
    neutral: ColorOKLCH;
    background: ColorOKLCH;
    // Extend as needed
  };

  // Size Axis
  typography: {
    baseFontSize: number;     // e.g., 16px
    textScaleRatio: number;   // e.g., 1.5
    bodyFont?: string;        // e.g., "Inter"
    headingFont?: string;     // e.g., "Lora"
  };

  // Density Axis
  spacing: {
    baseSpacing: number;      // e.g., 8px
    spacingScale: number;     // e.g., 1.618 (golden ratio)
  };

  // Shape Axis
  corners: {
    baseRadius: number;       // e.g., 4px
  };

  borders: {
    baseWidth: number;        // e.g., 1px
  };

  // Emphasis/Motion
  motion?: {
    baseDuration: number;     // e.g., 300ms
    baseEasing: string;       // e.g., "cubic-bezier(0.4, 0, 0.2, 1)"
  };

  // Global overrides (user prefs)
  sliderRanges?: Partial<SliderRangeMap>;
}

// ============================================================================
// DT: Brand Logic — FORMULAS & RELATIONSHIPS ONLY
// ============================================================================

export interface DTColorDerivation {
  mode: 'manual' | 'derived';
  deriveFrom?: keyof VT['colors'];  // Type-safe: 'primary' | 'secondary' | ...
  offset?: { L?: number; C?: number; H?: number };
}

export interface DT {
  schemaVersion: 1;
  name?: string;  // e.g., "Dark Brand"

  // Tone: Derivations (no values)
  colors?: {
    secondary?: { derivation: DTColorDerivation };
    accent?: { derivation: DTColorDerivation };
    neutral?: { derivation: DTColorDerivation };
    // etc.
  };

  // Size: Exponents
  typography?: {
    scaleAlgorithm?: string;  // e.g., "linear" | "exponential"
    progression: number;      // 0-5
    h1Exponent: number;
    h2Exponent: number;
    h3Exponent: number;
    h4Exponent: number;
    smallExponent: number;
    bodyLineHeight: number;   // e.g., 1.5
  };

  // Density: Exponents + Axes
  spacing?: {
    xsExponent: number;
    smExponent: number;
    mdExponent: number;
    lgExponent: number;
    xlExponent: number;
    axes?: {
      horizontal: number;     // e.g., 1.2
      vertical: number;       // e.g., 0.8
    };
  };

  // Shape: Exponents + Offsets
  corners?: {
    xsExponent: number;
    smExponent: number;
    mdExponent: number;
    lgExponent: number;
    xlExponent: number;
    pillExponent?: number;
    nestedOffset?: number;    // e.g., -0.5 for optical correction
  };

  borders?: {
    panelScale: number;
    buttonScale: number;
    inputScale: number;
    cardScale: number;
    dividerScale: number;
    topMultiplier?: number;
    rightMultiplier?: number;
    bottomMultiplier?: number;
    leftMultiplier?: number;
    // Opacity shifts
    panelOpacityShift?: number;
    buttonOpacityShift?: number;
  };

  // Motion: Scales
  motion?: {
    speedScale: number;       // 0.5-2.0
    durationScale: number;    // 0.5-2.0
    easingOverride?: string;
  };

  // Semantics: Mappings
  semantics?: {
    h1Color: keyof VT['colors'];
    h2Color: keyof VT['colors'];
    h3Color: keyof VT['colors'];
    h4Color: keyof VT['colors'];
    buttonPadding: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    cardRadius: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };

  // Global slider ranges
  sliderRanges?: Partial<SliderRangeMap>;
}

// ============================================================================
// EffectiveConfig: DETERMINISTIC OUTPUT (CSS Vars)
// ============================================================================

export interface EffectiveConfig {
  resolved: Record<string, string>;  // e.g., "--color-primary": "oklch(0.65 0.15 200)"
  hash: string;                      // hash(vt + dt + schemaVersions)
  source: {
    vt: string;                      // VT identifier
    dt: string;                      // DT identifier
  };
}

// ============================================================================
// Validation (DCV Integration — Report-Only)
// ============================================================================

export type ViolationLevel = 'error' | 'warn';

export type ConstraintType =
  | 'wcag-contrast'
  | 'monotonic'
  | 'threshold'
  | 'cross-axis'
  | 'monotonic-lightness';

export interface Violation {
  ruleId: ConstraintType;
  level: ViolationLevel;
  message: string;
  roleId?: string;
  selectors?: string[];
  ratio?: number;
  threshold?: number | string;
  tokensInvolved?: string[];
  // Educational: suggested fix
  suggestion?: string;  // e.g., "Try L -0.15 for 4.5:1"
}

export interface ValidationResult {
  ok: boolean;
  violations: Violation[];
  receipts: ValidationReceiptItem[];
  evaluatedAt: string;
  engineVersion?: string;
}

// ... (keep your existing validation types, snapshots, worker messages)
