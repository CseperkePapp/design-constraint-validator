import { createHash } from 'node:crypto';
import type { TokenNode, TokenValue } from './flatten.js';
import { flattenTokens } from './flatten.js';

export interface PatchChange {
  id: string;
  from: TokenValue | null | undefined;
  to: TokenValue | null | undefined;
  type: 'modify' | 'add' | 'remove';
}

export interface PatchDocument {
  version: 1;
  generatedAt: string; // ISO
  baseFile?: string;
  breakpoint?: string;
  changes: PatchChange[];
  patch: Record<string, TokenValue | null | undefined>; // id -> to value
  hash: string; // sha256 of canonical patch object (patch + ids)
  baseTokensHash?: string; // sha256 of canonical flattened base tokens (id -> value)
  meta?: Record<string, any>;
}

export interface BuildPatchOptions {
  tokens: TokenNode;           // raw hierarchical tokens
  baseFile?: string;           // filename hint
  overrides?: Record<string, any>; // flat override map id->value
  breakpoint?: string;         // reserved for future responsive diffing
  includeUnchanged?: boolean;  // debug flag
}

function canonicalString(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort(), 2);
}

export function applyFlatOverrides(tokens: TokenNode, overrides?: Record<string, any>): void {
  if (!overrides) return;
  for (const [id, val] of Object.entries(overrides)) {
    const parts = id.split('.');
    let cur: any = tokens;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (cur == null || typeof cur !== 'object') break;
      if (!(p in cur)) break;
      if (i === parts.length - 1) {
        const leaf = cur[p];
        if (leaf && typeof leaf === 'object' && Object.prototype.hasOwnProperty.call(leaf, '$value')) {
          if (val === null) {
            // Do not delete here; handled later to keep reference resolution intact.
          } else {
            leaf.$value = val;
          }
        }
      } else {
        cur = cur[p];
      }
    }
  }
}

export function buildPatch(opts: BuildPatchOptions): PatchDocument {
  const cloned = JSON.parse(JSON.stringify(opts.tokens));
  // Flatten original
  const baseFlat = flattenTokens(cloned as any).flat as Record<string, any>;
  // Canonical base tokens hash (id -> value) for drift detection when applying patch later
  const baseFlatValues: Record<string, any> = {};
  Object.keys(baseFlat).sort().forEach(id => { baseFlatValues[id] = baseFlat[id]?.value; });
  const baseTokensHash = createHash('sha256').update(canonicalString(baseFlatValues)).digest('hex');
  // Apply overrides on a fresh clone for diffing
  const modified = JSON.parse(JSON.stringify(opts.tokens));
  const removalIds = new Set<string>();
  if (opts.overrides) {
    for (const [id, v] of Object.entries(opts.overrides)) {
      if (v === null) removalIds.add(id);
    }
  }
  applyFlatOverrides(modified as any, opts.overrides);
  const modFlat = flattenTokens(modified as any).flat as Record<string, any>;
  // Post-process removals: remove from modFlat so diff sees them as missing
  for (const id of removalIds) {
    delete modFlat[id];
  }

  const changes: PatchChange[] = [];
  const patch: Record<string, TokenValue | null | undefined> = {};
  const visited = new Set<string>();
  for (const id of Object.keys(baseFlat)) {
    visited.add(id);
    const before = baseFlat[id]?.value;
    const after = modFlat[id]?.value;
    if (removalIds.has(id)) {
      // Skip here; removal handled later
      continue;
    }
    if (before !== after) {
      changes.push({ id, from: before, to: after, type: 'modify' });
      patch[id] = after;
    } else if (opts.includeUnchanged) {
      changes.push({ id, from: before, to: after, type: 'modify' });
    }
  }
  // Added ids (override referencing unknown id -> treat as add)
  if (opts.overrides) {
    for (const id of Object.keys(opts.overrides)) {
      if (visited.has(id)) continue;
      patch[id] = opts.overrides[id];
      changes.push({ id, from: null, to: opts.overrides[id], type: 'add' });
    }
  }
  // Removed ids (present in base, absent after overrides application)
  for (const id of Object.keys(baseFlat)) {
    if (!(id in modFlat)) {
      const before = baseFlat[id]?.value;
      patch[id] = null;
      changes.push({ id, from: before, to: null, type: 'remove' });
    }
  }
  // Sort deterministic
  changes.sort((a, b) => a.id.localeCompare(b.id));
  const patchSorted: Record<string, any> = {};
  Object.keys(patch).sort().forEach(k => { patchSorted[k] = patch[k]; });
  const hash = createHash('sha256').update(canonicalString(patchSorted)).digest('hex');
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    baseFile: opts.baseFile,
    breakpoint: opts.breakpoint,
    changes,
    patch: patchSorted,
    hash,
  baseTokensHash,
    meta: { changeCount: changes.length }
  };
}
