import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';

function run(cmd: string) { return execSync(cmd, { encoding:'utf8', stdio:'pipe' }); }

describe('validate multi-breakpoint aggregate', () => {
  it('produces TOTAL row and total aggregate in json', () => {
    const out = run('npx tsx ./cli/dcv.ts validate --all-breakpoints --summary json --fail-on off');
    const lines = out.trim().split(/\n+/);
    let parsed: any = null;
    for (let i=0;i<lines.length;i++) {
      const candidate = lines.slice(i).join('\n');
      try { parsed = JSON.parse(candidate); break; } catch { /* continue */ }
    }
    expect(parsed).toBeTruthy();
    expect(Array.isArray(parsed.rows)).toBe(true);
    const totalRow = parsed.rows.find((r:any)=>r.bp==='TOTAL');
    expect(totalRow).toBeTruthy();
    expect(parsed.total).toBeTruthy();
    expect(parsed.total.errors).toBe(totalRow.errors);
  });
});
