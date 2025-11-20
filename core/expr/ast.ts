// core/expr/ast.ts
// Deterministic, JSON-serialisable expression AST for safe evaluation
// Purity: no side effects, no recursion, no I/O

import { raise } from '../../src/errors/raise.js';

export type RefExpr = { ref: string };
export type NumericLiteral = number;

export type BinaryOperator =
  | { add: [Expr, Expr] }
  | { sub: [Expr, Expr] }
  | { mul: [Expr, Expr] }
  | { div: [Expr, Expr] }
  | { pow: [Expr, Expr] }
  | { min: [Expr, Expr] }
  | { max: [Expr, Expr] };

export type ClampOperator = { clamp: [Expr, Expr, Expr] };

export type ComparisonOperator =
  | { eq: [Expr, Expr] }
  | { lt: [Expr, Expr] }
  | { gt: [Expr, Expr] };

export type PiecewiseBranch = { when: Expr; then: Expr };
export type PiecewiseOperator = { piecewise: { branches: PiecewiseBranch[]; else: Expr } };

export type Expr =
  | NumericLiteral
  | RefExpr
  | BinaryOperator
  | ClampOperator
  | ComparisonOperator
  | PiecewiseOperator;

export type EvalNumber = number;
export type EvalBoolean = boolean;
export type EvalValue = EvalNumber | EvalBoolean;

export type Context = Record<string, number>;

export interface EvalStep {
  op: string;
  inputs: EvalValue[];
  result: EvalValue;
}

export interface EvalOptions {
  /** Maximum AST nodes allowed (guards cost). */
  maxNodes?: number;
  /** Maximum allowed absolute numeric magnitude. */
  maxAbs?: number;
  /** Optional evaluation trace for inspector tooling. */
  trace?: EvalStep[];
}

export type ExprKind = keyof NonNullable<
  BinaryOperator & ClampOperator & ComparisonOperator & PiecewiseOperator
>;

export function isRefExpr(value: Expr): value is RefExpr {
  return typeof value === 'object' && value !== null && 'ref' in value;
}

export function isNumericLiteral(value: Expr): value is NumericLiteral {
  return typeof value === 'number';
}

// Utility to count nodes for guard rails.
export function countNodes(expr: Expr): number {
  if (isNumericLiteral(expr) || isRefExpr(expr)) return 1;
  const keys = Object.keys(expr as Record<string, unknown>);
  if (keys.length !== 1) {
    raise('EXPR.INVALID_AST', {
      id: 'expr.count-nodes',
      message: 'Expression nodes must have exactly one key',
      ctx: { keys, expr }
    });
  }
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
    case 'gt':
      if (!Array.isArray(payload) || payload.length !== 2) {
        raise('EXPR.INVALID_AST', {
          id: 'expr.count-nodes',
          message: `Invalid binary operator payload for ${key}`,
          ctx: { exprKey: key, payload, reason: 'Expected array of length 2' }
        });
      }
      return 1 + countNodes(payload[0] as Expr) + countNodes(payload[1] as Expr);
    case 'clamp':
      if (!Array.isArray(payload) || payload.length !== 3) {
        raise('EXPR.INVALID_AST', {
          id: 'expr.count-nodes',
          message: 'Invalid clamp operator payload',
          ctx: { exprKey: key, payload, reason: 'Expected array of length 3' }
        });
      }
      return 1 + countNodes(payload[0] as Expr) + countNodes(payload[1] as Expr) + countNodes(payload[2] as Expr);
    case 'piecewise': {
      if (!payload || typeof payload !== 'object' || !('else' in payload) || !('branches' in payload)) {
        raise('EXPR.INVALID_AST', {
          id: 'expr.count-nodes',
          message: 'Invalid piecewise operator payload',
          ctx: { exprKey: key, payload, reason: 'Expected object with else and branches properties' }
        });
      }
      const piecewisePayload = payload as { else: Expr; branches: Array<{ when: Expr; then: Expr }> };
      let total = 1 + countNodes(piecewisePayload.else);
      for (const branch of piecewisePayload.branches) {
        total += countNodes(branch.when) + countNodes(branch.then);
      }
      return total;
    }
    default:
      raise('EXPR.INVALID_AST', {
        id: 'expr.count-nodes',
        message: `Unknown expression kind: ${key}`,
        ctx: { exprKey: key, payload }
      });
  }
}
