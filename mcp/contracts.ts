import { z } from 'zod';

import { ConstraintsSchema } from '../cli/config-schema.js';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

const jsonPrimitiveSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([jsonPrimitiveSchema, z.array(jsonValueSchema), z.record(jsonValueSchema)]),
);

export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(jsonValueSchema);

export const tokenInputShape = {
  tokens: jsonObjectSchema
    .optional()
    .describe('Inline DTCG-style token tree. Takes precedence over tokensPath.'),
  tokensPath: z.string().optional().describe('Path to a token JSON file on the server filesystem.'),
  constraints: ConstraintsSchema
    .optional()
    .describe('Inline constraints block from dcv.config.json. Takes precedence over configPath.'),
  configPath: z.string().optional().describe('Path to a JSON DCV config file.'),
  constraintsDir: z.string().optional().describe('Directory holding order and cross-axis constraints.'),
  breakpoint: z.enum(['sm', 'md', 'lg']).optional().describe('Optional constraint breakpoint.'),
};

export const validateInputShape = {
  ...tokenInputShape,
};

export const whyInputShape = {
  ...tokenInputShape,
  tokenId: z.string().describe('Token id to explain, for example color.role.text.default.'),
};

export const graphInputShape = {
  ...tokenInputShape,
  format: z.literal('json').optional().describe('Only json is supported; omitted defaults to json.'),
};

// A validation violation, as emitted by the `validate` tool. Accepted by
// `explain` / `suggest-fix` so an agent can pipe a violation straight back in.
export const violationInputSchema = z
  .object({
    ruleId: z.string().describe('Rule id, e.g. wcag-contrast, threshold, monotonic.'),
    level: z.enum(['error', 'warn']).optional(),
    message: z.string().optional(),
    nodes: z.array(z.string()).optional().describe('Involved token ids.'),
    edges: z.array(z.tuple([z.string(), z.string()])).optional(),
    context: z.record(z.unknown()).optional(),
  })
  .describe('A validation violation to explain or fix.');

export const listConstraintsInputShape = {
  ...tokenInputShape,
};

// `explain` / `suggest-fix` accept EITHER a full `violation` object OR the loose
// `ruleId` + `nodes` (+ optional `context`) pair. The handler requires one path.
const insightInputShape = {
  ...tokenInputShape,
  violation: violationInputSchema.optional(),
  ruleId: z.string().optional().describe('Rule id, when not passing a full violation.'),
  nodes: z
    .array(z.string())
    .optional()
    .describe('Involved token ids, when not passing a full violation. WCAG: [foreground, background].'),
  context: z
    .record(z.unknown())
    .optional()
    .describe('Optional known facts (e.g. { required: 4.5 }) used as a fallback when the rule cannot be rediscovered.'),
};

export const explainInputShape = {
  ...insightInputShape,
};

export const suggestFixInputShape = {
  ...insightInputShape,
  target: z
    .enum(['foreground', 'background'])
    .optional()
    .describe('WCAG only: which side to adjust. Omit to get both candidates.'),
};

export const validateInputSchema = z.object(validateInputShape);
export const whyInputSchema = z.object(whyInputShape);
export const graphInputSchema = z.object(graphInputShape);
export const listConstraintsInputSchema = z.object(listConstraintsInputShape);
export const explainInputSchema = z.object(explainInputShape);
export const suggestFixInputSchema = z.object(suggestFixInputShape);

export type ValidateToolInput = z.infer<typeof validateInputSchema>;
export type WhyToolInput = z.infer<typeof whyInputSchema>;
export type GraphToolInput = z.infer<typeof graphInputSchema>;
export type ListConstraintsToolInput = z.infer<typeof listConstraintsInputSchema>;
export type ExplainToolInput = z.infer<typeof explainInputSchema>;
export type SuggestFixToolInput = z.infer<typeof suggestFixInputSchema>;
export type ViolationInput = z.infer<typeof violationInputSchema>;
