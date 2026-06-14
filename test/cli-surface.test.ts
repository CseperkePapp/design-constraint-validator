import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * TASK-032: flags/commands that were read or documented but unregistered are
 * rejected by yargs `.strict()` before the handler. These guard the registrations
 * (and the `set [expressions..]` optional positional) end-to-end via the CLI.
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

describe('TASK-032: CLI surface (registered flags + set arity)', () => {
  let dir: string;
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'dcv-surface-'));
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify({ color: { a: { $value: '#111' }, b: { $value: '{color.a}' } } }));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('--version reports the package version (not "unknown")', () => {
    const { version } = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    const r = run(dir, '--version');
    expect(r.status).toBe(0);
    expect(r.out.trim()).toBe(version);
  });

  it('set --unset reaches the handler (optional positional)', () => {
    const r = run(dir, 'set --unset color.a --tokens tokens.json --dry-run');
    expect(r.status).toBe(0);
    expect(r.out).not.toContain('Not enough non-option arguments');
  });

  it('graph --filter is accepted (not an unknown argument)', () => {
    const r = run(dir, 'graph --filter color --tokens tokens.json --format json');
    expect(r.status).toBe(0);
    expect(r.out).not.toContain('Unknown argument');
  });

  it('graph --breakpoint is accepted', () => {
    const r = run(dir, 'graph --breakpoint sm --tokens tokens.json --format json');
    expect(r.status).toBe(0);
    expect(r.out).not.toContain('Unknown argument');
  });
}, 30000);

/**
 * TASK-035 Group B: CLI consistency — no false-green on a typo'd breakpoint,
 * clean exit-2 (not a raw stack trace) on IO errors, and a parseable --summary json.
 */
describe('TASK-035 B: CLI consistency', () => {
  let dir: string;
  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'dcv-cliB-'));
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify({ color: { a: { $value: '#111' }, b: { $value: '#222' } } }));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('rejects an unknown --breakpoint instead of silently validating (false green)', () => {
    const r = run(dir, 'validate --breakpoint nope --tokens tokens.json --fail-on off');
    expect(r.status).not.toBe(0);
    expect(r.out).toMatch(/Invalid|Choices|breakpoint/i);
  });

  it('patch:apply on a missing file exits 2 with a clean message, not a raw stack trace', () => {
    const r = run(dir, 'patch:apply does-not-exist.json --tokens tokens.json');
    expect(r.status).toBe(2);
    expect(r.out).toMatch(/not found/i);
    expect(r.out).not.toMatch(/\bat .+:\d+:\d+\)/); // no JS stack frames
  });

  it('--summary json emits parseable JSON on stdout (no banner / per-issue noise)', () => {
    const out = execSync(`node "${cliJs}" validate --tokens tokens.json --summary json --fail-on off`, {
      cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], // stdout only
    });
    const parsed = JSON.parse(out); // throws if stdout is polluted
    expect(parsed).toHaveProperty('rows');
  });
}, 30000);
