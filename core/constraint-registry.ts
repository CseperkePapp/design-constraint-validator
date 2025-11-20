/**
 * Modular Constraint Registry System
 *
 * Provides user-controlled enablement/disablement of all constraint validation.
 * Users can selectively choose which constraints to run for their specific needs.
 */

import type { ConstraintPlugin } from './engine.js';
import { createConstraintSettings } from './constraint-settings.js';

export type ConstraintCategory =
  | 'accessibility'
  | 'typography'
  | 'color'
  | 'layout'
  | 'web'
  | 'performance';

export type PerformanceLevel = 'fast' | 'medium' | 'expensive';

export type ConstraintConfig = {
  id: string;
  enabled: boolean;
  plugin: ConstraintPlugin;
  category: ConstraintCategory;
  performance: PerformanceLevel;
  description: string;
  dependencies?: string[];  // Other constraints this one requires
};

// Intent-focused configuration (themes + adjustments)
export type IntentConfig = {
  theme?: string;
  adjustments?: Record<string, boolean>;
  project?: {
    name?: string;
    type?: 'website' | 'web-app' | 'mobile-app' | 'desktop-app' | 'design-system';
    stage?: 'prototype' | 'development' | 'production';
    priorities?: Array<'accessibility' | 'performance' | 'content' | 'comprehensive'>;
  };
};

// Technical constraint configuration (full control)
export type TechnicalConstraintConfig = {
  // Individual constraints with detailed configuration
  constraints?: Record<string, boolean | ConstraintConfig>;

  // Custom constraint plugins
  customConstraints?: Record<string, ConstraintPlugin>;

  // Category-level toggles
  categories?: Record<ConstraintCategory, boolean>;

  // Performance settings
  performance?: {
    skipExpensive?: boolean;
    fastOnly?: boolean;
    maxExecutionTime?: number; // ms
    parallelValidation?: boolean;
  };

  // Engine configuration
  engine?: {
    mathematical?: {
      enabled?: boolean;
      precision?: 'standard' | 'high' | 'maximum';
    };
  };

  // Web-specific settings
  web?: {
    enabled?: boolean;
    selector?: string;
    policy?: {
      minCPL?: number;
      maxCPL?: number;
      trackMax?: number;
      spaceMin?: string;
      spaceMax?: string;
      minLastLineChars?: number;
    };
  };
};

// Hybrid configuration (theme + technical overrides)
export type HybridConfig = IntentConfig & {
  constraintOverrides?: Record<string, ConstraintConfig>;
  customConstraints?: Record<string, ConstraintPlugin>;
};

// Unified configuration type (supports all approaches)
export type ConstraintSettings = IntentConfig & TechnicalConstraintConfig & {
  constraintOverrides?: Record<string, ConstraintConfig>;
};

export class ConstraintRegistry {
  private constraints = new Map<string, ConstraintConfig>();
  private settings: ConstraintSettings;

  constructor(settings: ConstraintSettings = createConstraintSettings({ constraints: {} })) {
    this.settings = createConstraintSettings(settings);
  }

  /**
   * Register a constraint plugin with configuration
   */
  register(config: ConstraintConfig): void {
    // Check if constraint should be enabled based on settings
    const enabled = this.shouldEnable(config);

    this.constraints.set(config.id, {
      ...config,
      enabled
    });
  }

  /**
   * Determine if a constraint should be enabled based on user settings
   */
  private shouldEnable(config: ConstraintConfig): boolean {
    // Category-level override
    if (this.settings.categories?.[config.category] !== undefined) {
      return !!this.settings.categories[config.category];
    }

    // Individual constraint setting
    if (this.settings.constraints?.[config.id] !== undefined) {
      const setting = this.settings.constraints[config.id];
      return typeof setting === 'boolean' ? setting : setting.enabled;
    }

    // Performance filtering
    if (this.settings.performance?.fastOnly && config.performance !== 'fast') {
      return false;
    }

    if (this.settings.performance?.skipExpensive && config.performance === 'expensive') {
      return false;
    }

    // Web constraints require explicit enablement
    if (config.category === 'web') {
      return this.settings.web?.enabled || false;
    }

    // Default to enabled for non-web constraints
    return config.enabled;
  }

  /**
   * Enable a specific constraint
   */
  enable(id: string): void {
    const constraint = this.constraints.get(id);
    if (constraint) {
      constraint.enabled = true;
      if (!this.settings.constraints) this.settings.constraints = {};
      this.settings.constraints[id] = true;
    }
  }

  /**
   * Disable a specific constraint
   */
  disable(id: string): void {
    const constraint = this.constraints.get(id);
    if (constraint) {
      constraint.enabled = false;
      if (!this.settings.constraints) this.settings.constraints = {};
      this.settings.constraints[id] = false;
    }
  }

