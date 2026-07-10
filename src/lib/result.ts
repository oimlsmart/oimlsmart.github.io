// ─────────────────────────────────────────────────────────────────────
// Result<T, E> — typed success/failure for service return values.
//
// Replaces implicit throw-based error handling with explicit, type-safe
// discrimination. Callers MUST check `.ok` before accessing `.value`
// (TypeScript narrows automatically). Failure cases are part of the
// function signature, not buried in a try/catch.
//
// Why:
// - Services that fail (validation, lookup, network) return Result
// - Services that can't fail (pure transforms over known-good data)
//   keep returning bare values
// - Truly unexpected errors (programming bugs) still throw — Result
//   isn't for everything
//
// Inspired by Rust's Result and the fp-ts Either, but minimal: no
// monadic sugar, no chaining helpers. Two constructors and a guard.
// ─────────────────────────────────────────────────────────────────────

export type Ok<T> = { readonly ok: true; readonly value: T }
export type Err<E> = { readonly ok: false; readonly error: E }
export type Result<T, E = string> = Ok<T> | Err<E>

/** Construct a success result. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

/** Construct a failure result. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

/**
 * Type guard — narrows Result<T, E> to Ok<T> in a branch.
 *
 *   const r = someService()
 *   if (isOk(r)) {
 *     r.value  // T, narrowed
 *   }
 */
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok
}

/**
 * Type guard — narrows Result<T, E> to Err<E> in a branch.
 */
export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return !r.ok
}

/**
 * Unwrap with a fallback. Use when the caller has a sensible default
 * and the error case is non-critical (logged elsewhere).
 *
 *   const scores = unwrapOr(rankLabs(...), [])
 */
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback
}

/**
 * Map a function over the success value. Errors pass through unchanged.
 *
 *   const lengths = mapOk(rankLabs(...), scores => scores.length)
 */
export function mapOk<T, U, E>(r: Result<T, E>, f: (value: T) => U): Result<U, E> {
  return r.ok ? ok(f(r.value)) : r
}
