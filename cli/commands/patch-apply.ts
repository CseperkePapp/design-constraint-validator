import { loadTokens, outputResult } from './utils.js';
import type { PatchApplyOptions } from '../types.js';
import type { TokenNode } from '../../core/flatten.js';
import fs from 'node:fs';
import { flattenTokens } from '../../core/flatten.js';
import { createHash } from 'node:crypto';

interface PatchDocumentV1 {
  version: 1;
  changes: Array<{ id: string; from: any; to: any; type: 'modify'|'add'|'remove' }>;
  patch: Record<string, any>;
  baseTokensHash?: string;
}

function applyChange(root: any, id: string, to: any, type: 'modify'|'add'|'remove') {
  const parts = id.split('.');
  let cur: any = root;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      if (type === 'remove') {
        if (cur[p] && typeof cur[p] === 'object') {
          delete cur[p].$value; // delete leaf value
        }
      } else {
        if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
        cur[p].$value = to;
      }
    } else {
      if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
  }
}

export async function patchApplyCommand(opts: PatchApplyOptions): Promise<void> {
  const tokens: TokenNode = loadTokens(opts.tokens || 'tokens/tokens.example.json');
  // Compute current base tokens hash for drift detection (same logic as buildPatch)
  function computeBaseHash(toks: TokenNode): string {
    const flat = flattenTokens(JSON.parse(JSON.stringify(toks))).flat as Record<string, any>;
    const values: Record<string, any> = {};
    Object.keys(flat).sort().forEach(id => { values[id] = flat[id]?.value; });
    // Keep deterministic ordering
    const ordered = Object.keys(values).sort().reduce((acc, k) => { acc[k] = values[k]; return acc; }, {} as Record<string, any>);
    return createHash('sha256').update(JSON.stringify(ordered)).digest('hex');
  }
  // Parse patch
  let patchDoc: PatchDocumentV1;
  if (fs.existsSync(opts.patch)) {
    patchDoc = JSON.parse(fs.readFileSync(opts.patch, 'utf8'));
  } else if (opts.patch.trim().startsWith('{')) {
    patchDoc = JSON.parse(opts.patch);
  } else {
    throw new Error(`Patch not found: ${opts.patch}`);
  }
  if (patchDoc.version !== 1) throw new Error('Unsupported patch version');
  if (patchDoc.baseTokensHash) {
    const currentHash = computeBaseHash(tokens);
    if (currentHash !== patchDoc.baseTokensHash) {
      console.warn(`⚠ Base tokens hash mismatch. Patch built against ${patchDoc.baseTokensHash} but current base is ${currentHash}. Proceeding (use --dry-run to inspect first).`);
    }
  }

  // Apply changes
  for (const c of patchDoc.changes) {
    applyChange(tokens, c.id, c.to, c.type);
  }

  if (opts.dryRun) {
    outputResult(tokens, 'json');
    return;
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, JSON.stringify(tokens, null, 2));
    if (!opts.quiet) console.log(`✔ Patch applied to ${opts.output}`);
  } else {
    outputResult(tokens, 'json');
  }
}
