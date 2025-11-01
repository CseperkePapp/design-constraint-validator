export type Ok<T> = {
    ok: true;
    value: T;
};
export type Err<E> = {
    ok: false;
    error: E;
};
export type Result<T, E = Error> = Ok<T> | Err<E>;
export declare function ok<T>(value: T): Ok<T>;
export declare function err<E>(error: E): Err<E>;
export declare function wrap<T>(fn: () => T): Result<T, unknown>;
export declare function wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T, unknown>>;
export declare function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E>;
export declare function chain<T, U, E>(r: Result<T, E>, f: (v: T) => Result<U, E>): Result<U, E>;
export declare function getOrThrow<T, E>(r: Result<T, E>): T;
//# sourceMappingURL=result.d.ts.map