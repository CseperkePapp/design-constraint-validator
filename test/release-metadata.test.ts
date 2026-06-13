import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function readJson(relPath: string): any {
  return JSON.parse(readFileSync(path.join(process.cwd(), relPath), 'utf8'));
}

describe('release metadata', () => {
  it('keeps the MCP server manifest aligned with package metadata', () => {
    const pkg = readJson('package.json');
    const server = readJson('server.json');

    expect(server.name).toBe(pkg.mcpName);
    expect(server.version).toBe(pkg.version);
    expect(server.packages).toHaveLength(1);
    expect(server.packages[0].identifier).toBe(pkg.name);
    expect(server.packages[0].version).toBe(pkg.version);
  });
});
