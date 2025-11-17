import type { Engine } from '../core/engine.js';
import { loadCrossAxisPlugin } from '../core/cross-axis-config.js';
import { ThresholdPlugin } from '../core/constraints/threshold.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';

type AttachRuntimeOpts = {
  config: DcvConfig;
  knownIds: Set<string>;
  bp?: Breakpoint;
  crossAxisDebug?: boolean;
};

/**
 * Attach runtime constraints that depend on project files or built-in policies:
 * - Cross-axis rules from themes/cross-axis*.rules.json
 * - Built-in threshold rules (e.g., control.size.min >= 44px)
 */
export function attachRuntimeConstraints(engine: Engine, opts: AttachRuntimeOpts): void {
  const { knownIds, bp, crossAxisDebug, config } = opts;

  // Cross-axis rules: global + optional breakpoint-specific
  try {
    engine.use(
      loadCrossAxisPlugin('themes/cross-axis.rules.json', bp, {
        debug: !!crossAxisDebug,
        knownIds,
      }),
    );

    if (bp) {
      const bpRulesPath = `themes/cross-axis.${bp}.rules.json`;
      engine.use(
        loadCrossAxisPlugin(bpRulesPath, bp, {
          debug: !!crossAxisDebug,
          knownIds,
        }),
      );
    }
  } catch {
    // If cross-axis configuration fails, continue with other constraints.
  }

  const constraintsCfg = config.constraints ?? {};

  // Built-in threshold rule for touch targets (configurable)
  const enableBuiltInThreshold =
    constraintsCfg.enableBuiltInThreshold === undefined ? true : !!constraintsCfg.enableBuiltInThreshold;

  if (enableBuiltInThreshold) {
    try {
      engine.use(
        ThresholdPlugin(
          [
            {
              id: 'control.size.min',
              op: '>=',
              valuePx: 44,
              where: 'Touch target (WCAG / Apple HIG)',
            },
          ],
          'threshold',
        ),
      );
    } catch {
      // Threshold attachment is best-effort; failures should not abort validation.
    }
  }
}
