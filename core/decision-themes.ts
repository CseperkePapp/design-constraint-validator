/**
 * Decision Themes - User Intent-Driven Constraint Profiles
 *
 * Instead of thinking about technical constraints, users choose decision themes
 * that align with their project goals and design philosophy.
 */

import type { ConstraintSettings } from './constraint-registry.js';
import { createConstraintSettings } from './constraint-settings.js';
import { raise } from '../src/errors/raise.js';

export interface DecisionTheme {
  id: string;
  name: string;
  description: string;
  emoji: string;

  // What this theme optimizes for
  optimizedFor: string[];

  // Real-world examples
  examples: string[];

  // When to use this theme
  useWhen: string[];

  // When NOT to use this theme
  avoidWhen?: string[];

  // The actual constraint configuration
  constraints: ConstraintSettings;

  // Metadata
  popularity: 'common' | 'specialized' | 'advanced';
  performance: 'fast' | 'balanced' | 'comprehensive';
}

/**
 * Core Decision Themes
 *
 * These represent the most common user intents and project goals.
 * Each theme encodes best practices for that type of project.
 */
export const DECISION_THEMES: Record<string, DecisionTheme> = {

  //=====================================
  // ACCESSIBILITY-FIRST
  //=====================================
  'accessibility-first': {
    id: 'accessibility-first',
    name: 'Accessibility First',
    description: 'WCAG-compliant design system prioritizing inclusive design and accessibility compliance',
    emoji: '♿',

    optimizedFor: [
      'WCAG AA/AAA compliance',
      'Screen reader compatibility',
      'Keyboard navigation',
      'Color accessibility',
      'Touch target compliance'
    ],

    examples: [
      'Government websites',
      'Healthcare applications',
      'Educational platforms',
      'Public service sites',
      'Financial services'
    ],

    useWhen: [
      'Legal accessibility requirements',
      'Serving diverse user needs',
      'Government/public sector projects',
      'B2B enterprise applications',
      'Building inclusive products'
    ],

    avoidWhen: [
      'Rapid prototyping phases',
      'Internal tools with known user base',
      'Performance-critical applications'
    ],

    constraints: createConstraintSettings({
      constraints: {
        'wcag-contrast': true,
        'wcag-touch-targets': true,
        'monotonic-typography': true,
        'spacing-scale': true,
        'modular-scale': false,     // Can be expensive
        'web-typography': false,    // Focus on core a11y first
      },

      categories: {
        accessibility: true,
        typography: true,
        layout: true,
        color: true,
        web: false,  // Optional, not core to accessibility
        performance: false,
      },

      performance: {
        skipExpensive: false,  // Accessibility is worth the cost
        fastOnly: false,
      }
    }),

    popularity: 'common',
    performance: 'balanced'
  },

  //=====================================
  // WEB-NATIVE
  //=====================================
  'web-native': {
    id: 'web-native',
    name: 'Web Native',
    description: 'Web-first design system with real-time typography optimization and responsive validation',
    emoji: '🌐',

    optimizedFor: [
      'Web typography optimization',
      'Real-time paragraph tuning',
      'Responsive design validation',
      'Content-focused experiences',
      'Reading experiences'
    ],

    examples: [
      'Content management systems',
      'Blog platforms',
      'Documentation sites',
      'News websites',
      'Publishing platforms',
      'Marketing sites'
    ],

    useWhen: [
      'Content-heavy websites',
      'Text-focused applications',
      'Publishing platforms',
      'Documentation sites',
      'Marketing websites'
    ],

    avoidWhen: [
      'Mobile-first applications',
      'Data visualization tools',
      'Gaming interfaces'
    ],

    constraints: createConstraintSettings({
      constraints: {
        'wcag-contrast': true,      // Still need accessibility basics
        'wcag-touch-targets': true,
        'monotonic-typography': true,
        'web-typography': true,     // Core feature
        'web-responsive': true,     // Important for web
        'modular-scale': false,     // Can conflict with web optimization
      },

      categories: {
        accessibility: true,
        web: true,              // Primary focus
        typography: true,
        color: true,
        layout: false,          // Let web typography handle layout
        performance: false,
      },

      web: {
        enabled: true,
        selector: '.content, .article, p, .prose',
        policy: {
          minCPL: 45,
          maxCPL: 85,
          trackMax: 0.015,
          spaceMin: "-0.1ch",
          spaceMax: "0.2ch",
          minLastLineChars: 10
        }
      }
    }),

    popularity: 'common',
    performance: 'comprehensive'  // Web validation can be expensive
  },

  //=====================================
  // FAST-ITERATION
  //=====================================
  'fast-iteration': {
    id: 'fast-iteration',
    name: 'Fast Iteration',
    description: 'Minimal validation for rapid prototyping and development with essential checks only',
    emoji: '⚡',

    optimizedFor: [
      'Development speed',
      'Quick iteration cycles',
      'Essential validation only',
      'Minimal build times',
      'Core accessibility'
    ],

    examples: [
      'Startup MVPs',
      'Design prototypes',
      'Proof of concepts',
      'Early development phases',
      'Hackathon projects'
    ],

    useWhen: [
      'Rapid prototyping',
      'Early development phases',
      'Tight deadlines',
      'Exploring design concepts',
      'Performance-critical builds'
    ],

    constraints: createConstraintSettings({
      constraints: {
        'wcag-contrast': true,      // Minimum viable accessibility
        'monotonic-typography': true, // Basic hierarchy check
        'spacing-scale': false,     // Skip for speed
        'web-typography': false,    // Too expensive for iteration
      },

      categories: {
        accessibility: false,  // Only individual constraints enabled
        web: false,
        typography: false,
        color: false,
        layout: false,
        performance: false,
      },

      performance: {
        fastOnly: true,        // Only fast constraints
        skipExpensive: true,
        maxExecutionTime: 1000  // 1 second max
      }
    }),

    popularity: 'common',
    performance: 'fast'
  },

  //=====================================
  // ENTERPRISE
  //=====================================
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Comprehensive validation for production design systems with full constraint coverage',
    emoji: '🏢',

    optimizedFor: [
      'Production readiness',
      'Comprehensive validation',
      'Team collaboration',
      'Consistency enforcement',
      'Quality assurance'
    ],

    examples: [
      'Enterprise software platforms',
      'B2B applications',
      'Design system libraries',
      'Production web applications',
      'Team collaboration tools'
    ],

    useWhen: [
      'Production applications',
      'Team-based development',
      'Design system libraries',
      'Quality-critical projects',
      'Long-term maintenance'
    ],

    constraints: createConstraintSettings({
      constraints: {
        'wcag-contrast': true,
        'wcag-touch-targets': true,
        'monotonic-typography': true,
        'monotonic-lightness': true,
        'spacing-scale': true,
        'modular-scale': true,      // Advanced typography
        'palette-misuse': true,     // Team consistency
        'container-constraints': true,
        'web-typography': false,    // Optional enterprise feature
      },

      categories: {
        accessibility: true,
        typography: true,
        color: true,
        layout: true,
        web: false,  // Opt-in for enterprise
        performance: false,
      },

      performance: {
        skipExpensive: false,  // Comprehensive validation
        fastOnly: false,
      }
    }),

    popularity: 'common',
    performance: 'comprehensive'
  },

  //=====================================
  // SYSTEM-CREATOR
  //=====================================
  'system-creator': {
    id: 'system-creator',
    name: 'System Creator',
    description: 'Advanced validation for design system authors with comprehensive constraint coverage',
    emoji: '🎨',

    optimizedFor: [
      'Design system creation',
      'Component library development',
      'Advanced constraint validation',
      'Token relationship validation',
      'Mathematical precision'
    ],

    examples: [
      'Design system libraries',
      'Component frameworks',
      'Design tool plugins',
      'Token generation tools',
      'Advanced design systems'
    ],

    useWhen: [
      'Building design systems',
      'Creating component libraries',
      'Authoring design tools',
      'Advanced constraint needs',
      'Mathematical validation required'
    ],

    avoidWhen: [
      'Application development',
      'Rapid prototyping',
      'Simple websites'
    ],

    constraints: createConstraintSettings({
      constraints: {
        'wcag-contrast': true,
        'wcag-touch-targets': true,
        'monotonic-typography': true,
        'monotonic-lightness': true,
        'spacing-scale': true,
        'modular-scale': true,
        'palette-misuse': true,
        'container-constraints': true,
        'web-typography': true,     // Full feature set
        'web-responsive': true,
      },

      categories: {
        accessibility: true,
        typography: true,
        color: true,
        layout: true,
        web: true,      // Full web integration
        performance: false,
      },

      performance: {
        skipExpensive: false,  // Comprehensive validation
        fastOnly: false,
        maxExecutionTime: 10000  // Allow longer for comprehensive validation
      },

      web: {
        enabled: true,
        selector: '.lrss, .prose, p, .content, .article',  // Comprehensive selector
        policy: {
          minCPL: 40,
          maxCPL: 90,   // Wider range for system creators
          trackMax: 0.02,
          spaceMin: "-0.15ch",
          spaceMax: "0.25ch",
          minLastLineChars: 8
        }
      }
    }),

    popularity: 'specialized',
    performance: 'comprehensive'
  }
};

