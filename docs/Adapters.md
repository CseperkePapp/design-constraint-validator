# Adapters & Input Formats

Design Constraint Validator (DCV) is designed to work with multiple JSON token formats by normalizing them into a common internal shape before validation.

This document describes how DCV expects tokens to look, how it treats common ecosystems, and where format-specific behavior lives.

## Internal Token Shape

Internally, DCV works with a flattened map of token IDs to flat token objects:

```ts
type FlatToken = {
  id: string;       // e.g. "color.brand.primary"
  value: unknown;   // final resolved value (after references)
  type?: string;    // optional type metadata (e.g. "color")
  meta?: unknown;   // original metadata preserved as-is
};
```

Flattening is handled by `core/flatten.ts` and applies to any nested JSON object that uses `$value` to mark actual token entries.

### General expectations

- Tokens are nested JSON objects; nesting defines the token ID path.
- `$value` is treated as the definitive value for a token.
- `{$value: "{color.brand.primary}"}` indicates a reference to another token; DCV resolves these before validation.
- Additional fields (`$type`, `description`, etc.) are retained as metadata where relevant but are not required.

## Supported Input Patterns

DCV does not currently auto-detect external formats; instead, it expects data to either:

- Already follow the W3C Design Tokens-like `$value` pattern, or
- Be preprocessed into that shape by your build system or a custom adapter.

The main patterns DCV supports out of the box:

### 1. W3C / DTCG-style tokens

Example (`$value` and optional `$type`):

```json
{
  "color": {
    "brand": {
      "primary": {
        "$value": "#0066cc",
        "$type": "color"
      }
    }
  }
}
```

DCV will flatten this into a `FlatToken` with:

- `id: "color.brand.primary"`
- `value: "#0066cc"`
- `type: "color"`

### 2. Tokens Studio / Similar authoring tools

Many tools export tokens in a shape compatible with `$value` and nested categories. If the export uses `$value` and `{ref}` syntax, DCV can generally work with it directly as long as:

- The top-level file is valid JSON (DCV does not read `.figma` or proprietary formats).
- `$value` holds the actual value (color, size, etc.).
- References use `{path.to.token}` syntax that matches the flattened IDs DCV will derive.

See `examples/tokens-studio/` and `examples/dtcg/` for concrete JSON examples that DCV can validate.

### 3. Style Dictionary

Style Dictionary often uses a `value` property instead of `$value` and may include extra metadata:

```json
{
  "color": {
    "brand": {
      "primary": {
        "value": "#0066cc",
        "type": "color"
      }
    }
  }
}
```

DCV does not currently rename `value` to `$value` automatically. To validate a Style Dictionary export, you have two options:

1. Transform your Style Dictionary output to use `$value` (for example, via a small script in your build pipeline).
2. Export a DTCG-style or “raw tokens” JSON from your tool that already uses `$value`.

The internal adapter modules under `adapters/` (`json.ts`, `css.ts`, `js.ts`) focus on *output* formats (what DCV emits), not on input normalization from Style Dictionary.

## Output Adapters

The `adapters/` folder provides helpers that take the internal flat token map and emit different formats:

- `adapters/json.ts`
  - Emits a simple `{ [id: string]: value }` JSON file.
  - Used by `dcv build --format json` and `--all-formats`.

- `adapters/js.ts`
  - Emits a JavaScript module exporting the tokens (for example `export default { ... }`).

- `adapters/css.ts`
  - Emits a `:root { --token-name: value; }` CSS file using CSS Custom Properties.
  - Uses a default mapping from token IDs to CSS variable names (dots → hyphens).
  - Accepts an optional mapping manifest (`--mapper`) to alias token IDs to custom CSS variable names.

These adapters are purely functional: they accept a flat token map and return strings suitable for writing to disk.

## Mapping Manifests

For CSS/JS output, you can provide a “manifest” (mapper) file that remaps token IDs to other names:

- CLI: `dcv build --format css --mapper path/to/manifest.json`
- Manifest example:

```json
{
  "color.brand.primary": "--brand-primary",
  "typography.size.h1": "--heading-xl"
}
```

This lets you keep canonical token IDs internally while exposing different variable names externally (for example, to preserve backwards-compatible CSS variables).

## When to Write a Custom Adapter

You may want a custom adapter if:

- Your design system stores tokens in a non-JSON format.
- Your JSON structure uses different conventions from `$value` / `{ref}` and you cannot change the export.
- You want DCV to run against tokens that are computed from multiple sources on the fly.

The recommended pattern:

1. Load your source format(s) in your own code.
2. Transform them into a nested JSON object where each token has a `$value`, and references use `{path.to.token}`.
3. Pass that object into DCV’s programmatic API (for example via `flattenTokens` + `validate`).

By keeping input normalization in your own adapter layer, DCV’s core remains focused on constraints and relationships, and your adapter remains free to evolve with your tooling.

