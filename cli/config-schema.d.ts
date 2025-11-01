import { z } from 'zod';
export declare const WcagRuleSchema: z.ZodObject<{
    foreground: z.ZodString;
    background: z.ZodString;
    ratio: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    foreground: string;
    background: string;
    description?: string | undefined;
    ratio?: number | undefined;
}, {
    foreground: string;
    background: string;
    description?: string | undefined;
    ratio?: number | undefined;
}>;
export declare const ConstraintsSchema: z.ZodObject<{
    wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
        foreground: z.ZodString;
        background: z.ZodString;
        ratio: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }>, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
        foreground: z.ZodString;
        background: z.ZodString;
        ratio: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
        foreground: z.ZodString;
        background: z.ZodString;
        ratio: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }, {
        foreground: string;
        background: string;
        description?: string | undefined;
        ratio?: number | undefined;
    }>, "many">>;
}, z.ZodTypeAny, "passthrough">>;
export declare const DcvConfigSchema: z.ZodObject<{
    version: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodObject<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    version: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodObject<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    version: z.ZodOptional<z.ZodString>;
    constraints: z.ZodOptional<z.ZodObject<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        wcag: z.ZodOptional<z.ZodArray<z.ZodObject<{
            foreground: z.ZodString;
            background: z.ZodString;
            ratio: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }, {
            foreground: string;
            background: string;
            description?: string | undefined;
            ratio?: number | undefined;
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, z.ZodTypeAny, "passthrough">>;
export type DcvConfigParsed = z.infer<typeof DcvConfigSchema>;
export declare function validateConfig(raw: unknown): {
    value?: DcvConfigParsed;
    errors?: string[];
};
//# sourceMappingURL=config-schema.d.ts.map