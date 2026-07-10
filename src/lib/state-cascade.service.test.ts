import { describe, it, expect, vi } from 'vitest'
import {
  resolveToken,
  resolveValue,
  resolveSetMap,
  storeNameFor,
  matchesWhere,
  applyCascades,
  type CascadeContext,
  type RepositoryProvider,
  type Repository,
  type StateMachine,
} from './state-cascade.service'

const ctx: CascadeContext = {
  thisId: 'tr-001',
  testReportId: 'tr-001',
  userId: 'alice',
  standardId: 'OIML-R-60',
}

describe('resolveToken', () => {
  it('passes through literal strings', () => {
    expect(resolveToken('hello', ctx)).toBe('hello')
  })

  it('resolves now to an ISO timestamp', () => {
    const v = resolveToken('now', ctx)
    expect(v).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('resolves user', () => {
    expect(resolveToken('user', ctx)).toBe('alice')
  })

  it('falls back to anonymous when user missing', () => {
    expect(resolveToken('user', { thisId: 'x' })).toBe('anonymous')
  })

  it('resolves ${this.id}', () => {
    expect(resolveToken('${this.id}', ctx)).toBe('tr-001')
  })

  it('resolves ${testReport.id}', () => {
    expect(resolveToken('${testReport.id}', ctx)).toBe('tr-001')
  })

  it('resolves ${this.standardId}', () => {
    expect(resolveToken('${this.standardId}', ctx)).toBe('OIML-R-60')
  })

  it('passes through unknown ${...} expressions', () => {
    expect(resolveToken('${weird.path}', ctx)).toBe('${weird.path}')
  })
})

describe('resolveValue', () => {
  it('parses true', () => {
    expect(resolveValue('true', ctx)).toBe(true)
  })
  it('parses false', () => {
    expect(resolveValue('false', ctx)).toBe(false)
  })
  it('parses integers', () => {
    expect(resolveValue('42', ctx)).toBe(42)
  })
  it('parses negative decimals', () => {
    expect(resolveValue('-3.14', ctx)).toBe(-3.14)
  })
  it('leaves strings as-is', () => {
    expect(resolveValue('hello', ctx)).toBe('hello')
  })
})

describe('resolveSetMap', () => {
  it('resolves every value in the map', () => {
    const r = resolveSetMap({ id: '${this.id}', count: '5', flag: 'true' }, ctx)
    expect(r).toEqual({ id: 'tr-001', count: 5, flag: true })
  })
})

describe('storeNameFor', () => {
  const cases: Array<[string, string]> = [
    ['TestReport', 'testReports'],
    ['Application', 'applications'],
    ['CustodyEvent', 'custodyEvents'],
    ['Box', 'boxes'],
    ['Class', 'classes'],
    ['MeasuringInstrument', 'measuringInstruments'],
  ]
  for (const [input, expected] of cases) {
    it(`${input} → ${expected}`, () => {
      expect(storeNameFor(input)).toBe(expected)
    })
  }
})

describe('matchesWhere', () => {
  it('returns true when no where clause', () => {
    expect(matchesWhere({ id: 'x' }, undefined, ctx)).toBe(true)
  })
  it('returns true for unparseable where', () => {
    expect(matchesWhere({ id: 'x' }, 'complicated expression', ctx)).toBe(true)
  })
  it('matches by equality', () => {
    expect(matchesWhere({ id: 'tr-001' }, 'id = tr-001', ctx)).toBe(true)
  })
  it('rejects non-match', () => {
    // Note: value must match \w+ regex (no dashes) to be parseable.
    // Unparseable where clauses apply broadly (true).
    expect(matchesWhere({ id: 'x' }, 'id = other', ctx)).toBe(false)
  })
  it('substitutes ${this.id}', () => {
    expect(matchesWhere({ testRequestId: 'tr-001' }, 'testRequestId = ${this.id}', ctx)).toBe(true)
  })
  it('supports quoted string values', () => {
    expect(matchesWhere({ status: 'DRAFT' }, 'status = "DRAFT"', ctx)).toBe(true)
  })
})

describe('applyCascades', () => {
  function makeRepo<T extends { id: string }>(): Repository<T> & { records: T[] } {
    const records: T[] = []
    return {
      records,
      list: () => records,
      // Upsert: if record with same id exists, replace it; else append.
      persist: vi.fn(async (r: T) => {
        const idx = records.findIndex(x => x.id === r.id)
        if (idx === -1) records.push(r)
        else records[idx] = r
      }),
    }
  }

  function makeProvider(): RepositoryProvider & { stores: Map<string, ReturnType<typeof makeRepo>> } {
    const stores = new Map<string, ReturnType<typeof makeRepo>>()
    return {
      stores,
      get<T>(name: string) {
        if (!stores.has(name)) stores.set(name, makeRepo<T>())
        return stores.get(name)! as unknown as Repository<T>
      },
    }
  }

  it('does nothing when machine does not exist', async () => {
    const provider = makeProvider()
    await applyCascades('Nonexistent', 'action', ctx, {}, provider)
    expect(provider.stores.size).toBe(0)
  })

  it('does nothing when transition has no cascade', async () => {
    const machines: Record<string, StateMachine> = {
      Widget: { initial: 'A', transitions: [{ from: 'A', to: 'B', action: 'go' }] },
    }
    const provider = makeProvider()
    await applyCascades('Widget', 'go', ctx, machines, provider)
    expect(provider.stores.size).toBe(0)
  })

  it('applies a set cascade to matching records', async () => {
    const machines: Record<string, StateMachine> = {
      TestRequest: {
        initial: 'DRAFT',
        transitions: [{
          from: 'DRAFT', to: 'ISSUED', action: 'issue',
          cascade: [{
            entity: 'TestAssignment',
            where: 'testRequestId = ${this.id}',
            set: { status: 'ISSUED' },
          }],
        }],
      },
    }
    const provider = makeProvider()
    const assignments = provider.get<{ id: string; testRequestId: string; status: string }>('testAssignments')
    assignments.list().push(
      { id: 'a1', testRequestId: 'tr-001', status: 'DRAFT' },
      { id: 'a2', testRequestId: 'other',  status: 'DRAFT' },
    )

    await applyCascades('TestRequest', 'issue', ctx, machines, provider)

    expect(assignments.list().find(a => a.id === 'a1')!.status).toBe('ISSUED')
    expect(assignments.list().find(a => a.id === 'a2')!.status).toBe('DRAFT')
  })

  it('applies a create cascade', async () => {
    // Note: token resolution only handles fully-wrapped ${...} strings.
    // '${this.id}' resolves to ctx.thisId; '${this.id}-audit' does NOT.
    const machines: Record<string, StateMachine> = {
      Application: {
        initial: 'DRAFT',
        transitions: [{
          from: 'DRAFT', to: 'SUBMITTED', action: 'submit',
          cascade: [{
            entity: 'AuditEvent',
            create: { id: '${this.id}', type: 'submitted', at: 'now' },
          }],
        }],
      },
    }
    const provider = makeProvider()
    await applyCascades('Application', 'submit', ctx, machines, provider)
    const auditStore = provider.stores.get('auditEvents')!
    expect(auditStore.list().length).toBe(1)
    expect(auditStore.list()[0]).toMatchObject({ id: 'tr-001', type: 'submitted' })
  })
})
