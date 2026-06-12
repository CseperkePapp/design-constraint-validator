import { describe, it, expect } from 'vitest';
import {
  CrossAxisPlugin,
  headingEmphasisRules,
  type CrossAxisRule,
} from '../core/constraints/cross-axis.js';
import { Engine } from '../core/engine.js';

/**
 * TASK-016 coverage hardening: cross-axis.ts was at 0% test coverage (the audit's
 * top gap). These pin the when/require and contrast rule shapes, the px() parser
 * (incl. rem and the clamp() heuristic), candidate gating, and the
 * headingEmphasisRules factory.
 */
function run(
  rules: CrossAxisRule[],
  init: Record<string, string | number>,
  candidateIds?: string[],
  bp?: string,
) {
  const engine = new Engine(init, []);
  const candidates = new Set(candidateIds ?? Object.keys(init));
  return CrossAxisPlugin(rules, bp).evaluate(engine, candidates);
}

describe('cross-axis: when/require rules', () => {
  it('emits when `when` passes and `require` fails', () => {
    const rules: CrossAxisRule[] = [
      {
        id: 'r1',
        when: { id: 'a', test: (v) => v > 10 },
        require: { id: 'b', test: (v) => v >= 20, msg: (v) => `b=${v} < 20` },
      },
    ];
    const issues = run(rules, { a: '12px', b: '16px' });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('b=16 < 20');
    expect(issues[0].level).toBe('error'); // when/require defaults to error
  });

  it('no issue when `when` does not pass', () => {
    const rules: CrossAxisRule[] = [
      {
        id: 'r1',
        when: { id: 'a', test: (v) => v > 100 },
        require: { id: 'b', test: () => false, msg: () => 'x' },
      },
    ];
    expect(run(rules, { a: '12px', b: '16px' })).toHaveLength(0);
  });

  it('no issue when `require` passes', () => {
    const rules: CrossAxisRule[] = [
      {
        id: 'r1',
        when: { id: 'a', test: () => true },
        require: { id: 'b', test: (v) => v >= 10, msg: () => 'x' },
      },
    ];
    expect(run(rules, { a: '12px', b: '16px' })).toHaveLength(0);
  });

  it('skips the rule when neither id is a candidate (incremental gating)', () => {
    const rules: CrossAxisRule[] = [
      {
        id: 'r1',
        when: { id: 'a', test: () => true },
        require: { id: 'b', test: () => false, msg: () => 'should-not-fire' },
      },
    ];
    expect(run(rules, { a: '12px', b: '16px' }, ['unrelated'])).toHaveLength(0);
  });

  it('same-id when/require uses that id\'s value', () => {
    const rules: CrossAxisRule[] = [
      {
        id: 'r1',
        when: { id: 'a', test: (v) => v > 10 },
        require: { id: 'a', test: (v) => v >= 50, msg: (v) => `a=${v}` },
      },
    ];
    const issues = run(rules, { a: '20px' });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('a=20');
  });
});

describe('cross-axis: px() parser (via headingEmphasisRules)', () => {
  it('treats 1rem as 16px', () => {
    // body=1rem(16) → heading must be ≥ 18; heading=1rem(16) fails
    const issues = run(headingEmphasisRules(['h'], 'body', 2), { body: '1rem', h: '1rem' });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain('too close to body');
  });

  it('extracts the FIRST px/rem from a clamp() expression (the min, by current heuristic)', () => {
    // heading clamp first token = 30px ≥ body(16)+2 → passes
    const ok = run(headingEmphasisRules(['h'], 'body', 2), { body: '16px', h: 'clamp(30px, 4vw, 40px)' });
    expect(ok).toHaveLength(0);
    // clamp first token = 16px < 18 → fails (proves it reads the MIN, not the max)
    const bad = run(headingEmphasisRules(['h'], 'body', 2), { body: '16px', h: 'clamp(16px, 4vw, 40px)' });
    expect(bad).toHaveLength(1);
  });

  it('passes when headings clear body + delta', () => {
    const issues = run(headingEmphasisRules(['h1', 'h2'], 'body', 2), {
      body: '16px',
      h1: '32px',
      h2: '24px',
    });
    expect(issues).toHaveLength(0);
  });
});

describe('cross-axis: contrast rules', () => {
  it('emits (warn) when ratio < min', () => {
    const rules: CrossAxisRule[] = [
      { id: 'c1', contrast: { text: 'fg', bg: 'bg', min: () => 4.5, ratio: () => 2.0 } },
    ];
    const issues = run(rules, { fg: '#000000', bg: '#ffffff' });
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('Contrast 2.0:1 < 4.5:1');
    expect(issues[0].level).toBe('warn'); // contrast defaults to warn
  });

  it('passes when ratio ≥ min, and min can depend on breakpoint', () => {
    const seenBp: (string | undefined)[] = [];
    const rules: CrossAxisRule[] = [
      {
        id: 'c1',
        contrast: {
          text: 'fg',
          bg: 'bg',
          min: (bp) => {
            seenBp.push(bp);
            return 4.5;
          },
          ratio: () => 7.0,
        },
      },
    ];
    expect(run(rules, { fg: '#000000', bg: '#ffffff' }, undefined, 'md')).toHaveLength(0);
    expect(seenBp).toContain('md'); // breakpoint threaded into min()
  });
});
