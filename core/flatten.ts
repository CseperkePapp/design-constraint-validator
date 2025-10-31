export type TokenId = string; // e.g. "color.palette.brand.600"
export type TokenValue = string | number;
export type TokenNode = { 
  $type?: string; 
  $value?: TokenValue; 
  [k: string]: TokenNode | string | number | undefined;
};

export type FlatToken = {
  id: TokenId;
  type: string;
  value: TokenValue;       // resolved (if ref)
  raw: TokenValue;         // original $value
  refs: TokenId[];         // referenced token IDs found in raw
};

export type FlattenResult = {
  flat: Record<TokenId, FlatToken>;
  edges: Array<[from: TokenId, to: TokenId]>; // from ref -> to dependent
};

const REF_RE = /\{([a-z0-9.-]+)\}/gi;

export function flattenTokens(root: TokenNode): FlattenResult {
  const flat: Record<TokenId, FlatToken> = {};
  const edges: Array<[TokenId, TokenId]> = [];

  // First pass: collect all tokens
  function walk(node: TokenNode, path: string[] = []) {
    if (!node || typeof node !== 'object') return;
    
    if (Object.prototype.hasOwnProperty.call(node, '$value')) {
      const id = path.join('.');
      const raw = node.$value;
      if (raw === undefined) return; // Skip tokens without values
      
      const refs: TokenId[] = [];
      
      // Find all references in the value
      if (typeof raw === 'string') {
        const matches = raw.matchAll(REF_RE);
        for (const match of matches) {
          refs.push(match[1]);
        }
      }
      
      flat[id] = { 
        id, 
        type: String(node.$type ?? 'unknown'), 
        value: raw,
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
  const maxIterations = Object.keys(flat).length * 2; // Safety limit
  
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
          const refPattern = new RegExp(`\\{${refId}\\}`, 'g');
          newValue = newValue.replace(refPattern, String(refToken.value));
        }
        
        if (fullyResolved && newValue !== token.value) {
          token.value = newValue;
          changed = true;
        }
      }
    }
  }
  
  if (iterations >= maxIterations) {
    throw new Error('Token resolution exceeded maximum iterations - possible circular reference');
  }

  return { flat, edges };
}
