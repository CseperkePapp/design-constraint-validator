import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

/**
 * TASK-025: `why` and `graph --hasse` overlays are theme- and breakpoint-aware
 * (values change with theme/bp); the plain dependency graph is value-independent.
 */
const cliJs = path.resolve(process.cwd(), 'cli/index.js');
function run(dir: string, args: string): { status: number; out: string } {
  try {
    return { status: 0, out: execSync(`node "${cliJs}" ${args}`, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (e) {
    const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return { status: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}
function setup(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'dcv-t25-'));
  writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify({
    typography: { size: { body: { $value: '16px' }, h1: { $value: '20px' } } },
  }));
  mkdirSync(path.join(dir, 'tokens', 'themes'), { recursive: true });
  writeFileSync(path.join(dir, 'tokens', 'themes', 'dark.json'), JSON.stringify({
    typography: { size: { h1: { $value: '10px' } } }, // h1 < body → cross-rule violation when themed
  }));
  mkdirSync(path.join(dir, 'tokens', 'overrides'), { recursive: true });
  writeFileSync(path.join(dir, 'tokens', 'overrides', 'sm.json'), JSON.stringify({
    typography: { size: { h1: { $value: '12px' } } },
  }));
  mkdirSync(path.join(dir, 'themes'), { recursive: true });
  writeFileSync(path.join(dir, 'themes', 'typography.order.json'), JSON.stringify({ order: [['typography.size.h1', '>=', 'typography.size.body']] }));
  return dir;
}

describe('TASK-025: why theme/breakpoint awareness', () => {
  it('why --theme resolves the themed value and labels theme provenance', () => {
    const dir = setup();
    try {
      const r = run(dir, 'why typography.size.h1 --theme dark --tokens tokens.json --format json');
      expect(r.status).toBe(0);
      const report = JSON.parse(r.out);
      expect(String(report.value)).toBe('10px');
      expect(report.provenance).toBe('theme');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('why --breakpoint reflects the breakpoint override', () => {
    const dir = setup();
    try {
      const r = run(dir, 'why typography.size.h1 --breakpoint sm --tokens tokens.json --format json');
      expect(r.status).toBe(0);
      expect(String(JSON.parse(r.out).value)).toBe('12px');
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('why --theme fails closed on a missing theme file', () => {
    const dir = setup();
    try {
      const r = run(dir, 'why typography.size.h1 --theme nope --tokens tokens.json --format json');
      expect(r.status).not.toBe(0);
      expect(r.out).toMatch(/theme/i);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('TASK-025: graph theme awareness', () => {
  it('graph --hasse --highlight-violations --theme runs and emits output (themed values)', () => {
    const dir = setup();
    try {
      const r = run(dir, 'graph --hasse typography --highlight-violations --theme dark --constraints-dir themes --tokens tokens.json --format mermaid');
      expect(r.status).toBe(0);
      expect(existsSync(path.join(dir, 'dist', 'graphs'))).toBe(true);
      expect(readdirSync(path.join(dir, 'dist', 'graphs')).some((f) => f.includes('typography') && f.endsWith('.mmd'))).toBe(true);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  it('plain dependency graph is unchanged by --theme', () => {
    const dir = setup();
    try {
      const plain = run(dir, 'graph --format json --tokens tokens.json');
      const themed = run(dir, 'graph --format json --theme dark --tokens tokens.json');
      expect(plain.status).toBe(0);
      expect(themed.out).toBe(plain.out); // structure is value-independent
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
}, 30000);
