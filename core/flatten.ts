import { normalizeDtcgValue } from "./dtcg.js";

export type TokenId = string; // e.g. "color.palette.brand.600"
export type TokenValue = string | number;
// $value may also be a DTCG 2025.10 structured object (color / dimension); it is
// normalized to a TokenValue at ingestion. See normalizeDtcgValue.
export type DtcgStructuredValue = Record<string, unknown>;
export type TokenNode = {
  $type?: string;
  $value?: TokenValue | DtcgStructuredValue;
  $extensions?: DtcgStructuredValue; // spec passthrough — preserved, never interpreted
  [k: string]: TokenNode | string | number | DtcgStructuredValue | undefined;
};

export type FlatToken = {
  id: TokenId;
  type: string;
  value: TokenValue;       // resolved (if ref)
  raw: TokenValue | DtcgStructuredValue; // original $value
  refs: TokenId[];         // referenced token IDs found in raw
};

export type FlattenResult = {
  flat: Record<TokenId, FlatToken>;
  edges: Array<[from: TokenId, to: TokenId]>; // from ref -> to dependent
};

const REF_RE = /\{([a-z0-9_.-]+)\}/gi;
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function flattenTokens(root: TokenNode): FlattenResult {
  const flat: Record<TokenId, FlatToken> = {};
  const edges: Array<[TokenId, TokenId]> = [];

  // First pass: collect all tokens
  function walk(node: TokenNode, path: string[] = []) {
    if (!node || typeof node !== 'object') return;
    
    if (Object.prototype.hasOwnProperty.call(node, '$value')) {
      const id = path.join('.');
      if (node.$value === undefined) return; // Skip tokens without values
      // Normalize DTCG 2025.10 structured color/dimension objects to the
      // string/number form the engine + plugins expect (strings, incl. aliases,
      // pass through unchanged). Keeps the color math in core/color.ts untouched.
      const raw = node.$value;
      const normalized = normalizeDtcgValue(raw, node.$type);

      const refs: TokenId[] = [];
      
      // Find all references in the value
      if (typeof normalized === 'string') {
        const matches = normalized.matchAll(REF_RE);
        for (const match of matches) {
          refs.push(match[1]);
        }
      }
      
      flat[id] = { 
        id, 
        type: String(node.$type ?? 'unknown'), 
        value: normalized,
        raw, 
        refs 
      };
      
      // Add edges for dependencies
      refs.forEach(refId => edges.push([refId, id]));
      return;
    }
    
    // Recursively walk children
    for (const key of Object.keys(node)) {
      if (key.startsWith('$')) continue;
      const child = node[key];
      if (typeof child === 'object' && child !== null) {
        walk(child as TokenNode, path.concat(key));
      }
    }
  }

  walk(root);

  // Second pass: resolve references iteratively
  let changed = true;
  let iterations = 0;
  const maxIterations = Object.keys(flat).length * 2 + 1; // Safety limit (never 0)

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    for (const token of Object.values(flat)) {
      if (typeof token.value === 'string' && token.value.includes('{')) {
        let newValue = token.value;
        let fullyResolved = true;
        
        for (const refId of token.refs) {
          const refToken = flat[refId];
          if (!refToken) {
            throw new Error(`Could not resolve token ${refId}`);
          }
          
          // If the referenced token still has unresolved refs, skip this iteration
          if (typeof refToken.value === 'string' && refToken.value.includes('{')) {
            fullyResolved = false;
            break;
          }
          
          // Replace the reference with the resolved value
          const refPattern = new RegExp(`\\{${escapeRegExp(refId)}\\}`, 'g');
          newValue = newValue.replace(refPattern, String(refToken.value));
        }
        
        if (fullyResolved && newValue !== token.value) {
          token.value = newValue;
          changed = true;
        }
      }
    }
  }
  
  // A token still carrying an unresolved "{ref}" placeholder after the fixpoint
  // means a genuine cycle (a -> b -> a) or a self-reference. An empty or
  // fully-literal token set resolves cleanly and must never trip this guard —
  // the old `iterations >= maxIterations` check threw a bogus "circular
  // reference" error whenever no tokens were found (maxIterations === 0).
  const unresolved = Object.values(flat).filter(
    (t) => typeof t.value === 'string' && t.value.includes('{'),
  );
  if (unresolved.length > 0) {
    throw new Error(
      `Token resolution exceeded maximum iterations - possible circular reference (unresolved: ${unresolved
        .map((t) => t.id)
        .join(', ')})`,
    );
  }

  return { flat, edges };
}
