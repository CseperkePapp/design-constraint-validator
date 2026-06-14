import { loadTokens, outputResult } from './utils.js';
import type { PatchApplyOptions } from '../types.js';
import type { TokenNode } from '../../core/flatten.js';
import fs from 'node:fs';
import { computeBaseTokensHash } from '../../core/patch.js';

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
          delete cur[p].$value;
          delete cur[p].$type; // drop the now-orphaned type with the value
          // Remove the node entirely if nothing else remains (no dangling
          // type-only node left behind — TASK-035 D).
          if (Object.keys(cur[p]).length === 0) delete cur[p];
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
  // Parse patch (friendly errors instead of a raw SyntaxError/TypeError — TASK-035 D)
  let raw: string;
  if (fs.existsSync(opts.patch)) {
    raw = fs.readFileSync(opts.patch, 'utf8');
  } else if (opts.patch.trim().startsWith('{')) {
    raw = opts.patch;
  } else {
    throw new Error(`Patch not found: ${opts.patch}`);
  }
  let patchDoc: PatchDocumentV1;
  try {
    patchDoc = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Patch is not valid JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  // Shape validation before use, so a malformed doc gives a clear message rather
  // than "changes is not iterable" / a raw TypeError (TASK-035 D).
  if (!patchDoc || typeof patchDoc !== 'object' || Array.isArray(patchDoc)) {
    throw new Error('Patch document must be a JSON object.');
  }
  if (patchDoc.version !== 1) throw new Error(`Unsupported patch version: ${(patchDoc as any).version}. Expected 1.`);
  if (!Array.isArray(patchDoc.changes)) {
    throw new Error('Patch document is missing a "changes" array.');
  }
  if (patchDoc.baseTokensHash) {
    const currentHash = computeBaseTokensHash(tokens);
    if (currentHash !== patchDoc.baseTokensHash) {
      console.warn(`⚠ Base tokens hash mismatch. Patch built against ${patchDoc.baseTokensHash} but current base is ${currentHash}. Proceeding (use --dry-run to inspect first).`);
    }
  }

  // Apply changes
  for (const c of patchDoc.changes) {
    applyChange(tokens, c.id, c.to, c.type);
  }

  // Read both forms: kebab from the CLI (camel-case-expansion off) and camelCase
  // from programmatic callers. Reading only opts.dryRun was dead for the CLI, so
  // `--dry-run --output` silently wrote the file (TASK-024).
  if (opts['dry-run'] ?? opts.dryRun) {
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
