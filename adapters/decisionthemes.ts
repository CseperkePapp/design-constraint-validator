// adapters/decisionthemes.ts — Normalize VT/DT to DCV tokens
import { computeEffectiveConfig } from '../src/core/resolver';  // From our new VT/DT
import type { VT, DT, EffectiveConfig } from '../src/types';

export function decisionthemesAdapter(input: { vt: VT; dt: DT }): { tokens: Record<string, any>; policy?: string } {
  const effective: EffectiveConfig = computeEffectiveConfig(input.vt, input.dt);

  // Flatten to DCV format (flat JSON with paths)
  const tokens: Record<string, any> = {};
  for (const [varName, value] of Object.entries(effective.resolved)) {
    // e.g., --color-primary → color.primary
    const path = varName.replace('--', '').replace(/-/g, '.');
    tokens[path] = value;
  }

  // Auto-generate policy from DT (e.g., 5-axes)
  const policy = {
    constraints: [
      { type: 'cross-axis', axes: ['tone', 'emphasis'], min: 4.5 },  // WCAG on colors/shadows
      { type: 'monotonic', category: 'typography' },
      { type: 'threshold', category: 'spacing', min: 4 }  // Min touch targets
    ]
  };

  return { tokens, policy: JSON.stringify(policy) };
}

// Usage in CLI: npx dcv validate studio.json --adapter decisionthemes
