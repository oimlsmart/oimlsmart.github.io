export type ChangeListener = (id: string) => void

export abstract class BaseRepository<T extends { id: string }> {
  protected cache = new Map<string, T>()
  private listeners = new Set<ChangeListener>()

  get(id: string): T | undefined { return this.cache.get(id) }
  list(): T[] { return Array.from(this.cache.values()) }

  async persist(item: T): Promise<void> {
    this.cache.set(item.id, item)
    await this.writeToBackend(item)
    this.notify(item.id)
  }

  async remove(id: string): Promise<void> {
    this.cache.delete(id)
    await this.deleteFromBackend(id)
    this.notify(id)
  }

  abstract preload(): Promise<void>
  abstract getByIndex<K extends keyof T & string>(indexName: K, value: T[K]): Promise<T[]>

  filter(predicate: (item: T) => boolean): T[] { return this.list().filter(predicate) }
  findFirst(predicate: (item: T) => boolean): T | undefined { return this.list().find(predicate) }

  onChange(listener: ChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  protected notify(id: string): void {
    for (const l of this.listeners) l(id)
  }

  protected abstract writeToBackend(item: T): Promise<void>
  protected abstract deleteFromBackend(id: string): Promise<void>
}
