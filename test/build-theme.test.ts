import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildCommand } from '../cli/commands/build.js';
import { setCommand } from '../cli/commands/set.js';

const originalCwd = process.cwd();

function captureLogs() {
  const lines: string[] = [];
  const warnings: string[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  console.log = (message?: unknown, ...optionalParams: unknown[]) => {
    lines.push([message, ...optionalParams].map(String).join(' '));
  };
  console.warn = (message?: unknown, ...optionalParams: unknown[]) => {
    warnings.push([message, ...optionalParams].map(String).join(' '));
  };
  return {
    lines,
    warnings,
    restore() {
      console.log = originalLog;
      console.warn = originalWarn;
    },
  };
}

function setupThemeFixture(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'dcv-build-theme-'));
  mkdirSync(path.join(dir, 'tokens', 'themes'), { recursive: true });
  writeFileSync(
    path.join(dir, 'tokens.json'),
    JSON.stringify(
      {
        color: {
          brand: { $value: '#111111' },
          bg: { $value: '#ffffff' },
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(dir, 'dcv.config.json'),
    JSON.stringify(
      {
        constraints: {
          enableBuiltInWcagDefaults: false,
          enableBuiltInThreshold: false,
          wcag: [
            {
              foreground: 'color.brand',
              background: 'color.bg',
              ratio: 4.5,
              description: 'brand on bg',
            },
          ],
        },
      },
      null,
      2,
    ),
  );
  writeFileSync(
    path.join(dir, 'tokens', 'themes', 'dark.json'),
    JSON.stringify(
      {
        color: {
          brand: { $value: '#eeeeee' },
        },
      },
      null,
      2,
    ),
  );
  return dir;
}

describe('build command theme overlays', () => {
  afterEach(() => {
    process.chdir(originalCwd);
  });

  it('merges nested theme token trees before flattening JSON output', async () => {
    const dir = setupThemeFixture();
    const logs = captureLogs();
    try {
      process.chdir(dir);
      await buildCommand({ tokens: 'tokens.json', theme: 'dark', format: 'json', dryRun: true });
      const output = logs.lines.join('\n');
      const parsed = JSON.parse(output);

      expect(parsed['--color-brand']).toBe('#eeeeee');
      expect(parsed['--color-bg']).toBe('#ffffff');
      expect(parsed['--color']).toBeUndefined();
    } finally {
      logs.restore();
      process.chdir(originalCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not emit object-valued CSS declarations for nested theme overlays', async () => {
    const dir = setupThemeFixture();
    const logs = captureLogs();
    try {
      process.chdir(dir);
      await buildCommand({ tokens: 'tokens.json', theme: 'dark', format: 'css', dryRun: true });
      const output = logs.lines.join('\n');

      expect(output).toContain('--color-brand: #eeeeee;');
      expect(output).toContain('--color-bg: #ffffff;');
      expect(output).not.toContain('[object Object]');
      expect(output).not.toContain('--color:');
    } finally {
      logs.restore();
      process.chdir(originalCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('uses nested theme values when reporting set-command constraint feedback', async () => {
    const dir = setupThemeFixture();
    const logs = captureLogs();
    try {
      process.chdir(dir);
      await setCommand({
        tokens: 'tokens.json',
        theme: 'dark',
        expressions: ['color.bg=#000000'],
        format: 'json',
      });

      expect(logs.warnings.join('\n')).not.toContain('Issues:');
      const jsonStart = logs.lines.findIndex((line) => line.trim().startsWith('{'));
      const parsed = JSON.parse(logs.lines.slice(jsonStart).join('\n'));
      expect(parsed['color.bg']).toBe('#000000');
    } finally {
      logs.restore();
      process.chdir(originalCwd);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
