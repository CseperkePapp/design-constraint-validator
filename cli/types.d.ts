import type { TokenValue } from '../core/flatten.js';
import type { Breakpoint } from '../core/breakpoints.js';
import type { DcvConfigParsed } from './config-schema.js';
export interface WcagRuleConfig {
    foreground: string;
    background: string;
    ratio?: number;
    description?: string;
}
export type DcvConfig = DcvConfigParsed;
export type ValuesPatch = Record<string, TokenValue>;
export interface OverridesLeaf {
    $value?: string | number | null;
}
export type OverridesTree = {
    [k: string]: OverridesTree | OverridesLeaf;
} & OverridesLeaf;
export interface GlobalOptions {
    tokens?: string;
    config?: string;
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
}
export interface BuildOptions extends GlobalOptions {
    output?: string;
    format?: 'css' | 'json' | 'js';
    watch?: boolean;
    theme?: string;
    mapper?: string;
    dryRun?: boolean;
    allFormats?: boolean;
}
export interface ValidateOptions extends GlobalOptions {
    strict?: boolean;
    constraints?: string[];
    perf?: boolean;
    budgetTotalMs?: number;
    budgetPerBpMs?: number;
}
export interface GraphOptions extends GlobalOptions {
    output?: string;
    format?: 'dot' | 'mermaid' | 'json' | 'svg' | 'png';
    imageFrom?: 'mermaid' | 'dot';
    filter?: string;
    hasse?: string;
    filterPrefix?: string;
    excludePrefix?: string;
    onlyViolations?: boolean;
    highlightViolations?: boolean;
    violationColor?: string;
    labelViolations?: boolean;
    labelTruncate?: number;
    minSeverity?: 'warn' | 'error';
    focus?: string;
    radius?: number;
    tokens?: string;
}
export interface WhyOptions extends GlobalOptions {
    tokenId: string;
    format?: 'json' | 'table';
}
export interface PatchOptions extends GlobalOptions {
    overrides?: string;
    output?: string;
    format?: 'json' | 'css' | 'js';
    tokens?: string;
}
export interface PatchApplyOptions extends GlobalOptions {
    patch: string;
    output?: string;
    tokens?: string;
    dryRun?: boolean;
}
export type { Breakpoint };
//# sourceMappingURL=types.d.ts.map