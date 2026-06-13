import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * TASK-022: `graph` and `why` must honor the same token/config/constraints-dir
 * controls as `validate`, and fail clearly on explicitly-requested files that are
 * missing/malformed — never silently fall back to repo defaults.
 *
 * Driven from a temp cwd OUTSIDE the repo so nothing leaks in from the repo's own
 * themes/ or tokens/. Uses the built CLI artifact (cli/index.js); CI builds first.
 */
const cliJs = path.resolve(process.cwd(), 'cli/index.js');

const TOKENS = {
  typography: { size: { h1: { $value: '1rem' }, h2: { $value: '2rem' } } },
};
// typography.size.h1 (16px) >= typography.size.h2 (32px) is violated.
const ORDER = { order: [['typography.size.h1', '>=', 'typography.size.h2']] };
const CONFIG = { constraints: { enableBuiltInWcagDefaults: false, enableBuiltInThreshold: false } };

function runCli(dir: string, args: string): { status: number; stdout: string; stderr: string } {
  try {
    const stdout = execSync(`node "${cliJs}" ${args}`, {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      status: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

describe('TASK-022: graph / why CLI parity with validate', () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'dcv-parity-'));
    mkdirSync(path.join(dir, 'policy'), { recursive: true });
    mkdirSync(path.join(dir, 'empty'), { recursive: true });
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(TOKENS, null, 2));
    writeFileSync(path.join(dir, 'policy', 'typography.order.json'), JSON.stringify(ORDER, null, 2));
    writeFileSync(path.join(dir, 'cfg.json'), JSON.stringify(CONFIG, null, 2));
    writeFileSync(path.join(dir, 'bad.json'), '{ not valid json');
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  // --- graph ---------------------------------------------------------------

  it('graph --hasse reads the order file from --constraints-dir', () => {
    const r = runCli(dir, 'graph --hasse typography --constraints-dir policy --tokens tokens.json');
    // The temp cwd has no themes/ dir, so success proves the custom dir was used.
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('Wrote');
  });

  it('graph --hasse fails clearly when the order file is missing in --constraints-dir', () => {
    const r = runCli(dir, 'graph --hasse typography --constraints-dir empty --tokens tokens.json');
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('Order constraint file not found');
  });

  it('graph --hasse fails clearly on an explicit but invalid --config', () => {
    const r = runCli(dir, 'graph --hasse typography --constraints-dir policy --tokens tokens.json --highlight-violations --config bad.json');
    expect(r.status).not.toBe(0);
  });

  it('graph --highlight-violations is actually wired (not silently ignored)', () => {
    // Regression guard: under camel-case-expansion off, graph used to read these
    // flags in camelCase and silently ignore them. The suffix proves it engaged.
    const r = runCli(dir, 'graph --hasse typography --constraints-dir policy --tokens tokens.json --highlight-violations --config cfg.json');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('highlight-violations');
  });

  // --- why -----------------------------------------------------------------

  it('why surfaces a constraint summary from --constraints-dir', () => {
    const r = runCli(dir, 'why typography.size.h1 --config cfg.json --constraints-dir policy --tokens tokens.json --format json');
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('monotonic');
  });

  it('why does not invent a constraint summary from an empty --constraints-dir', () => {
    const r = runCli(dir, 'why typography.size.h1 --config cfg.json --constraints-dir empty --tokens tokens.json --format json');
    expect(r.status).toBe(0);
    expect(r.stdout).not.toContain('monotonic');
  });

  it('why fails clearly on an explicit but invalid --config', () => {
    const r = runCli(dir, 'why typography.size.h1 --config bad.json --tokens tokens.json');
    expect(r.status).not.toBe(0);
  });

  it('why fails clearly when an explicit --tokens file is missing', () => {
    const r = runCli(dir, 'why typography.size.h1 --tokens does-not-exist.json');
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('not found');
  });
}, 30000);
