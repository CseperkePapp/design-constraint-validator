import { z } from 'zod';

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
  constraints: jsonObjectSchema
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

export const validateInputSchema = z.object(validateInputShape);
export const whyInputSchema = z.object(whyInputShape);
export const graphInputSchema = z.object(graphInputShape);

export type ValidateToolInput = z.infer<typeof validateInputSchema>;
export type WhyToolInput = z.infer<typeof whyInputSchema>;
export type GraphToolInput = z.infer<typeof graphInputSchema>;
