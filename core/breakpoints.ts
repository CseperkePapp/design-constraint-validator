// core/breakpoints.ts
import fs from "node:fs";
import type { TokenNode } from "./flatten.js";

export type Breakpoint = "sm" | "md" | "lg";

export function parseBreakpoints(argv: string[]): Breakpoint[] {
  const allIdx = argv.indexOf("--all-breakpoints");
  if (allIdx >= 0) return ["sm", "md", "lg"];
  const bpIdx = argv.indexOf("--breakpoint");
  if (bpIdx >= 0) return [argv[bpIdx + 1] as Breakpoint];
  return []; // no BP slicing requested
}

export function loadJsonSafe<T = unknown>(path: string): T | null {
  try {
    const data = JSON.parse(fs.readFileSync(path, "utf8"));
    return data;
  } catch {
    return null;
  }
}

export function loadOrders(axis: string, bp?: Breakpoint): [string, "<=" | ">=", string][] {
  const withBp = bp ? loadJsonSafe<{ order: unknown[] }>(`themes/${axis}.${bp}.order.json`) : null;
  if (withBp?.order) return withBp.order as [string, "<=" | ">=", string][];
  const global = loadJsonSafe<{ order: unknown[] }>(`themes/${axis}.order.json`);
  return (global?.order ?? []) as [string, "<=" | ">=", string][];
}

export function mergeTokens(base: unknown, overlay: unknown): TokenNode {
  if (!overlay) return base as TokenNode;
  if (typeof base !== "object" || base === null) return overlay as TokenNode;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(overlay as Record<string, unknown>)) {
    (out as Record<string, unknown>)[k] = mergeTokens((base as Record<string, unknown>)?.[k], (overlay as Record<string, unknown>)[k]);
  }
  return out as TokenNode;
}

/** Load tokens with optional breakpoint override: base + overrides/<bp>.json */
/**
 * Load tokens with override precedence: base < local < breakpoint
 */
export function loadTokensWithBreakpoint(bp?: Breakpoint): TokenNode {
  const base = loadJsonSafe<TokenNode>("tokens/tokens.example.json") ?? {};
  const local = loadJsonSafe<TokenNode>("tokens/overrides/local.json");
  const ov = bp ? loadJsonSafe<TokenNode>(`tokens/overrides/${bp}.json`) : null;
  return mergeTokens(mergeTokens(base, local), ov);
}
