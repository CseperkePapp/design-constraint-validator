import { z } from 'zod';

// Schemas are `.strict()` on purpose (TASK-037): a validator must never silently
// accept a typo'd key, because "the rule never ran" is indistinguishable from
// "the rule passed" — a false green. A misspelled block (`wcagg`), a typo'd
// field (`levle`), or an out-of-range bound is rejected loudly, not dropped.

// WCAG contrast ratios are bounded by the spec to (1:1, 21:1]: 1 means "no
// contrast required" (a no-op rule) and 21 is the maximum achievable (#000 on
// #fff). Anything outside that is a config error, not a stricter policy.
export const WcagRuleSchema = z.object({
  foreground: z.string(),
  background: z.string(),
  ratio: z.number().finite().gt(1).max(21).optional(),
  description: z.string().optional(),
  backdrop: z.string().optional()
}).strict();

export const ThresholdRuleSchema = z.object({
  id: z.string(),
  op: z.enum(['<=', '>=']),
  valuePx: z.number().finite().nonnegative(),
  where: z.string().optional(),
  level: z.enum(['error', 'warn']).optional()
}).strict();

export const ConstraintsSchema = z.object({
  enableBuiltInWcagDefaults: z.boolean().optional(),
  enableBuiltInThreshold: z.boolean().optional(),
  wcag: z.array(WcagRuleSchema).optional(),
  thresholds: z.array(ThresholdRuleSchema).optional()
}).strict();

export const DcvConfigSchema = z.object({
  // `$schema` is the conventional editor-hint key; allow it so strictness does
  // not punish a well-formed config, but still reject unknown top-level typos.
  $schema: z.string().optional(),
  version: z.string().optional(),
  constraints: ConstraintsSchema.optional()
}).strict();

export type DcvConfigParsed = z.infer<typeof DcvConfigSchema>;

export function validateConfig(raw: unknown): { value?: DcvConfigParsed; errors?: string[] } {
  const res = DcvConfigSchema.safeParse(raw);
  if (!res.success) {
    // zod v4 renamed ZodError.errors -> .issues (the .errors getter was removed).
    return { errors: res.error.issues.map((e) => `${e.path.join('.') || '<root>'}: ${e.message}`) };
  }
  return { value: res.data };
}
