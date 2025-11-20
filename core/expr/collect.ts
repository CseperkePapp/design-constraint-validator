// core/expr/collect.ts
import type { Expr } from './ast.js';

export function collectRefs(expr: Expr, out: Set<string> = new Set()): Set<string> {
  if (typeof expr === 'number') return out;
  if (typeof expr === 'object' && expr !== null) {
    if ('ref' in expr && typeof expr.ref === 'string') {
      out.add(expr.ref);
      return out;
    }
    const keys = Object.keys(expr as Record<string, unknown>);
    if (keys.length !== 1) return out;
    const key = keys[0];
    const payload = (expr as Record<string, unknown>)[key];
    switch (key) {
      case 'add':
      case 'sub':
      case 'mul':
      case 'div':
      case 'pow':
      case 'min':
      case 'max':
      case 'eq':
      case 'lt':
      case 'gt': {
        if (Array.isArray(payload) && payload.length === 2) {
          collectRefs(payload[0] as Expr, out);
          collectRefs(payload[1] as Expr, out);
        }
        break;
      }
      case 'clamp': {
        if (Array.isArray(payload) && payload.length === 3) {
          collectRefs(payload[0] as Expr, out);
          collectRefs(payload[1] as Expr, out);
          collectRefs(payload[2] as Expr, out);
        }
        break;
      }
      case 'piecewise': {
        if (payload && typeof payload === 'object' && 'branches' in payload && 'else' in payload) {
          const piecewisePayload = payload as { branches: Array<{ when: Expr; then: Expr }>; else: Expr };
          for (const branch of piecewisePayload.branches ?? []) {
            collectRefs(branch.when, out);
            collectRefs(branch.then, out);
          }
          collectRefs(piecewisePayload.else, out);
        }
        break;
      }
      default:
        break;
    }
  }
  return out;
}
