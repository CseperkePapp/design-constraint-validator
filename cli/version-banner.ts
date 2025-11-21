/**
 * Version banner utility
 * Displays DCV version info when validation runs
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PackageJson {
  name: string;
  version: string;
  homepage?: string;
}

let cachedPkg: PackageJson | null = null;

function getPackageInfo(): PackageJson {
  if (cachedPkg) return cachedPkg;

  try {
    const pkgPath = join(__dirname, '../package.json');
    const pkgContent = readFileSync(pkgPath, 'utf-8');
    cachedPkg = JSON.parse(pkgContent);
    return cachedPkg!;
  } catch {
    // Fallback if package.json not found
    return {
      name: 'design-constraint-validator',
      version: '2.0.0',
      homepage: 'https://github.com/CseperkePapp/design-constraint-validator'
    };
  }
}

/**
 * Print DCV version banner
 * Shows: DCV v{version} | {repo_url}
 */
export function printVersionBanner(options?: { quiet?: boolean }): void {
  if (options?.quiet) return;

  const pkg = getPackageInfo();
  const repoUrl = pkg.homepage || 'https://github.com/CseperkePapp/design-constraint-validator';

  console.log(`\x1b[2m${pkg.name} v${pkg.version} | ${repoUrl}\x1b[0m`);
}

/**
 * Get version string for JSON output
 */
export function getVersionInfo(): { name: string; version: string; repository: string } {
  const pkg = getPackageInfo();
  return {
    name: pkg.name,
    version: pkg.version,
    repository: pkg.homepage || 'https://github.com/CseperkePapp/design-constraint-validator'
  };
}
