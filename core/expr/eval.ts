// core/expr/eval.ts

import {
  Context,
  EvalOptions,
  EvalValue,
  Expr,
  isNumericLiteral,
  isRefExpr,
  countNodes
} from './ast.js';
import { ERR, ExprError } from './errors.js';

const DEFAULT_MAX_NODES = 256;
const DEFAULT_MAX_ABS = 1e9;

const EPSILON = 1e-9;

export function evaluate(expr: Expr, context: Context, options: EvalOptions = {}): number {
  const maxNodes = options.maxNodes ?? DEFAULT_MAX_NODES;
  const nodeCount = countNodes(expr);
  if (nodeCount > maxNodes) {
    throw new ExprError(ERR.MAX_NODES, 'Expression exceeds allowed node count', {
      maxNodes,
      actual: nodeCount
    });
  }

  const trace = options.trace;
  const maxAbs = options.maxAbs ?? DEFAULT_MAX_ABS;

  const log = (op: string, inputs: EvalValue[], result: EvalValue) => {
    if (trace) trace.push({ op, inputs, result });
  };

  const ensureMagnitude = (value: number, op: string): number => {
    if (!Number.isFinite(value)) {
      throw new ExprError(ERR.NON_FINITE, `Non-finite result in ${op}`, { value });
    }
    if (Math.abs(value) > maxAbs) {
      throw new ExprError(ERR.MAX_ABS, `Result magnitude exceeded in ${op}`, { value, maxAbs });
    }
    return value;
  };

  const guardNumber = (value: EvalValue, op: string): number => {
    if (typeof value !== 'number') {
      throw new ExprError(ERR.BAD_TYPE, `${op} expects numeric arguments`, { actualType: typeof value });
    }
    return ensureMagnitude(value, op);
  };

  const guardBoolean = (value: EvalValue, op: string): boolean => {
    if (typeof value !== 'boolean') {
      throw new ExprError(ERR.BAD_TYPE, `${op} expects boolean`, { actualType: typeof value });
    }
    return value;
  };

  const resolveRef = (identifier: string): number => {
    if (!(identifier in context)) {
      throw new ExprError(ERR.UNKNOWN_REF, `Unknown reference: ${identifier}`, { ref: identifier });
    }
    const value = context[identifier];
    if (typeof value !== 'number') {
      throw new ExprError(ERR.BAD_TYPE, 'Reference must resolve to number', {
        ref: identifier,
        actualType: typeof value
      });
    }
    return ensureMagnitude(value, `ref:${identifier}`);
  };

  const evalInner = (node: Expr): EvalValue => {
    if (isNumericLiteral(node)) {
      const literal = ensureMagnitude(node, 'literal');
      log('literal', [literal], literal);
      return literal;
    }

    if (isRefExpr(node)) {
      const value = resolveRef(node.ref);
      // Trace captures numeric reference resolution; inputs shows 0-length array for simplicity
      log('ref', [], value);
      return value;
    }

    const keys = Object.keys(node as Record<string, unknown>);
    if (keys.length !== 1) {
      throw new ExprError(ERR.BAD_OP, 'Expression nodes must define exactly one operator', { keys });
    }

    const op = keys[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (node as Record<string, any>)[op];

    switch (op) {
      case 'add': {
        const a = guardNumber(evalInner(payload[0]), 'add');
        const b = guardNumber(evalInner(payload[1]), 'add');
        const result = ensureMagnitude(a + b, 'add');
        log('add', [a, b], result);
        return result;
      }
      case 'sub': {
        const a = guardNumber(evalInner(payload[0]), 'sub');
        const b = guardNumber(evalInner(payload[1]), 'sub');
        const result = ensureMagnitude(a - b, 'sub');
        log('sub', [a, b], result);
        return result;
      }
      case 'mul': {
        const a = guardNumber(evalInner(payload[0]), 'mul');
        const b = guardNumber(evalInner(payload[1]), 'mul');
        const result = ensureMagnitude(a * b, 'mul');
        log('mul', [a, b], result);
        return result;
      }
      case 'div': {
        const numerator = guardNumber(evalInner(payload[0]), 'div');
        const denominator = guardNumber(evalInner(payload[1]), 'div');
        if (Math.abs(denominator) < EPSILON) {
          throw new ExprError(ERR.DIV_ZERO, 'Division by zero');
        }
        const result = ensureMagnitude(numerator / denominator, 'div');
        log('div', [numerator, denominator], result);
        return result;
      }
      case 'pow': {
        const base = guardNumber(evalInner(payload[0]), 'pow');
        const exponent = guardNumber(evalInner(payload[1]), 'pow');
        const result = ensureMagnitude(Math.pow(base, exponent), 'pow');
        log('pow', [base, exponent], result);
        return result;
      }
      case 'min': {
        const a = guardNumber(evalInner(payload[0]), 'min');
        const b = guardNumber(evalInner(payload[1]), 'min');
        const result = ensureMagnitude(Math.min(a, b), 'min');
        log('min', [a, b], result);
        return result;
      }
      case 'max': {
        const a = guardNumber(evalInner(payload[0]), 'max');
        const b = guardNumber(evalInner(payload[1]), 'max');
        const result = ensureMagnitude(Math.max(a, b), 'max');
        log('max', [a, b], result);
        return result;
      }
      case 'clamp': {
        const value = guardNumber(evalInner(payload[0]), 'clamp');
        const lower = guardNumber(evalInner(payload[1]), 'clamp');
        const upper = guardNumber(evalInner(payload[2]), 'clamp');
        const minBound = Math.min(lower, upper);
        const maxBound = Math.max(lower, upper);
        const result = ensureMagnitude(Math.min(Math.max(value, minBound), maxBound), 'clamp');
        log('clamp', [value, minBound, maxBound], result);
        return result;
      }
      case 'eq': {
        const a = guardNumber(evalInner(payload[0]), 'eq');
        const b = guardNumber(evalInner(payload[1]), 'eq');
        const result = a === b;
        log('eq', [a, b], result);
        return result;
      }
      case 'lt': {
        const a = guardNumber(evalInner(payload[0]), 'lt');
        const b = guardNumber(evalInner(payload[1]), 'lt');
        const result = a < b;
        log('lt', [a, b], result);
        return result;
      }
      case 'gt': {
        const a = guardNumber(evalInner(payload[0]), 'gt');
        const b = guardNumber(evalInner(payload[1]), 'gt');
        const result = a > b;
        log('gt', [a, b], result);
        return result;
      }
      case 'piecewise': {
        const branches = payload.branches as { when: Expr; then: Expr }[];
        if (!Array.isArray(branches) || branches.length === 0) {
          throw new ExprError(ERR.BAD_ARITY, 'piecewise requires at least one branch');
        }
        for (const branch of branches) {
          const condition = evalInner(branch.when);
          if (guardBoolean(condition, 'piecewise.when')) {
            const value = guardNumber(evalInner(branch.then), 'piecewise.then');
            log('piecewise-then', [condition], value);
            return value;
          }
        }
        const fallback = guardNumber(evalInner(payload.else as Expr), 'piecewise.else');
        log('piecewise-else', [], fallback);
        return fallback;
      }
      default:
        throw new ExprError(ERR.BAD_OP, `Unknown operator: ${op}`);
    }
  };

  const output = evalInner(expr);
  if (typeof output !== 'number') {
    throw new ExprError(ERR.BOOLEAN_TOP_LEVEL, 'Top-level expression must resolve to a number', {
      resultType: typeof output
    });
  }
  return ensureMagnitude(output, 'top-level');
}
