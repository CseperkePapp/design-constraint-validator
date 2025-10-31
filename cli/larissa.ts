#!/usr/bin/env node
// Clean minimal Larissa CLI entrypoint (no legacy inline code)
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'module';
import path from 'node:path';
import { type SetOptions, type BuildOptions, type ValidateOptions, type GraphOptions, type WhyOptions, type PatchOptions, type PatchApplyOptions } from './types.js';
import { setCommand, buildCommand, validateCommand, graphCommand, whyCommand, patchCommand, patchApplyCommand } from './commands/index.js';

// Early intercept: experimental graph diff helper
(() => {
  const args = process.argv.slice(2);
  if (args[0] === 'graph' && args[1] === 'diff') {
    const pass = args.slice(2);
    const require = createRequire(import.meta.url);
    const tsx = (() => { try { return require.resolve('tsx/dist/cli.mjs'); } catch { return path.resolve('node_modules/tsx/dist/cli.mjs'); }})();
    const r = spawnSync(process.execPath, [tsx, path.resolve('scripts/graph-diff.ts'), ...pass], { stdio: 'inherit', env: process.env });
    process.exit(r.status ?? 0);
  }
})();

const cli = yargs(hideBin(process.argv))
  .scriptName('dtv')
  .parserConfiguration({ 'camel-case-expansion': false })
  .option('quiet', { type: 'boolean' });

cli.command<SetOptions>('set <expressions..>', 'Set token values', y => y
  .positional('expressions', { type: 'string', array: true })
  .option('dry-run', { type: 'boolean', default: false })
  .option('write', { type: 'boolean' })
  .option('json', { type: 'string' })
  .option('unset', { type: 'array', string: true })
  .option('format', { type: 'string', choices: ['json','css','js'], default: 'json' })
  .option('output', { type: 'string' })
  .option('theme', { type: 'string' })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' }),
  a => setCommand(a)
);

cli.command<BuildOptions>('build', 'Build token outputs', y => y
  .option('format', { type: 'string', choices: ['css','json','js'], default: 'css' })
  .option('all-formats', { type: 'boolean', default: false })
  .option('output', { type: 'string' })
  .option('mapper', { type: 'string' })
  .option('theme', { type: 'string' })
  .option('dry-run', { type: 'boolean', default: false })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' }),
  a => buildCommand(a)
);

cli.command<ValidateOptions>('validate', 'Validate constraints', y => y
  .option('fail-on', { type: 'string', choices: ['off','warn','error'], default: 'error' })
  .option('summary', { type: 'string', choices: ['none','table','json'], default: 'none' })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' })
  .option('breakpoint', { type: 'string' })
  .option('all-breakpoints', { type: 'boolean' })
  .option('perf', { type: 'boolean', describe: 'Print timing info' })
  .option('budget-total-ms', { type: 'number', describe: 'Fail if total validation exceeds this (ms)' })
  .option('budget-per-bp-ms', { type: 'number', describe: 'Fail if any single breakpoint exceeds this (ms)' }),
  a => validateCommand(a)
);

cli.command<GraphOptions>('graph', 'Generate dependency / constraint graph', y => y
  .option('format', { type: 'string', choices: ['json','mermaid','dot','svg','png'], default: 'json' })
  .option('bundle', { type: 'boolean', describe: 'When used with --hasse export mermaid+dot (+image if svg/png requested)' })
  .option('hasse', { type: 'string' })
  .option('filter-prefix', { type: 'string' })
  .option('exclude-prefix', { type: 'string' })
  .option('only-violations', { type: 'boolean' })
  .option('highlight-violations', { type: 'boolean' })
  .option('label-violations', { type: 'boolean' })
  .option('label-truncate', { type: 'number', default: 0 })
  .option('min-severity', { type: 'string', choices: ['warn','error'], default: 'warn' })
  .option('focus', { type: 'string' })
  .option('radius', { type: 'number', default: 1 })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' }),
  a => graphCommand(a)
);

cli.command<WhyOptions>('why <tokenId>', 'Explain token provenance', y => y
  .positional('tokenId', { type: 'string', demandOption: true })
  .option('format', { type: 'string', choices: ['json','table'], default: 'json' })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' }),
  a => whyCommand(a)
);

cli.command<PatchOptions>('patch', 'Export patch (diff) from overrides', y => y
  .option('overrides', { type: 'string', describe: 'Path or inline JSON of flat overrides' })
  .option('format', { type: 'string', choices: ['json','css','js'], default: 'json' })
  .option('output', { type: 'string' })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' }),
  a => patchCommand(a)
);

cli.command<PatchApplyOptions>('patch:apply <patch>', 'Apply patch document to tokens', y => y
  .positional('patch', { type: 'string', demandOption: true })
  .option('tokens', { type: 'string', default: 'tokens/tokens.example.json' })
  .option('output', { type: 'string', describe: 'Write updated tokens to this file' })
  .option('dry-run', { type: 'boolean', default: false }),
  a => patchApplyCommand(a)
);

cli.help().alias('h','help').strict().wrap(cli.terminalWidth());
cli.parse();

// EOF
