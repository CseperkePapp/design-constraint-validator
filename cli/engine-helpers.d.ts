import { type TokenNode } from '../core/flatten.js';
import { Engine } from '../core/engine.js';
import { loadTokensWithBreakpoint, type Breakpoint } from '../core/breakpoints.js';
import type { DcvConfig } from './types.js';
export declare function createEngine(tokensRoot: TokenNode, config?: DcvConfig): Engine;
export declare function createValidationEngine(tokensRoot: TokenNode, bp: Breakpoint | undefined, config: DcvConfig): Engine;
export { loadTokensWithBreakpoint };
//# sourceMappingURL=engine-helpers.d.ts.map