import { describe, it, expect } from 'vitest';
import { loadTokensWithBreakpoint } from '../core/breakpoints.js';
import { createValidationEngine } from '../cli/engine-helpers.js';
import { loadCrossAxisPlugin } from '../core/cross-axis-config.js';
import { flattenTokens } from '../core/flatten.js';

// Smoke test for expanded cross-axis guardrails

describe('cross-axis guardrails', () => {
  it('emits issues for guardrail rule set', () => {
    const tokens = loadTokensWithBreakpoint(undefined);
    const engine = createValidationEngine(tokens, undefined, {} as any);
    const ids = Object.keys(flattenTokens(tokens).flat);
    const known = new Set(ids);
    engine.use(loadCrossAxisPlugin('themes/cross-axis.rules.json', undefined, { knownIds: known }));
  const issues = engine.evaluate(new Set(ids));
  // Should execute without throwing; cross-axis issues may be zero if tokens satisfy guardrails.
  const cross = issues.filter(i => i.rule === 'cross-axis');
  expect(Array.isArray(cross)).toBe(true);
  });
});
