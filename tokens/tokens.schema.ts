// tokens.schema.ts
import { z } from "zod";

/** ---------- Helpers ---------- */

// Simple alias format: {namespace.path.to.token}
const AliasRef = z.string().regex(/^\{[a-zA-Z0-9_.-]+\}$/, {
  message:
    "Expected an alias like {color.role.accent.default} or a concrete value.",
});

// Very lightweight color/string formats (OKLCH, hex, rgb[a], hsl[a], color()).
// You can tighten these later if you want stricter parsing.
const ColorLiteral = z
  .string()
  .regex(
    /^(oklch\(.+\)|#([0-9a-fA-F]{3,8})\b|rgba?\(.+\)|hsla?\(.+\)|color\(.+\))$/,
    "Expected a color (oklch(...), #hex, rgb/rgba(...), hsl/hsla(...), or color(...))"
  );

const DurationLiteral = z
  .string()
  .regex(/^\d+(\.\d+)?(ms|s)$/i, "Expected a CSS time like '150ms' or '0.2s'");

const DimensionLiteral = z
  .string()
  .regex(
    /^-?\d+(\.\d+)?(px|rem|em|ch|vh|vw|%)$/i,
    "Expected a CSS length like '1rem', '12px', '50%'"
  );

const ShadowLiteral = z
  .string()
  .regex(
    /^(none|[-0-9a-zA-Z ().,/%]+)$/,
    "Expected a box-shadow string (e.g., '0 1px 2px rgba(0,0,0,.1)')"
  );

const EasingLiteral = z
  .string()
  .regex(
    /^(linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\(.+\))$/i,
    "Expected an easing like 'ease' or 'cubic-bezier(...)'"
  );

const FontFamilyLiteral = z.string(); // keep loose; real-world lists vary
const FontSizeLiteral = z.string(); // allow 'clamp(...)', '1rem', etc.
const LineHeightLiteral = z.union([z.number(), z.string()]); // 1.6 or '1.6'

/** ---------- Token leaf kinds ---------- */

const TokenTypeEnum = z.enum([
  // color
  "color",
  // dimensions / sizes
  "dimension",
  "borderRadius",
  "fontSize",
  "shadow",
  "duration",
  "easing",
  // typography
  "fontFamily",
  "lineHeight",
]);

// By $type, what values are allowed?
const ValueByType: Record<
  z.infer<typeof TokenTypeEnum>,
  z.ZodTypeAny
> = {
  color: z.union([ColorLiteral, AliasRef]),
  dimension: z.union([DimensionLiteral, AliasRef]),
  borderRadius: z.union([DimensionLiteral, AliasRef]),
  fontSize: z.union([FontSizeLiteral, AliasRef]),
  shadow: z.union([ShadowLiteral, AliasRef]),
  duration: z.union([DurationLiteral, AliasRef]),
  easing: z.union([EasingLiteral, AliasRef]),
  fontFamily: z.union([FontFamilyLiteral, AliasRef]),
  lineHeight: z.union([LineHeightLiteral, AliasRef]),
};

// Generic "leaf" token: { $type: 'color' | ..., $value: ... }
const TokenLeaf = z
  .object({
    $type: TokenTypeEnum,
    $value: z.any(), // refined below based on $type
  })
  .superRefine((val, ctx) => {
    const validator = ValueByType[val.$type];
    const res = validator.safeParse(val.$value);
    if (!res.success) {
      res.error.issues.forEach((issue) =>
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid $value for $type="${val.$type}": ${issue.message}`,
        })
      );
    }
  });

/** ---------- Namespaces / structure ---------- */

// We'll allow arbitrary numeric keys like "0", "600", "700", etc.
const StringKeyRecord = <T extends z.ZodTypeAny>(schema: T) =>
  z.record(z.string(), schema);

// ---- color.palette (brand/gray/white/...) ----
const ColorScale = StringKeyRecord(TokenLeaf); // e.g., {"600": {...}, "700": {...}}
const ColorFamily = z.union([
  ColorScale, // For scales like gray: { "0": {...}, "900": {...} }
  TokenLeaf,  // For direct tokens like white: { "$type": "color", "$value": "..." }
]);
const ColorPalette = z.object({
  // open-ended families (brand, gray, white, success, etc.)
  // Example file uses brand, gray, white.
  ...({} as Record<string, z.ZodTypeAny>),
}).catchall(ColorFamily);

// ---- color.role (text/bg/accent/on/focus) ----
const ColorRole = z.object({
  // text: default, muted...
  text: z
    .object({
      default: TokenLeaf,
      muted: TokenLeaf,
    })
    .partial()
    .passthrough(),
  // bg: surface...
  bg: z.object({ surface: TokenLeaf }).partial().passthrough(),
  // accent: default, hover...
  accent: z.object({ default: TokenLeaf, hover: TokenLeaf }).partial().passthrough(),
  // on: accent...
  on: z.object({ accent: TokenLeaf }).partial().passthrough(),
  // focus: ring...
  focus: z.object({ ring: TokenLeaf }).partial().passthrough(),
})
  .partial()
  .passthrough();

// ---- color root ----
const ColorRoot = z.object({
  palette: ColorPalette,
  role: ColorRole,
});

// ---- size namespace (spacing, radius, border) ----
const SizeSpacing = StringKeyRecord(TokenLeaf); // {"2": {...}, "4": {...}}
const SizeRadius = StringKeyRecord(TokenLeaf); // {"md": {...}}
const SizeBorder = StringKeyRecord(TokenLeaf); // {"1": {...}}

const SizeRoot = z.object({
  spacing: SizeSpacing,
  radius: SizeRadius,
  border: SizeBorder,
});

// ---- typography namespace ----
const TypographyRoot = z.object({
  font: z.object({ body: TokenLeaf }).partial().passthrough(),
  size: z.object({ body: TokenLeaf }).partial().passthrough(),
  lineHeight: z.object({ body: TokenLeaf }).partial().passthrough(),
});

// ---- motion namespace ----
const MotionRoot = z.object({
  duration: z.object({ fast: TokenLeaf }).partial().passthrough(),
  easing: z.object({ standard: TokenLeaf }).partial().passthrough(),
});

// ---- elevation namespace ----
const ElevationRoot = StringKeyRecord(TokenLeaf); // {"1": {...}, "2": {...}}

/** ---------- Top-level schema ---------- */

export const TokensSchema = z.object({
  color: ColorRoot,
  size: SizeRoot,
  typography: TypographyRoot,
  motion: MotionRoot,
  elevation: ElevationRoot,
});

// Export the TypeScript type you can use in your app/CI.
export type Tokens = z.infer<typeof TokensSchema>;

/** ---------- Example usage ---------- */

// import tokens from "./tokens.example.json";
// const result = TokensSchema.safeParse(tokens);
// if (!result.success) {
//   console.error(JSON.stringify(result.error.format(), null, 2));
//   process.exit(1);
// }
// console.log("✅ tokens.json is valid!");