  /**
   * Enable all constraints in a category
   */
  enableCategory(category: ConstraintCategory): void {
    this.settings.categories = { ...this.settings.categories, [category]: true } as Record<ConstraintCategory, boolean>;

    // Update individual constraints
    for (const config of this.constraints.values()) {
      if (config.category === category) {
        config.enabled = true;
      }
    }
  }

  /**
   * Disable all constraints in a category
   */
  disableCategory(category: ConstraintCategory): void {
    this.settings.categories = { ...this.settings.categories, [category]: false } as Record<ConstraintCategory, boolean>;

    // Update individual constraints
    for (const config of this.constraints.values()) {
      if (config.category === category) {
        config.enabled = false;
      }
    }
  }

  /**
   * Get all enabled constraint plugins
   */
  getEnabled(): ConstraintPlugin[] {
    const enabled: ConstraintPlugin[] = [];

    for (const config of this.constraints.values()) {
      if (config.enabled && this.checkDependencies(config)) {
        enabled.push(config.plugin);
      }
    }

    return enabled;
  }

  /**
   * Check if constraint dependencies are satisfied
   */
  private checkDependencies(config: ConstraintConfig): boolean {
    if (!config.dependencies) return true;

    return config.dependencies.every(depId => {
      const dep = this.constraints.get(depId);
      return dep && dep.enabled;
    });
  }

  /**
   * Get constraints by category
   */
  getByCategory(category: ConstraintCategory): ConstraintConfig[] {
    return Array.from(this.constraints.values())
      .filter(config => config.category === category);
  }

  /**
   * Get all constraints (enabled and disabled)
   */
  getAll(): ConstraintConfig[] {
    return Array.from(this.constraints.values());
  }

  /**
   * Get constraint statistics
   */
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byCategory: Record<ConstraintCategory, { enabled: number; total: number }>;
    byPerformance: Record<PerformanceLevel, { enabled: number; total: number }>;
  } {
    const all = this.getAll();
    const enabled = all.filter(c => c.enabled);

    const byCategory: Record<string, { enabled: number; total: number }> = {};
    const byPerformance: Record<string, { enabled: number; total: number }> = {};

    // Initialize counters
    for (const category of ['accessibility', 'typography', 'color', 'layout', 'web', 'performance']) {
      byCategory[category] = { enabled: 0, total: 0 };
    }
    for (const perf of ['fast', 'medium', 'expensive']) {
      byPerformance[perf] = { enabled: 0, total: 0 };
    }

    // Count constraints
    for (const config of all) {
      byCategory[config.category].total++;
      byPerformance[config.performance].total++;

      if (config.enabled) {
        byCategory[config.category].enabled++;
        byPerformance[config.performance].enabled++;
      }
    }

    return {
      total: all.length,
      enabled: enabled.length,
      disabled: all.length - enabled.length,
      byCategory: byCategory as Record<ConstraintCategory, { enabled: number; total: number }>,
      byPerformance: byPerformance as Record<PerformanceLevel, { enabled: number; total: number }>
    };
  }

  /**
   * Update settings (useful for CLI flag processing)
   */
  updateSettings(newSettings: Partial<ConstraintSettings>): void {
    this.settings = createConstraintSettings({
      ...this.settings,
      ...newSettings,
      constraints: {
        ...this.settings.constraints,
        ...newSettings.constraints
      }
    });

    // Re-evaluate all constraints
    for (const config of this.constraints.values()) {
      config.enabled = this.shouldEnable(config);
    }
  }

  /**
   * Export current settings (useful for saving configuration)
   */
  exportSettings(): ConstraintSettings {
    return { ...this.settings };
  }
}

/**
 * Default constraint settings - sensible defaults for most users
 */
export const DEFAULT_CONSTRAINT_SETTINGS: ConstraintSettings = {
  constraints: {
    // Accessibility - enabled by default (critical)
    'wcag-contrast': true,
    'wcag-touch-targets': true,

    // Typography - enabled by default (common)
    'monotonic-typography': true,
    'modular-scale': false,  // Can be expensive

    // Color - selective defaults
    'monotonic-lightness': true,
    'palette-misuse': false,  // Can be noisy

    // Layout - basic enabled
    'spacing-scale': true,
    'container-constraints': false,

    // Web - disabled by default (opt-in)
    'web-typography': false,
    'web-responsive': false,
  },

  categories: {
    accessibility: true,   // Always enable a11y
    web: false,           // Disable web by default
    typography: false,
    color: false,
    layout: false,
    performance: false,
  },

  performance: {
    skipExpensive: false,
    fastOnly: false,
  },

  web: {
    enabled: false,
    selector: '.lrss',
    policy: {
      minCPL: 45,
      maxCPL: 85,
      trackMax: 0.015,
      spaceMin: "-0.1ch",
      spaceMax: "0.2ch",
      minLastLineChars: 10
    }
  }
};