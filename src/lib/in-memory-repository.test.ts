import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryRepository } from './in-memory-repository'
import type { Application } from './entity-types'

interface TestEntity extends Application {
  id: string
  status: string
  applicationNumber: string
}

describe('InMemoryRepository', () => {
  let repo: InMemoryRepository<TestEntity>

  beforeEach(() => {
    repo = new InMemoryRepository<TestEntity>('applications')
  })

  async function create(item: Partial<TestEntity> & { id?: string }): Promise<TestEntity> {
    const record = { ...item, id: item.id ?? crypto.randomUUID() } as TestEntity
    await repo.persist(record)
    return record
  }

  it('persists and retrieves by id', async () => {
    await create({ status: 'ACCEPTED', applicationNumber: 'APP-001' })
    const all = repo.list()
    expect(all).toHaveLength(1)
    expect(all[0].applicationNumber).toBe('APP-001')
  })

  it('generates UUID when id omitted', async () => {
    const created = await create({ status: 'DRAFT', applicationNumber: 'APP-002' })
    expect(created.id).toMatch(/^[0-9a-f]{8}-/)
    expect(repo.get(created.id)).toBeDefined()
  })

  it('removes by id', async () => {
    const item = await create({ status: 'DRAFT', applicationNumber: 'APP-003' })
    await repo.remove(item.id)
    expect(repo.get(item.id)).toBeUndefined()
  })

  it('filters by predicate', async () => {
    await create({ status: 'ACCEPTED', applicationNumber: 'A1' })
    await create({ status: 'DRAFT', applicationNumber: 'A2' })
    await create({ status: 'ACCEPTED', applicationNumber: 'A3' })
    const accepted = repo.filter(a => a.status === 'ACCEPTED')
    expect(accepted).toHaveLength(2)
  })

  it('notifies change listeners on persist', async () => {
    const events: string[] = []
    repo.onChange(id => events.push(id))
    const item = await create({ status: 'DRAFT', applicationNumber: 'X' })
    expect(events).toContain(item.id)
  })

  it('getByIndex filters by field value', async () => {
    await create({ status: 'ACCEPTED', applicationNumber: 'A1' })
    await create({ status: 'DRAFT', applicationNumber: 'A2' })
    const accepted = await repo.getByIndex('status', 'ACCEPTED')
    expect(accepted).toHaveLength(1)
    expect(accepted[0].applicationNumber).toBe('A1')
  })

  it('findFirst returns first match', async () => {
    await create({ status: 'ACCEPTED', applicationNumber: 'A1' })
    await create({ status: 'ACCEPTED', applicationNumber: 'A2' })
    const found = repo.findFirst(a => a.status === 'ACCEPTED')
    expect(found).toBeDefined()
    expect(found!.applicationNumber).toBe('A1')
  })

  it('unsubscribes change listener', async () => {
    const events: string[] = []
    const unsub = repo.onChange(id => events.push(id))
    unsub()
    await create({ status: 'DRAFT', applicationNumber: 'X' })
    expect(events).toHaveLength(0)
  })
})