/**
 * Get theme by ID with error handling
 */
export function getDecisionTheme(themeId: string): DecisionTheme {
  const theme = DECISION_THEMES[themeId];
  if (!theme) {
    raise('CONF.INVALID_JSON', {
      id: 'decision-theme',
      message: `Unknown decision theme: ${themeId}. Available: ${Object.keys(DECISION_THEMES).join(', ')}`,
      ctx: { themeId, available: Object.keys(DECISION_THEMES) }
    });
  }
  return theme;
}

/**
 * Get all available themes
 */
export function getAllDecisionThemes(): DecisionTheme[] {
  return Object.values(DECISION_THEMES);
}

/**
 * Get themes by popularity
 */
export function getThemesByPopularity(popularity: DecisionTheme['popularity']): DecisionTheme[] {
  return getAllDecisionThemes().filter(theme => theme.popularity === popularity);
}

/**
 * Get theme recommendations based on project characteristics
 */
export function recommendTheme(projectInfo: {
  type?: 'website' | 'web-app' | 'mobile-app' | 'desktop-app' | 'design-system';
  stage?: 'prototype' | 'development' | 'production';
  priorities?: Array<'accessibility' | 'performance' | 'content' | 'comprehensive'>;
  constraints?: Array<'legal-a11y' | 'fast-iteration' | 'team-collaboration'>;
}): DecisionTheme[] {
  const recommendations: Array<{ theme: DecisionTheme; score: number; reasons: string[] }> = [];

  for (const theme of getAllDecisionThemes()) {
    let score = 0;
    const reasons: string[] = [];

    // Project type scoring
    if (projectInfo.type === 'website' && theme.id === 'web-native') {
      score += 3;
      reasons.push('Web-native theme optimized for websites');
    }
    if (projectInfo.type === 'design-system' && theme.id === 'system-creator') {
      score += 3;
      reasons.push('System Creator theme built for design system development');
    }

    // Stage scoring
    if (projectInfo.stage === 'prototype' && theme.id === 'fast-iteration') {
      score += 2;
      reasons.push('Fast iteration theme perfect for prototyping');
    }
    if (projectInfo.stage === 'production' && theme.id === 'enterprise') {
      score += 2;
      reasons.push('Enterprise theme built for production systems');
    }

    // Priority scoring
    if (projectInfo.priorities?.includes('accessibility') && theme.id === 'accessibility-first') {
      score += 2;
      reasons.push('Accessibility-first theme matches your priority');
    }
    if (projectInfo.priorities?.includes('content') && theme.id === 'web-native') {
      score += 2;
      reasons.push('Web-native theme optimized for content-focused experiences');
    }
    if (projectInfo.priorities?.includes('performance') && theme.id === 'fast-iteration') {
      score += 2;
      reasons.push('Fast iteration theme prioritizes performance');
    }

    if (score > 0) {
      recommendations.push({ theme, score, reasons });
    }
  }

  // Sort by score and return themes
  return recommendations
    .sort((a, b) => b.score - a.score)
    .map(rec => rec.theme);
}

/**
 * Default theme for new projects
 */
export const DEFAULT_THEME = 'accessibility-first';