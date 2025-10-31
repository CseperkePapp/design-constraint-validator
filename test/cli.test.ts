import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

function run(cmd: string) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
}

describe('CLI basic commands', () => {
  it('build (json dry-run) outputs JSON', () => {
    const out = run('npx tsx ./cli/dcv.ts build --format json --dry-run');
    const parsed = JSON.parse(out);
    expect(parsed).toBeTruthy();
    expect(typeof parsed).toBe('object');
  });

  it('set single expression dry-run produces patch JSON', () => {
    // Use an existing token id (brand.600 exists in example tokens)
  const out = run('npx tsx ./cli/dcv.ts set color.palette.brand.600=#ffffff --dry-run --quiet');
  const parsed = JSON.parse(out);
    expect(parsed).toBeTruthy();
    // patch output is a JSON object mapping ids -> values
    expect(parsed['color.palette.brand.600']).toBeDefined();
  });

  it('validate exits with code 0 on lenient mode', () => {
    const out = run('npx tsx ./cli/dcv.ts validate --fail-on off --summary json');
    // Output may include logs then a JSON object; capture the first valid JSON block
    const lines = out.trim().split(/\n+/);
    let parsed: any = null;
    for (let i = 0; i < lines.length; i++) {
      const candidate = lines.slice(i).join('\n');
      try {
        parsed = JSON.parse(candidate);
        break;
      } catch {
        continue;
      }
    }
    expect(parsed).toBeTruthy();
    expect(parsed.rows).toBeDefined();
  });

  it('graph dependency json prints nodes/edges', () => {
    const out = run('npx tsx ./cli/dcv.ts graph --format json');
    const parsed = JSON.parse(out);
    expect(Array.isArray(parsed.nodes)).toBe(true);
    expect(Array.isArray(parsed.edges)).toBe(true);
  });

  it.skip('build with manifest mapper applies canonical + legacy vars', () => {
    // Skipped: manifest.example.json removed in cleanup (UI-specific)
    run('npx tsx ./cli/dcv.ts build --format css --mapper examples/manifest.example.json --output dist/test-mapped.css');
    const css = readFileSync('dist/test-mapped.css','utf8');
    expect(css).toMatch(/--color-brand-primary:/);
    expect(css).toMatch(/--brand-primary:/);
    expect(css).toMatch(/--font-size-body:/);
  });

  it('why outputs JSON report', () => {
  // Use an existing token id from example tokens
  const out = run('npx tsx ./cli/dcv.ts why typography.size.h3');
    const parsed = JSON.parse(out);
    expect(parsed.id || parsed.value || parsed.provenance).toBeDefined();
  });

  it('validate fail-on error exits non-zero', () => {
    let code = 0; let stdout = '';
    try { stdout = run('npx tsx ./cli/dcv.ts validate --fail-on error --summary json'); }
    catch (e: any) { code = e.status || e.code || 1; stdout = e.stdout?.toString() || ''; }
    expect(code).toBe(1);
    // Extract JSON summary (last JSON object in stdout)
    const lines = stdout.trim().split(/\n+/);
    let parsed: any = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const candidate = lines.slice(i).join('\n');
      try { parsed = JSON.parse(candidate); break; } catch { /* continue */ }
    }
    expect(parsed).toBeTruthy();
    expect(parsed.rows?.[0]?.errors).toBeGreaterThanOrEqual(1);
  });

  it('validate fail-on off exits zero', () => {
    let code = 0; let stdout = '';
    try { stdout = run('npx tsx ./cli/dcv.ts validate --fail-on off --summary json'); }
    catch (e: any) { code = e.status || e.code || 1; stdout = e.stdout?.toString() || ''; }
    expect(code).toBe(0);
    const lines = stdout.trim().split(/\n+/);
    let parsed: any = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const candidate = lines.slice(i).join('\n');
      try { parsed = JSON.parse(candidate); break; } catch { /* continue */ }
    }
    expect(parsed).toBeTruthy();
    expect(parsed.rows?.[0]?.errors).toBeGreaterThanOrEqual(1);
  });

  it('set unknown id suggests alternatives and exits non-zero', () => {
    let code = 0; let stderr = '';
    try { run('npx tsx ./cli/dcv.ts set color.palette.brand.999=#fff --dry-run --quiet'); }
    catch (e: any) { code = e.status || e.code || 1; stderr = (e.stderr || e.stdout || '').toString(); }
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/Unknown id/);
    expect(stderr).toMatch(/Did you mean/);
  });

  it('patch apply supports removals', () => {
  // Create overrides file (brand.700 -> null removal, brand.600 modified)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('node:fs');
  const overridesPath = 'dist/test-overrides-removal.json';
  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync(overridesPath, JSON.stringify({ 'color.palette.brand.600': '#ffffff', 'color.palette.brand.700': null }, null, 2));
  const patchDoc = run(`npx tsx ./cli/dcv.ts patch --overrides ${overridesPath} --format json --tokens tokens/tokens.example.json`);
    const parsed = JSON.parse(patchDoc);
    expect(parsed.changes.some((c: any) => c.id === 'color.palette.brand.700' && c.type === 'remove')).toBe(true);
    // Write patch doc to temp file then apply
    const tmpPath = 'dist/tmp.patch.json';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('node:fs').writeFileSync(tmpPath, patchDoc);
    const applied = run(`npx tsx ./cli/dcv.ts patch:apply ${tmpPath} --tokens tokens/tokens.example.json --dry-run`);
    const appliedTokens = JSON.parse(applied);
    // Removed token should have no $value -> flatten later would exclude it; here raw tree has brand.700 object but without $value
    expect(appliedTokens.color.palette.brand['700']?.$value).toBeUndefined();
    expect(appliedTokens.color.palette.brand['600']?.$value).toBe('#ffffff');
  }, 10000); // Increase timeout for this test (npx tsx can be slow)
});

