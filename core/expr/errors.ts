// core/expr/errors.ts

export interface ExprErrorInfo {
  [key: string]: unknown;
}

export class ExprError extends Error {
  code: string;
  info?: ExprErrorInfo;

  constructor(code: string, message: string, info?: ExprErrorInfo) {
    super(message);
    this.name = 'ExprError';
    this.code = code;
    this.info = info;
  }
}

export const ERR = {
  BAD_OP: 'EXPR_BAD_OP',
  BAD_ARITY: 'EXPR_BAD_ARITY',
  BAD_TYPE: 'EXPR_BAD_TYPE',
  UNKNOWN_REF: 'EXPR_UNKNOWN_REF',
  NON_FINITE: 'EXPR_NON_FINITE',
  DIV_ZERO: 'EXPR_DIV_ZERO',
  MAX_NODES: 'EXPR_MAX_NODES',
  MAX_ABS: 'EXPR_MAX_ABS',
  BOOLEAN_TOP_LEVEL: 'EXPR_BOOLEAN_TOP_LEVEL'
} as const;

export type ExprErrorCode = typeof ERR[keyof typeof ERR];
