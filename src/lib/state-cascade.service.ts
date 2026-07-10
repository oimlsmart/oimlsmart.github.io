// ─────────────────────────────────────────────────────────────────────
// State Machine Cascade Service — declarative side-effect executor.
//
// Migrated from smart/browser/src/services/state-cascade.service.ts.
//
// Reads cascade declarations and applies them when a state transition
// fires. The original depended on `loadedStandards` and `getRepository`
// (singletons). Here both are parameterized:
//
//   - State machine lookup: caller passes a machines map (or a function
//     that returns one)
//   - Persistence: caller passes a RepositoryProvider that returns a
//     Repository<T> by store name
//
// Pure helpers (resolveToken, resolveValue, matchesWhere, storeNameFor)
// are exported separately so they can be unit-tested without mocking.
// ─────────────────────────────────────────────────────────────────────

export interface CascadeAction {
  entity: string
  set?: Record<string, string>
  where?: string
  create?: Record<string, string>
}

export interface TransitionWithCascade {
  from: string | string[]
  to: string
  action: string
  cascade?: CascadeAction[]
}

export interface StateMachine {
  initial: string
  transitions: TransitionWithCascade[]
}

export interface CascadeContext {
  /** id of the entity that triggered the transition. */
  thisId: string
  /** id of the related TestReport (if applicable). */
  testReportId?: string
  /** id of the current user (for 'user' token resolution). */
  userId?: string
  /** timestamp for 'now' token resolution (defaults to Date.now()). */
  now?: string
  /** canonical standard id (for 'this.standardId' token). */
  standardId?: string
}

/** Minimal Repository interface — caller provides the implementation. */
export interface Repository<T> {
  list(): T[]
  persist(record: T): Promise<void> | void
}

export interface RepositoryProvider {
  get<T = Record<string, unknown>>(storeName: string): Repository<T>
}

/** Machines map keyed by machine name (e.g. { TestReport: {...}, Application: {...} }). */
export type MachinesLookup = Record<string, StateMachine>

// ── Pure helpers ────────────────────────────────────────────────────

/** Resolve a single token value ('now', 'user', '${...}') against ctx. */
export function resolveToken(value: string, ctx: CascadeContext): string {
  if (value === 'now') return ctx.now ?? new Date().toISOString()
  if (value === 'user') return ctx.userId ?? 'anonymous'
  const m = /^\$\{(.+)\}$/.exec(value)
  if (!m) return value
  const path = m[1]
  if (path === 'this.id') return ctx.thisId
  if (path === 'testReport.id') return ctx.testReportId ?? ''
  if (path === 'this.standardId') return ctx.standardId ?? ''
  return value
}

/** Resolve + coerce a value (parse booleans/numbers). */
export function resolveValue(value: string, ctx: CascadeContext): unknown {
  const resolved = resolveToken(value, ctx)
  if (resolved === 'true') return true
  if (resolved === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(resolved)) return Number(resolved)
  return resolved
}

export function resolveSetMap(
  set: Record<string, string>,
  ctx: CascadeContext,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(set)) {
    out[k] = resolveValue(v, ctx)
  }
  return out
}

/**
 * Convert PascalCase entity name to camelCase plural store name.
 * TestReport → testReports
 * CustodyEvent → custodyEvents
 * Application → applications
 */
export function storeNameFor(entity: string): string {
  const words = entity.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')
  const last = words[words.length - 1].toLowerCase()
  let pluralLast: string
  if (last.endsWith('y')) pluralLast = last.slice(0, -1) + 'ies'
  else if (last.endsWith('s') || last.endsWith('x')) pluralLast = last + 'es'
  else pluralLast = last + 's'
  if (words.length === 1) return pluralLast
  const firstWord = words[0].toLowerCase()
  const middleWords = words.slice(1, -1).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
  const lastCapitalized = pluralLast[0].toUpperCase() + pluralLast.slice(1)
  return firstWord + middleWords.join('') + lastCapitalized
}

/** Match a record against a simple `field = value` where clause. */
export function matchesWhere(
  record: Record<string, unknown>,
  where: string | undefined,
  ctx: CascadeContext,
): boolean {
  if (!where) return true
  const eq = /^(\w+(?:\.\w+)*)\s*=\s*(\$\{[^}]+\}|\w+|"[^"]*"|'[^']*')$/.exec(where.trim())
  if (!eq) return true
  const [, fieldPath, valueRaw] = eq
  const actual = getByPath(record, fieldPath)
  const expected = resolveValue(valueRaw.replace(/^["']|["']$/g, ''), ctx)
  return actual === expected
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}

// ── Impure: apply cascades against a RepositoryProvider ─────────────

async function applyCascadeAction(
  action: CascadeAction,
  ctx: CascadeContext,
  repos: RepositoryProvider,
): Promise<void> {
  const repo = repos.get<Record<string, unknown>>(storeNameFor(action.entity))

  if (action.set) {
    const updateValues = resolveSetMap(action.set, ctx)
    const records = repo.list()
    for (const r of records) {
      if (matchesWhere(r, action.where, ctx)) {
        Object.assign(r, updateValues)
        await repo.persist(r)
      }
    }
  }

  if (action.create) {
    const newRecord = resolveSetMap(action.create, ctx) as { id: string }
    await repo.persist(newRecord)
  }
}

/** Apply all cascades for a transition. Errors propagate to the caller. */
export async function applyCascades(
  machineName: string,
  transitionAction: string,
  ctx: CascadeContext,
  machines: MachinesLookup,
  repos: RepositoryProvider,
): Promise<void> {
  const machine = machines[machineName]
  if (!machine) return
  const transition = machine.transitions.find(t => t.action === transitionAction)
  if (!transition?.cascade?.length) return
  for (const action of transition.cascade) {
    await applyCascadeAction(action, ctx, repos)
  }
}
