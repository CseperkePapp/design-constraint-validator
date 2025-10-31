import { readFileSync } from 'node:fs';
import { flattenTokens } from '../../core/flatten.js';
import { explain } from '../../core/why.js';
import type { WhyOptions } from '../types.js';
import { loadTokens } from './utils.js';

export async function whyCommand(options: WhyOptions): Promise<void> {
  const tokensPath = options.tokens || 'tokens/tokens.json';
  const tokens = loadTokens(tokensPath);
  const { flat, edges } = flattenTokens(tokens);
  const target = options.tokenId;
  if (!flat[target]) {
    console.error(`❌ Token not found: ${target}`);
    const { suggestIds } = await import('../../core/cli-format.js');
    const suggestions = suggestIds(target, Object.keys(flat));
    if (suggestions.length > 0) {
      console.log(`\nDid you mean:`); suggestions.slice(0, 5).forEach(s => console.log(`  ${s.id}`));
    } else {
      console.log(`\nAvailable tokens:`); Object.keys(flat).sort().slice(0, 10).forEach(id => console.log(`  ${id}`));
      if (Object.keys(flat).length > 10) console.log(`  ... and ${Object.keys(flat).length - 10} more`);
    }
    process.exit(1);
  }
  function safeLoad(p: string) { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return {}; } }
  const overrides = safeLoad('tokens/overrides/local.json');
  const theme = safeLoad('themes/theme.json');
  const report = explain(target, flat, edges, { overrides: overrides?.overrides ?? overrides, theme });
  const format = options.format || 'json';
  if (format === 'table') {
    const { pad, trunc } = await import('../../core/cli-format.js');
    console.log(`\n=== Token Analysis: ${target} ===`);
    console.log(`Value: ${report.value}`); console.log(`Raw: ${report.raw || 'N/A'}`); console.log(`Provenance: ${report.provenance}`);
    if (report.dependsOn && report.dependsOn.length > 0) {
      console.log(`\nDependencies (${report.dependsOn.length}):`); console.log(pad('TOKEN', 30) + pad('VALUE', 20) + 'TYPE'); console.log('-'.repeat(70));
      report.dependsOn.forEach((depId: string) => { const dep = flat[depId]; if (dep) console.log(pad(trunc(depId, 28), 30) + pad(trunc(String(dep.value), 18), 20) + (dep.type || 'unknown')); });
    }
    if (report.dependents && report.dependents.length > 0) {
      console.log(`\nDependents (${report.dependents.length}):`); console.log(pad('TOKEN', 30) + pad('VALUE', 20) + 'TYPE'); console.log('-'.repeat(70));
      report.dependents.forEach((depId: string) => { const dep = flat[depId]; if (dep) console.log(pad(trunc(depId, 28), 30) + pad(trunc(String(dep.value), 18), 20) + (dep.type || 'unknown')); });
    }
    if (report.refs && report.refs.length > 0) console.log(`\nReferences: ${report.refs.join(', ')}`);
    if (report.chain && report.chain.length > 0) console.log(`\nReference Chain: ${report.chain.join(' → ')}`);
  } else {
    console.log(JSON.stringify(report, null, 2));
  }
}
