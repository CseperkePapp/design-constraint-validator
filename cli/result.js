export function ok(value) { return { ok: true, value }; }
export function err(error) { return { ok: false, error }; }
export function wrap(fn) {
    try {
        return ok(fn());
    }
    catch (e) {
        return err(e);
    }
}
export async function wrapAsync(fn) {
    try {
        return ok(await fn());
    }
    catch (e) {
        return err(e);
    }
}
export function map(r, f) {
    return r.ok ? ok(f(r.value)) : r;
}
export function chain(r, f) {
    return r.ok ? f(r.value) : r;
}
export function getOrThrow(r) {
    if (!r.ok)
        throw r.error; // consumer decides how to handle
    return r.value;
}
