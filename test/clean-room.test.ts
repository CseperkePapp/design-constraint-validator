import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validate } from '../core/index.js';

/**
 * The boundary test that would have caught the v2.0.x "--tokens is silently
 * ignored" bug: a stranger in an empty directory validates THEIR OWN tokens file
 * with THEIR OWN constraints and gets correct violations and exit codes.
 *
 * The CLI is driven from a temp dir OUTSIDE the repo tree, so nothing leaks in
 * from the repo's own tokens/ or themes/.
 */

// Drive the SHIPPED CLI artifact (cli/index.js) from an external cwd — this is the
// published-package entry point, so the test exercises exactly what users run.
// Assumes the project is built (npm run build / prepublishOnly); CI builds first.
const cliJs = path.resolve(process.cwd(), 'cli/index.js');

// Custom token ids that do NOT exist in the repo defaults. #888 on #999 ≈ 1.24:1.
const TOKENS = {
  myapp: { color: { text: { $value: '#888888' }, bg: { $value: '#999999' } } },
};
const CONFIG = {
  constraints: {
    enableBuiltInWcagDefaults: false,
    enableBuiltInThreshold: false,
    wcag: [{ foreground: 'myapp.color.text', background: 'myapp.color.bg', ratio: 4.5, description: 'text on bg' }],
  },
};

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

describe('clean-room: validate a foreign tokens file with foreign constraints', () => {
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'dcv-cleanroom-'));
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(TOKENS, null, 2));
    writeFileSync(path.join(dir, 'dcv.config.json'), JSON.stringify(CONFIG, null, 2));
  });

  afterAll(() => {
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it('--tokens: reads the custom file, reports the custom-id violation, exits non-zero', () => {
    const { status, stdout } = runCli(dir, 'validate --tokens tokens.json --format json');
    expect(status).not.toBe(0);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(false);
    expect(result.counts.violations).toBe(1);
    // Proves the custom file was actually read (this id exists only in tokens.json).
    expect(JSON.stringify(result.violations)).toContain('myapp.color.text');
  });

  it('positional form (validate <tokens>) produces the same result', () => {
    const { status, stdout } = runCli(dir, 'validate tokens.json --format json');
    expect(status).not.toBe(0);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result.violations)).toContain('myapp.color.text');
  });

  it('nonexistent tokens path -> non-zero exit and a clear error', () => {
    const { status, stderr, stdout } = runCli(dir, 'validate --tokens does-not-exist.json');
    expect(status).not.toBe(0);
    expect(`${stderr}${stdout}`).toContain('Tokens file not found');
  });

  it('receipt references the genuinely validated file', () => {
    runCli(dir, 'validate --tokens tokens.json --format json --receipt receipt.json');
    const receiptPath = path.join(dir, 'receipt.json');
    expect(existsSync(receiptPath)).toBe(true);
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    expect(receipt.inputs.tokensFile).toBe('tokens.json');
  });

  it('a file matching no constraint is not a silent pass (emits a note)', () => {
    // No config flag here, so built-in defaults apply; their ids are absent from
    // this foreign file, so nothing matches and the note must fire.
    const noteDir = mkdtempSync(path.join(tmpdir(), 'dcv-nomatch-'));
    try {
      writeFileSync(path.join(noteDir, 'tokens.json'), JSON.stringify(TOKENS));
      const { stdout } = runCli(noteDir, 'validate --tokens tokens.json --format json --constraints-dir __none__');
      const result = JSON.parse(stdout);
      expect(result.note).toBeTruthy();
      expect(result.note).toContain('nothing was checked');
    } finally {
      rmSync(noteDir, { recursive: true, force: true });
    }
  });

  it('--config reads an explicit JSON config file', () => {
    const configPath = path.join(dir, 'custom-config.json');
    writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));

    const { status, stdout } = runCli(dir, 'validate --tokens tokens.json --config custom-config.json --format json');
    expect(status).not.toBe(0);
    const result = JSON.parse(stdout);
    expect(JSON.stringify(result.violations)).toContain('myapp.color.text');
  });

  it('missing --config path exits non-zero with a clear error', () => {
    const { status, stderr, stdout } = runCli(dir, 'validate --tokens tokens.json --config missing-config.json');
    expect(status).not.toBe(0);
    expect(`${stderr}${stdout}`).toContain('Config file not found: missing-config.json');
  });

  it('.dcvrc.json is discovered when dcv.config.json is absent', () => {
    const rcDir = mkdtempSync(path.join(tmpdir(), 'dcv-rc-'));
    try {
      writeFileSync(path.join(rcDir, 'tokens.json'), JSON.stringify(TOKENS, null, 2));
      writeFileSync(path.join(rcDir, '.dcvrc.json'), JSON.stringify(CONFIG, null, 2));

      const { status, stdout } = runCli(rcDir, 'validate --tokens tokens.json --format json');
      expect(status).not.toBe(0);
      const result = JSON.parse(stdout);
      expect(JSON.stringify(result.violations)).toContain('myapp.color.text');
    } finally {
      rmSync(rcDir, { recursive: true, force: true });
    }
  });

  it('package.json "dcv" config is discovered when standalone config files are absent', () => {
    const pkgDir = mkdtempSync(path.join(tmpdir(), 'dcv-pkg-'));
    try {
      writeFileSync(path.join(pkgDir, 'tokens.json'), JSON.stringify(TOKENS, null, 2));
      writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({ name: 'fixture', dcv: CONFIG }, null, 2));

      const { status, stdout } = runCli(pkgDir, 'validate --tokens tokens.json --format json');
      expect(status).not.toBe(0);
      const result = JSON.parse(stdout);
      expect(JSON.stringify(result.violations)).toContain('myapp.color.text');
    } finally {
      rmSync(pkgDir, { recursive: true, force: true });
    }
  });
});

describe('clean-room: programmatic validate() wrapper', () => {
  it('inline tokens + inline constraints reports the custom failing pair', () => {
    const r = validate({
      tokens: TOKENS,
      constraints: CONFIG.constraints,
      constraintsDir: '__none__',
    });
    expect(r.ok).toBe(false);
    expect(r.counts.violations).toBe(1);
    expect(r.violations[0].ruleId).toBe('wcag-contrast');
  });

  it('no constraints -> ok with a no-match note (never a silent pass)', () => {
    const r = validate({ tokens: TOKENS, constraintsDir: '__none__' });
    expect(r.ok).toBe(true);
    expect(r.note).toContain('nothing was checked');
  });

  it('missing tokens path throws a clear error', () => {
    expect(() => validate({ tokensPath: 'does-not-exist.json' })).toThrow(/Tokens file not found/);
  });
});
