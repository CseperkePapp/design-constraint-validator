import type { TokenValue } from '../core/flatten.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfigParsed } from './config-schema.js';

export interface WcagRuleConfig { foreground: string; background: string; ratio?: number; description?: string }
export type DcvConfig = DcvConfigParsed;
export type ValuesPatch = Record<string, TokenValue>;
export interface OverridesLeaf { $value?: string | number | null }
export type OverridesTree = { [k: string]: OverridesTree | OverridesLeaf } & OverridesLeaf;

export interface GlobalOptions {
  tokens?: string;
  config?: string;
  theme?: string;
  verbose?: boolean;
  quiet?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg';
  allBreakpoints?: boolean;
}
export interface SetOptions extends GlobalOptions {
  expressions: string[];
  output?: string;
  format?: 'json' | 'css' | 'js';
  theme?: string;
  write?: boolean;
  json?: string;
  unset?: string[];
  // CLI delivers the kebab key (camel-case-expansion off); programmatic callers
  // pass camelCase. Commands read both (TASK-024).
  dryRun?: boolean;
  'dry-run'?: boolean;
}
export interface BuildOptions extends GlobalOptions {
  output?: string;
  format?: 'css' | 'json' | 'js';
  watch?: boolean;
  theme?: string;
  mapper?: string;
  dryRun?: boolean;
  'dry-run'?: boolean;
  allFormats?: boolean;
  'all-formats'?: boolean;
}
export interface ValidateOptions extends GlobalOptions {
  strict?: boolean;
  constraints?: string[];
  'tokens-path'?: string;
  'constraints-dir'?: string;
  perf?: boolean;
  budgetTotalMs?: number;
  'budget-total-ms'?: number;
  budgetPerBpMs?: number;
  'budget-per-bp-ms'?: number;
  format?: 'text' | 'json';
  output?: string;
  receipt?: string;
  failOn?: 'off' | 'warn' | 'error';
  'fail-on'?: 'off' | 'warn' | 'error';
  summary?: 'none' | 'table' | 'json';
}
export interface GraphOptions extends GlobalOptions {
  output?: string;
  'constraints-dir'?: string;
  format?: 'dot' | 'mermaid' | 'json' | 'svg' | 'png';
  filter?: string;
  hasse?: string;
  // Kebab keys: the CLI parser runs with camel-case-expansion off.
  'image-from'?: 'mermaid' | 'dot';
  'filter-prefix'?: string;
  'exclude-prefix'?: string;
  'only-violations'?: boolean;
  'highlight-violations'?: boolean;
  'violation-color'?: string;
  'label-violations'?: boolean;
  'label-truncate'?: number;
  'min-severity'?: 'warn' | 'error';
  focus?: string;
  radius?: number;
  tokens?: string;
  theme?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}
export interface WhyOptions extends GlobalOptions {
  tokenId: string;
  'constraints-dir'?: string;
  format?: 'json' | 'table';
  theme?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}
export interface PatchOptions extends GlobalOptions {
  overrides?: string; // path to flat overrides json or inline json
  output?: string;
  format?: 'json' | 'css' | 'js';
  tokens?: string;
}
export interface PatchApplyOptions extends GlobalOptions {
  patch: string; // path or inline patch JSON
  output?: string; // where to write updated tokens (if omitted, prints result)
  tokens?: string; // source tokens file (baseline)
  dryRun?: boolean; // if true do not write (programmatic callers)
  'dry-run'?: boolean; // CLI key (camel-case-expansion off)
}
export type { Breakpoint };
