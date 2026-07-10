// ─────────────────────────────────────────────────────────────────────
// Entity composable factory — eliminates the per-entity boilerplate.
//
// Every entity composable (useApplication, useTestRequest, useModelFamily,
// etc.) has the same shape:
//   - list(): T[]
//   - get(id): T | undefined
//   - create(item): Promise<T>
//   - update(item): Promise<void>
//   - remove(id): Promise<void>
//   - preload(): Promise<void>
//
// This factory produces that shape from a store name, so each
// composable file is a one-liner. Adding a new entity = adding one
// file with one function call.
//
// DRY: eliminates ~40 lines of duplicated code per entity.
// OCP: new entities are additive (one new file, no existing code edited).
// MECE: factory owns the persistence mapping; composable owns the domain name.
// ─────────────────────────────────────────────────────────────────────

import { getRepository, Repository, type StoreName } from './repository'

export interface EntityApi<T extends { id: string }> {
  /** Get the underlying Repository<T> (for advanced queries). */
  readonly repo: Repository<T>
  /** List all cached items. */
  list(): T[]
  /** Get a single item by id. */
  get(id: string): T | undefined
  /** Create a new item with an auto-generated UUID. */
  create(item: Omit<T, 'id'> & Partial<Pick<T, 'id'>>): Promise<T>
  /** Persist an item (create or update by id). */
  update(item: T): Promise<void>
  /** Delete an item by id. */
  remove(id: string): Promise<void>
  /** Load all items from IndexedDB into cache. */
  preload(): Promise<void>
  /** Query by an indexed field. */
  getByIndex<K extends keyof T & string>(index: K, value: T[K]): Promise<T[]>
  /** Filter cached items by predicate. */
  filter(predicate: (item: T) => boolean): T[]
  /** Find first cached item matching predicate. */
  findFirst(predicate: (item: T) => boolean): T | undefined
  /** Register a change listener. Returns unsubscribe. */
  onChange(listener: (id: string) => void): () => void
}

/**
 * Create an entity composable for a given store.
 *
 * Usage:
 *   export function useApplication() {
 *     return defineEntityComposable<Application>('applications')
 *   }
 */
export function defineEntityComposable<T extends { id: string }>(
  store: StoreName,
): EntityApi<T> {
  const repo = getRepository<T>(store)

  return {
    repo,
    list: () => repo.list(),
    get: (id: string) => repo.get(id),
    async create(item) {
      const record = { ...item, id: item.id ?? crypto.randomUUID() } as T
      await repo.persist(record)
      return record
    },
    update: (item: T) => repo.persist(item),
    remove: (id: string) => repo.remove(id),
    preload: () => repo.preload(),
    getByIndex: <K extends keyof T & string>(index: K, value: T[K]) =>
      repo.getByIndex(index, value),
    filter: (predicate: (item: T) => boolean) => repo.filter(predicate),
    findFirst: (predicate: (item: T) => boolean) => repo.findFirst(predicate),
    onChange: (listener: (id: string) => void) => repo.onChange(listener),
  }
}
