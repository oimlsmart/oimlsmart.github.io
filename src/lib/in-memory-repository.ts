import type { StoreName } from './db-schema'
import { BaseRepository } from './base-repository'

export class InMemoryRepository<T extends { id: string }> extends BaseRepository<T> {
  constructor(private readonly _store: StoreName = 'applications') {
    super()
  }

  protected writeToBackend(_item: T): Promise<void> { return Promise.resolve() }
  protected deleteFromBackend(_id: string): Promise<void> { return Promise.resolve() }

  async preload(): Promise<void> {}

  async getByIndex<K extends keyof T & string>(indexName: K, value: T[K]): Promise<T[]> {
    return this.list().filter(item => item[indexName] === value)
  }
}
