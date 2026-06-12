import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * TASK-016 coverage hardening: `dcv set --write` persistence was untested
 * (only the dry-run path had coverage). Drives the shipped CLI from a temp dir.
 */
const cliJs = path.resolve(process.cwd(), 'cli/index.js');

function setup(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'dcv-set-'));
  mkdirSync(path.join(dir, 'tokens'), { recursive: true });
  // The set command requires the id to exist in the base tokens (it suggests &
  // exits otherwise), so seed the default tokens file.
  writeFileSync(
    path.join(dir, 'tokens/tokens.example.json'),
    JSON.stringify({ color: { brand: { $value: '#000000' } } }, null, 2),
  );
  return dir;
}

describe('dcv set --write persistence', () => {
  let dir: string;
  beforeEach(() => {
    dir = setup();
  });
  afterEach(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('--write persists the override to tokens/overrides/local.json', () => {
    execSync(`node "${cliJs}" set color.brand=#abcdef --write`, { cwd: dir, stdio: 'pipe' });
    const localPath = path.join(dir, 'tokens', 'overrides', 'local.json');
    expect(existsSync(localPath)).toBe(true);
    const local = JSON.parse(readFileSync(localPath, 'utf8'));
    expect(local.color.brand.$value).toBe('#abcdef');
  });

  it('dry-run (no --write) does NOT persist', () => {
    execSync(`node "${cliJs}" set color.brand=#abcdef --dry-run`, { cwd: dir, stdio: 'pipe' });
    expect(existsSync(path.join(dir, 'tokens', 'overrides', 'local.json'))).toBe(false);
  });
});
