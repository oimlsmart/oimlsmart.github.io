import type { StoreName } from './db-schema'

type ChangeListener = (id: string) => void

export class InMemoryRepository<T extends { id: string }> {
  private cache = new Map<string, T>()
  private listeners = new Set<ChangeListener>()

  constructor(private readonly _store: StoreName = 'applications') {}

  get(id: string): T | undefined { return this.cache.get(id) }
  list(): T[] { return Array.from(this.cache.values()) }

  async persist(item: T): Promise<void> {
    this.cache.set(item.id, item)
    this.notify(item.id)
  }

  async remove(id: string): Promise<void> {
    this.cache.delete(id)
    this.notify(id)
  }

  async preload(): Promise<void> {}

  async getByIndex<K extends keyof T & string>(indexName: K, value: T[K]): Promise<T[]> {
    return this.list().filter(item => item[indexName] === value)
  }

  filter(predicate: (item: T) => boolean): T[] { return this.list().filter(predicate) }
  findFirst(predicate: (item: T) => boolean): T | undefined { return this.list().find(predicate) }

  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(id: string): void {
    for (const l of this.listeners) l(id)
  }
}
