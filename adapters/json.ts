// adapters/json.ts
import { buildVarMapping, defaultVarMapper, type ManifestRow } from './css.js';

export function emitJSON(values: Record<string, any>, manifest?: ManifestRow[]): string {
  const ids = Object.keys(values).sort();
  let mapping: Map<string, { canonical: string; aliases: string[] }> | undefined;
  if (manifest) mapping = buildVarMapping(ids, manifest);
  const out: Record<string, any> = {};
  for (const id of ids) {
    const canonical = mapping ? mapping.get(id)!.canonical : defaultVarMapper(id);
    if (canonical) out[canonical] = values[id];
  }
  return JSON.stringify(out, null, 2) + '\n';
}
// adapters/json.ts
import type { TokenId, TokenValue, FlatToken } from '../core/flatten';

/**
 * Generates a JSON representation of the entire token set and dependency graph.
 */
export function valuesToJson(data: {
  flat: Record<TokenId, FlatToken>;
  edges: [TokenId, TokenId][];
}): string {
  const values = Object.fromEntries(Object.entries(data.flat).map(([id, token]) => [id, token.value]));
  const edges = data.edges.map(([from, to]) => ({ from, to }));

  return JSON.stringify({
    tokens: values,
    edges: edges,
  }, null, 2);
}

/**
 * Generates a JSON representation of a patch from an engine commit.
 */
export function patchToJson(patch: {
  patch: Record<TokenId, TokenValue>;
  affected: TokenId[];
}): string {
  return JSON.stringify({
    changed: patch.patch,
    affected: patch.affected,
  }, null, 2);
}
