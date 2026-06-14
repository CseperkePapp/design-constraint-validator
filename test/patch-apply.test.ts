import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildPatch, computeBaseTokensHash } from '../core/patch.js';

/**
 * TASK-035 Group D: patch round-trip correctness.
 */
const cliJs = path.resolve(process.cwd(), 'cli/index.js');
function run(dir: string, args: string): { status: number; out: string } {
  try {
    const out = execSync(`node "${cliJs}" ${args}`, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return { status: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('TASK-035 D: baseTokensHash agrees between build and apply', () => {
  it('buildPatch stamps the same hash patch:apply recomputes (no false drift warning)', () => {
    const tokens = { color: { a: { $value: '#111', $type: 'color' }, b: { $value: '#222', $type: 'color' } } };
    const doc = buildPatch({ tokens });
    expect(doc.baseTokensHash).toBe(computeBaseTokensHash(tokens));
  });
});

describe('TASK-035 D: patch:apply validates shape with friendly errors', () => {
  it('a patch missing "changes" fails clearly (not a raw TypeError)', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dcv-patchD-'));
    try {
      writeFileSync(path.join(dir, 't.json'), JSON.stringify({ color: { a: { $value: '#111' } } }));
      writeFileSync(path.join(dir, 'bad.json'), JSON.stringify({ version: 1 })); // no changes[]
      const r = run(dir, 'patch:apply bad.json --tokens t.json --dry-run');
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/changes/i);
      expect(r.out).not.toMatch(/\bat .+:\d+:\d+\)/); // no raw stack
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('TASK-035 D: remove leaves no dangling type-only node', () => {
  it('removing a token deletes the whole node, not just $value', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'dcv-patchRm-'));
    try {
      writeFileSync(path.join(dir, 't.json'), JSON.stringify({ color: { a: { $value: '#111', $type: 'color' }, b: { $value: '#222', $type: 'color' } } }));
      writeFileSync(path.join(dir, 'p.json'), JSON.stringify({ version: 1, changes: [{ id: 'color.a', from: '#111', to: null, type: 'remove' }], patch: { 'color.a': null } }));
      const r = run(dir, 'patch:apply p.json --tokens t.json --dry-run');
      expect(r.status).toBe(0);
      const result = JSON.parse(r.out);
      expect(result.color.a).toBeUndefined(); // node gone, no { $type } left behind
      expect(result.color.b).toBeDefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}, 30000);
