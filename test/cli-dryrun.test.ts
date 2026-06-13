import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * TASK-024: --dry-run must never write files. The CLI runs with
 * camel-case-expansion off, and several commands read `--dry-run` under a
 * camelCase alias that is always undefined — so dry-run was silently dead and
 * these commands wrote anyway. Driven from a temp cwd via the built CLI.
 */
const cliJs = path.resolve(process.cwd(), 'cli/index.js');
const TOKENS = { color: { a: { $value: '#111111' } } };
const PATCH = {
  version: 1,
  changes: [{ id: 'color.a', from: '#111111', to: '#222222', type: 'modify' }],
  patch: { 'color.a': '#222222' },
};

function runCli(dir: string, args: string): { status: number; stdout: string } {
  try {
    const stdout = execSync(`node "${cliJs}" ${args}`, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer | string };
    return { status: err.status ?? 1, stdout: err.stdout?.toString() ?? '' };
  }
}

describe('TASK-024: --dry-run writes nothing', () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'dcv-dryrun-'));
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(TOKENS, null, 2));
    writeFileSync(path.join(dir, 'patch.json'), JSON.stringify(PATCH, null, 2));
  });

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('build --all-formats --dry-run prints all formats and writes no files', () => {
    const r = runCli(dir, 'build --all-formats --dry-run --tokens tokens.json');
    expect(r.status).toBe(0);
    expect(existsSync(path.join(dir, 'dist', 'tokens.css'))).toBe(false);
    expect(existsSync(path.join(dir, 'dist', 'tokens.json'))).toBe(false);
    expect(existsSync(path.join(dir, 'dist', 'tokens.js'))).toBe(false);
    expect(r.stdout).toMatch(/--color-a|color\.a/); // some rendered output reached stdout
  });

  it('build --format css --dry-run writes no file', () => {
    const r = runCli(dir, 'build --format css --dry-run --tokens tokens.json --output dist/out.css');
    expect(r.status).toBe(0);
    expect(existsSync(path.join(dir, 'dist', 'out.css'))).toBe(false);
  });

  it('patch:apply --dry-run --output writes no file and prints the result', () => {
    const r = runCli(dir, 'patch:apply patch.json --tokens tokens.json --dry-run --output out.json');
    expect(r.status).toBe(0);
    expect(existsSync(path.join(dir, 'out.json'))).toBe(false);
    expect(r.stdout).toContain('color');
  });

  it('set --write --dry-run does not persist the override file', () => {
    const r = runCli(dir, 'set color.a=#222222 --write --dry-run --tokens tokens.json');
    expect(r.status).toBe(0);
    expect(existsSync(path.join(dir, 'tokens', 'overrides', 'local.json'))).toBe(false);
  });

  it('set --dry-run --output writes no file and prints the patch to stdout', () => {
    // Output name must not collide with the beforeAll fixtures (tokens.json/patch.json).
    // (The batch --json path shares the identical dry-run guard; not exercised here
    // because embedding JSON on the command line isn't portable across test shells.)
    const r = runCli(dir, 'set color.a=#222222 --dry-run --output set-out.json --tokens tokens.json');
    expect(r.status).toBe(0);
    expect(existsSync(path.join(dir, 'set-out.json'))).toBe(false);
    expect(r.stdout).toContain('color.a');
  });

  it('build --format json --dry-run creates no output directory', () => {
    const r = runCli(dir, 'build --format json --dry-run --tokens tokens.json');
    expect(r.status).toBe(0);
    // dry-run is a pure read: not even the dist/ dir should be created.
    expect(existsSync(path.join(dir, 'dist'))).toBe(false);
  });
}, 30000);
