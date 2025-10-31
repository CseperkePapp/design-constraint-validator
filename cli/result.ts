export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(value: T): Ok<T> { return { ok: true, value }; }
export function err<E>(error: E): Err<E> { return { ok: false, error }; }

export function wrap<T>(fn: () => T): Result<T, unknown> {
  try { return ok(fn()); } catch (e) { return err(e); }
}

export async function wrapAsync<T>(fn: () => Promise<T>): Promise<Result<T, unknown>> {
  try { return ok(await fn()); } catch (e) { return err(e); }
}

export function map<T, U, E>(r: Result<T, E>, f: (v: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r;
}

export function chain<T, U, E>(r: Result<T, E>, f: (v: T) => Result<U, E>): Result<U, E> {
  return r.ok ? f(r.value) : r;
}

export function getOrThrow<T, E>(r: Result<T, E>): T {
  if (!r.ok) throw r.error as any; // consumer decides how to handle
  return r.value;
}
