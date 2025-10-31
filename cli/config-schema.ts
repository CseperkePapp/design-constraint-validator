import { z } from 'zod';

export const WcagRuleSchema = z.object({
  foreground: z.string(),
  background: z.string(),
  ratio: z.number().positive().optional(),
  description: z.string().optional()
});

export const ConstraintsSchema = z.object({
  wcag: z.array(WcagRuleSchema).optional()
}).passthrough();

export const LarissaConfigSchema = z.object({
  version: z.string().optional(),
  constraints: ConstraintsSchema.optional()
}).passthrough();

export type LarissaConfigParsed = z.infer<typeof LarissaConfigSchema>;

export function validateConfig(raw: unknown): { value?: LarissaConfigParsed; errors?: string[] } {
  const res = LarissaConfigSchema.safeParse(raw);
  if (!res.success) {
    return { errors: res.error.errors.map(e => `${e.path.join('.')||'<root>'}: ${e.message}`) };
  }
  return { value: res.data };
}
