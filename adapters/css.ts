// adapters/css.ts
export type TokenId = string;
export type TokenValue = string | number;

// Turn a token ID into a CSS custom property name.
// Default: "--dimension-spacing-scale-4" (neutral, reversible).
export type VarMapper = (id: TokenId) => string | null;

export const defaultVarMapper: VarMapper = (id) =>
  `--${id.replace(/[^a-z0-9.]/gi, "-").replace(/\.+/g, "-").toLowerCase()}`;

/**
 * A CSS custom-property value derived from a token must not break out of its
 * declaration (TASK-035 C). `;`, `{`, `}` and comment markers can't appear in a
 * well-formed token value, so strip them — a malformed value can otherwise
 * inject or corrupt sibling declarations.
 */
export function sanitizeCssValue(v: string): string {
  return v.replace(/\/\*|\*\//g, "").replace(/[;{}]/g, "").trim();
}

/**
 * Detect non-injective var mapping (TASK-035 C): `defaultVarMapper` collapses
 * both `.` and other separators to `-`, so distinct ids like `a.b` and `a-b` map
 * to the same `--a-b` and would silently overwrite each other in CSS/JSON/JS.
 * Throw a clear error naming the colliding ids rather than dropping a token.
 */
export function assertNoVarCollisions(ids: Iterable<string>, resolve: (id: string) => string | null): void {
  const seen = new Map<string, string>();
  for (const id of ids) {
    const v = resolve(id);
    if (!v) continue; // intentionally unmapped
    const prev = seen.get(v);
    if (prev !== undefined && prev !== id) {
      throw new Error(
        `Variable name collision: tokens "${prev}" and "${id}" both map to "${v}". ` +
        `Rename one id or provide a manifest with distinct canonicalVar values.`,
      );
    }
    seen.set(v, id);
  }
}

// Manifest driven mapping allowing canonical + legacy aliases.
export type ManifestRow = { id: string; canonicalVar?: string | null; legacyVars?: string[] };

export interface VarMapping { canonical: string; aliases: string[] };

/**
 * Build a mapping of token id -> {canonical, aliases} from an optional manifest.
 * If no manifest provided, falls back to defaultVarMapper with no aliases.
 */
export function buildVarMapping(ids: Iterable<string>, manifest?: ManifestRow[]): Map<string, VarMapping> {
  const map = new Map<string, VarMapping>();
  const byId: Map<string, ManifestRow> = new Map();
  if (manifest) {
    for (const row of manifest) {
      if (!row || !row.id) continue;
      byId.set(row.id, row);
    }
  }
  for (const id of ids) {
    const row = byId.get(id);
  // Always fall back to generated name so canonical is never null.
  const canonical = ((row?.canonicalVar ? row.canonicalVar.trim() : "") || defaultVarMapper(id)) as string;
    const aliasSet = new Set<string>();
    (row?.legacyVars || []).forEach(a => {
      if (!a) return;
      const alias = a.trim();
      if (alias && alias !== canonical) aliasSet.add(alias);
    });
    map.set(id, { canonical, aliases: Array.from(aliasSet) });
  }
  return map;
}

export function makeManifestVarMapper(manifest: ManifestRow[]): VarMapper {
  const byId = new Map<string, string>();
  for (const m of manifest) if (m.canonicalVar) byId.set(m.id, m.canonicalVar);
  return (id) => byId.get(id) ?? defaultVarMapper(id);
}

// Build a CSS block from a map of token IDs to values.
function buildCssBlock(
  values: Record<TokenId, TokenValue>,
  opts: { mapVar?: VarMapper; manifest?: ManifestRow[] }
): string {
  const decls: string[] = [];
  if (opts.manifest) {
    const mapping = buildVarMapping(Object.keys(values), opts.manifest);
    assertNoVarCollisions(Object.keys(values), (id) => mapping.get(id)?.canonical ?? null);
    for (const [id, val] of Object.entries(values)) {
      const m = mapping.get(id);
      if (!m) continue;
      const v = sanitizeCssValue(String(val));
      if (!v) continue;
      decls.push(`${m.canonical}: ${v};`);
      for (const alias of m.aliases) {
        decls.push(`${alias}: var(${m.canonical});`);
      }
    }
  } else {
    const mapVar = opts.mapVar ?? defaultVarMapper;
    assertNoVarCollisions(Object.keys(values), mapVar);
    for (const [id, val] of Object.entries(values)) {
      const cssVar = mapVar(id);
      if (!cssVar) continue; // skip if intentionally unmapped
      const v = sanitizeCssValue(String(val));
      if (v) decls.push(`${cssVar}: ${v};`);
    }
  }
  return decls.join("\n    ");
}

/**
 * Generate CSS for a *full* :root block (use for initial build from flat values).
 */
export function valuesToCss(
  values: Record<TokenId, TokenValue>,
  opts?: { selector?: string; layer?: string; mapVar?: VarMapper; manifest?: ManifestRow[] }
): string {
  const selector = opts?.selector ?? ":root";
  const layer = opts?.layer ?? "tokens";
  const body = buildCssBlock(values, { mapVar: opts?.mapVar, manifest: opts?.manifest });
  return `@layer ${layer} {\n  ${selector} {\n    ${body}\n  }\n}`;
}

/**
 * Generate CSS for a *patch* (small overlay you can inject at runtime).
 */
export function patchToCss(
  patch: Record<TokenId, TokenValue>,
  opts?: { selector?: string; layer?: string; mapVar?: VarMapper; manifest?: ManifestRow[] }
): string {
  const selector = opts?.selector ?? ":root";
  const layer = opts?.layer ?? "tokens-overrides";
  const body = buildCssBlock(patch, { mapVar: opts?.mapVar, manifest: opts?.manifest });
  return `@layer ${layer} {\n  ${selector} {\n    ${body}\n  }\n}`;
}

/**
 * (Browser only) Replace the contents of a <style> element with the given CSS.
 */
export function applyCssToStyleEl(styleEl: { textContent: string | null }, cssText: string) {
  styleEl.textContent = cssText;
}

// NOTE: The design studio -> catalog preview iframe token sync uses a simplified
// :root { --token: value } block (no @layer) built ad-hoc. For a layered build
// prefer valuesToCss / patchToCss helpers above.
