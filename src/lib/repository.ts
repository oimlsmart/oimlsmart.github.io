// ─────────────────────────────────────────────────────────────────────
// IndexedDB database initialization + Repository<T> pattern.
//
// Migrated from smart/browser/src/composables/{database,Repository,
// repository-manager}.ts. Simplified:
// - No BroadcastChannel (cross-tab sync) — add when needed
// - No migration registry — fresh DB only
// - No preload registry — callers preload explicitly
// - No `idb` dependency — thin promise wrappers around raw IndexedDB
//
// Using raw IndexedDB avoids the `idb` library's internal global
// references (IDBRequest etc.) which conflict with jsdom in tests.
// ─────────────────────────────────────────────────────────────────────

import { STORE_SCHEMA, DB_NAME, DB_VERSION, type StoreName } from './db-schema'
import { BaseRepository } from './base-repository'

let dbInstance: IDBDatabase | null = null

/** Open (or create) the OIML SMART database. Memoised. */
export function getDb(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const [name, meta] of Object.entries(STORE_SCHEMA)) {
        if (db.objectStoreNames.contains(name)) continue
        const store = db.createObjectStore(name, { keyPath: meta.key })
        for (const [idxName, idxKey] of Object.entries(meta.indexes)) {
          store.createIndex(idxName, idxKey)
        }
      }
    }
    req.onsuccess = () => {
      dbInstance = req.result
      resolve(dbInstance)
    }
    req.onerror = () => reject(req.error)
    req.onblocked = () => { /* retry on next call */ }
  })
}

/** Close + delete the entire database (used for reset / testing). */
export async function deleteDatabase(): Promise<void> {
  dbInstance = null
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
    req.onblocked = () => resolve()
  })
}

/** Reset the module-level memo (for tests that need a fresh DB). */
export function _resetDbForTesting(): void {
  dbInstance = null
}

// ── Thin IndexedDB helpers (promise wrappers, no `idb` dep) ─────────

async function dbPut(store: StoreName, value: unknown): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value as any)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function dbDelete(store: StoreName, key: string): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function dbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

async function dbGetAllFromIndex<T>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey,
): Promise<T[]> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).index(indexName).getAll(value)
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

// ── Repository<T> ───────────────────────────────────────────────────

export class Repository<T extends { id: string }> extends BaseRepository<T> {
  constructor(private readonly store: StoreName) {
    super()
  }

  protected writeToBackend(item: T): Promise<void> { return dbPut(this.store, item) }
  protected deleteFromBackend(id: string): Promise<void> { return dbDelete(this.store, id) }

  async preload(): Promise<void> {
    const all = await dbGetAll<T>(this.store)
    this.cache.clear()
    for (const item of all) this.cache.set(item.id, item)
  }

  async getByIndex<K extends keyof T & string>(indexName: K, value: T[K]): Promise<T[]> {
    return dbGetAllFromIndex<T>(this.store, indexName, value as unknown as IDBValidKey)
  }
}

// ── Repository manager ──────────────────────────────────────────────

const repos = new Map<StoreName, Repository<unknown>>()

export function getRepository<T extends { id: string }>(store: StoreName): Repository<T> {
  if (!repos.has(store)) repos.set(store, new Repository<T>(store))
  return repos.get(store) as Repository<T>
}

export function clearRepositories(): void { repos.clear() }
