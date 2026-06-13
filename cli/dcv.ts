#!/usr/bin/env node
// Clean minimal DCV CLI entrypoint
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { type SetOptions, type BuildOptions, type ValidateOptions, type GraphOptions, type WhyOptions, type PatchOptions, type PatchApplyOptions } from './types.js';
import { setCommand, buildCommand, validateCommand, graphCommand, whyCommand, patchCommand, patchApplyCommand } from './commands/index.js';

const cli = yargs(hideBin(process.argv))
  .scriptName('dcv')
  // camel-case-expansion is intentionally OFF, so the CLI delivers flags only
  // under their kebab key (e.g. argv['dry-run'], never argv.dryRun). Commands
  // read BOTH forms — `options['dry-run'] ?? options.dryRun` — so the same handler
  // works whether invoked by the CLI (kebab) or programmatically/tests (camelCase).
  // Reading only one form silently no-ops for the other caller (TASK-024).
  .parserConfiguration({ 'camel-case-expansion': false })
  .option('quiet', { type: 'boolean' })
  .option('config', { type: 'string', describe: 'Path to JSON config file' });

// `[expressions..]` is OPTIONAL: batch mode (--json / `-` stdin) and unset-only
// mode (--unset) take no positional, and a mandatory positional made yargs abort
// before the handler (TASK-032).
cli.command<SetOptions>('set [expressions..]', 'Set token values', y => y
  .positional('expressions', { type: 'string', array: true })
  .option('dry-run', { type: 'boolean', default: false })
  .option('write', { type: 'boolean' })
  .option('json', { type: 'string' })
  .option('unset', { type: 'array', string: true })
  .option('format', { type: 'string', choices: ['json','css','js'], default: 'json' })
  .option('output', { type: 'string' })
  .option('theme', { type: 'string' })
  .option('debug-set', { type: 'boolean', hidden: true }) // hidden debug aid (also DCV_DEBUG_SET=1)
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
  .option('tokens', { type: 'string', describe: 'Path to a tokens file (defaults to tokens/tokens.example.json)' }),
  a => buildCommand(a)
);

cli.command<ValidateOptions>('validate [tokens-path]', 'Validate constraints', y => y
  .positional('tokens-path', { type: 'string', describe: 'Path to a tokens file (positional alias for --tokens)' })
  .option('constraints-dir', { type: 'string', describe: 'Directory holding order / cross-axis constraint files (default: themes)' })
  .option('fail-on', { type: 'string', choices: ['off','warn','error'], default: 'error' })
  .option('summary', { type: 'string', choices: ['none','table','json'], default: 'none' })
  .option('format', { type: 'string', choices: ['text','json'], default: 'text', describe: 'Output format' })
  .option('output', { type: 'string', describe: 'Write JSON output to file' })
  .option('receipt', { type: 'string', describe: 'Generate validation receipt with audit trail' })
  .option('tokens', { type: 'string', describe: 'Path to a tokens file (defaults to tokens/tokens.example.json)' })
  .option('theme', { type: 'string', describe: 'Apply named theme tokens before validation' })
  .option('breakpoint', { type: 'string' })
  .option('all-breakpoints', { type: 'boolean' })
  .option('cross-axis-debug', { type: 'boolean', hidden: true }) // hidden debug aid
  .option('perf', { type: 'boolean', describe: 'Print timing info' })
  .option('budget-total-ms', { type: 'number', describe: 'Fail if total validation exceeds this (ms)' })
  .option('budget-per-bp-ms', { type: 'number', describe: 'Fail if any single breakpoint exceeds this (ms)' }),
  a => validateCommand(a)
);

cli.command<GraphOptions>('graph', 'Generate dependency / constraint graph', y => y
  .option('format', { type: 'string', choices: ['json','mermaid','dot','svg','png'], default: 'json' })
  .option('bundle', { type: 'boolean', describe: 'When used with --hasse export mermaid+dot (+image if svg/png requested)' })
  .option('hasse', { type: 'string' })
  .option('constraints-dir', { type: 'string', describe: 'Directory holding order / cross-axis constraint files (default: themes). Used with --hasse.' })
  .option('filter', { type: 'string', describe: 'Filter dependency-graph edges by regex (matches either endpoint)' })
  .option('breakpoint', { type: 'string', choices: ['sm','md','lg'] })
  .option('all-breakpoints', { type: 'boolean' })
  .option('filter-prefix', { type: 'string' })
  .option('exclude-prefix', { type: 'string' })
  .option('only-violations', { type: 'boolean' })
  .option('highlight-violations', { type: 'boolean' })
  .option('label-violations', { type: 'boolean' })
  .option('label-truncate', { type: 'number', default: 0 })
  .option('min-severity', { type: 'string', choices: ['warn','error'], default: 'warn' })
  .option('violation-color', { type: 'string', describe: 'Hex color for highlighted violations (default: #ff2d55)' })
  .option('image-from', { type: 'string', choices: ['mermaid','dot'], describe: 'Source format for svg/png export (default: mermaid)' })
  .option('focus', { type: 'string' })
  .option('radius', { type: 'number', default: 1 })
  .option('tokens', { type: 'string', describe: 'Path to a tokens file (defaults to tokens/tokens.example.json)' }),
  a => graphCommand(a)
);

cli.command<WhyOptions>('why <tokenId>', 'Explain token provenance', y => y
  .positional('tokenId', { type: 'string', demandOption: true })
  .option('format', { type: 'string', choices: ['json','table'], default: 'json' })
  .option('constraints-dir', { type: 'string', describe: 'Directory holding order / cross-axis constraint files for the constraint summary (default: themes)' })
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
