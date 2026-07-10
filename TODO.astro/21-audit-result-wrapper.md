# 21 — Audit: Result<T, E> wrapper for service return values

**Status:** proposal
**Type:** architectural improvement
**Audit finding:** services currently throw on error, callers must `try/catch` everywhere

## Finding

Current services (lab-selection, evaluation-aggregator, dispatch-planner, etc.) follow this pattern:

```ts
// caller
try {
  const ranked = rankLabs(labs, ctx, criteria)
  // ...
} catch (e) {
  notify.error('Could not rank labs')
}
```

Problems:
- **Error type is implicit** — caller doesn't know what can fail
- **Forces defensive try/catch everywhere**, which is noise
- **Mixed semantics** — success and failure use different mechanisms (return vs. throw)
- **Untestable without mock** — to test the failure path you need to mock dependencies to throw

## Proposal

Introduce a `Result<T, E>` discriminated union:

```ts
// src/lib/result.ts
export type Ok<T> = { ok: true; value: T }
export type Err<E> = { ok: false; error: E }
export type Result<T, E = string> = Ok<T> | Err<E>

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value })
export const err = <E>(error: E): Err<E> => ({ ok: false, error })
```

Then services return `Result<T>`:

```ts
// before
export function rankLabs(labs, ctx, criteria): LabScore[] {
  if (!labs.length) throw new Error('No labs provided')
  // ...
}

// after
export function rankLabs(labs, ctx, criteria): Result<LabScore[], LabSelectionError> {
  if (!labs.length) return err({ kind: 'EmptyInput' })
  // ...
  return ok(scores)
}
```

Caller:

```ts
const result = rankLabs(labs, ctx, criteria)
if (!result.ok) {
  notify.error('Could not rank labs', humaniseError(result.error))
  return
}
const ranked = result.value
```

## Trade-offs

**Pros**
- Errors become part of the type signature (autocomplete, docs)
- No exceptions in the hot path (better perf, easier to reason about)
- Forced handling — TypeScript narrows `result.value` only after the `if (!result.ok)` check
- Testable: just call and assert the result shape

**Cons**
- Verbose at call sites (3 lines vs. 1)
- Requires migrating existing services incrementally
- Doesn't replace truly unexpected errors (programming bugs still throw)

## Migration plan

Don't migrate everything at once. Adopt for new code first. For existing services, migrate when making non-trivial changes anyway (DRY opportunity).

## Acceptance criteria

- [ ] `src/lib/result.ts` exists with the type + `ok`/`err` constructors
- [ ] At least one service uses it (start with the next one written)
- [ ] Test for the Result helpers
- [ ] Audit existing services and tag "Result migration candidate" in their headers
