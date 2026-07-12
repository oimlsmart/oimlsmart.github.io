import { describe, it, expect, vi } from 'vitest'
import { createDispatchWorkflow } from './dispatch-workflow'
import type { EntityApi } from './entity-composable'
import type { Application, MeasuringInstrument, InstrumentSample, Organization, TestRequest, TestAssignment } from './entity-types'

function mockApi<T extends { id: string }>(items: T[]): EntityApi<T> {
  const store = new Map(items.map(i => [i.id, i]))
  return {
    repo: {} as any,
    list: () => [...store.values()],
    get: (id: string) => store.get(id),
    async create(item) { const record = { ...item, id: item.id ?? crypto.randomUUID() } as T; store.set(record.id, record); return record },
    async update(item) { store.set(item.id, item) },
    async remove(id) { store.delete(id) },
    async preload() {},
    async getByIndex() { return [] },
    filter: (fn: (i: T) => boolean) => [...store.values()].filter(fn),
    findFirst: (fn: (i: T) => boolean) => [...store.values()].find(fn),
    onChange: () => () => {},
  }
}

describe('createDispatchWorkflow', () => {
  function setup() {
    const apps: Application[] = [
      { id: 'a1', status: 'ACCEPTED', applicationNumber: 'APP-1', modelFamilyId: 'f1' },
      { id: 'a2', status: 'DRAFT', applicationNumber: 'APP-2' },
    ]
    const models: MeasuringInstrument[] = [
      { id: 'm1', model: 'LC-100', modelFamilyId: 'f1', emax: 500, accuracyClass: 'A' },
      { id: 'm2', model: 'LC-200', modelFamilyId: 'f1', emax: 1000, accuracyClass: 'B' },
    ]
    const samples: InstrumentSample[] = [
      { id: 's1', modelId: 'm1', applicationId: 'a1' },
    ]
    const orgs: Organization[] = [
      { id: 'o1', name: 'Lab A', kind: 'test-laboratory' },
      { id: 'o2', name: 'IA B', kind: 'issuing-authority' },
    ]

    return createDispatchWorkflow({
      appApi: mockApi(apps),
      familyApi: mockApi(models),
      sampleApi: mockApi(samples),
      trApi: mockApi<TestRequest>([]),
      taApi: mockApi<TestAssignment>([]),
      orgApi: mockApi(orgs),
    })
  }

  it('getAcceptedApplications filters by ACCEPTED status', () => {
    const wf = setup()
    const accepted = wf.getAcceptedApplications()
    expect(accepted.length).toBe(1)
    expect(accepted[0].id).toBe('a1')
  })

  it('selectApplication loads models, samples, and labs', () => {
    const wf = setup()
    const result = wf.selectApplication('a1')
    expect(result.ok).toBe(true)
    expect(wf.state.models.length).toBe(2)
    expect(wf.state.samples.length).toBe(1)
    expect(wf.state.labs.length).toBe(1) // only test-laboratories
    expect(wf.state.labs[0].name).toBe('Lab A')
    expect(wf.state.step).toBe(2)
  })

  it('selectApplication fails for unknown app', () => {
    const wf = setup()
    const result = wf.selectApplication('nonexistent')
    expect(result.ok).toBe(false)
  })

  it('selectApplication fails for app without model family', () => {
    const wf = setup()
    const result = wf.selectApplication('a2')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('model family')
  })

  it('setLabForModel initializes default forms', () => {
    const wf = setup()
    wf.selectApplication('a1')
    wf.setLabForModel('m1', 'o1')
    const plan = wf.state.plans.get('m1')
    expect(plan?.selectedLabId).toBe('o1')
    expect(plan?.selectedForms.size).toBeGreaterThan(0)
  })

  it('toggleForm adds and removes forms', () => {
    const wf = setup()
    wf.selectApplication('a1')
    wf.setLabForModel('m1', 'o1')
    const plan = wf.state.plans.get('m1')!
    const formId = [...plan.selectedForms][0]
    wf.toggleForm('m1', formId)
    expect(plan.selectedForms.has(formId)).toBe(false)
    wf.toggleForm('m1', formId)
    expect(plan.selectedForms.has(formId)).toBe(true)
  })

  it('isModelConfigured requires both lab assignment and sample', () => {
    const wf = setup()
    wf.selectApplication('a1')
    expect(wf.isModelConfigured('m1')).toBe(false) // no lab assigned
    wf.setLabForModel('m1', 'o1')
    expect(wf.isModelConfigured('m1')).toBe(true) // m1 has sample s1
    expect(wf.isModelConfigured('m2')).toBe(false) // m2 has no sample
  })
})

describe('createDispatchWorkflow — issue()', () => {
  function setupWithApis() {
    const apps: Application[] = [
      { id: 'a1', status: 'ACCEPTED', applicationNumber: 'APP-1', modelFamilyId: 'f1' },
    ]
    const models: MeasuringInstrument[] = [
      { id: 'm1', model: 'LC-100', modelFamilyId: 'f1', emax: 500 },
      { id: 'm2', model: 'LC-200', modelFamilyId: 'f1', emax: 1000 },
    ]
    const samples: InstrumentSample[] = [
      { id: 's1', modelId: 'm1', applicationId: 'a1' },
      { id: 's2', modelId: 'm2', applicationId: 'a1' },
    ]
    const orgs: Organization[] = [
      { id: 'lab-a', name: 'Lab A', kind: 'test-laboratory' },
      { id: 'lab-b', name: 'Lab B', kind: 'test-laboratory' },
    ]
    const trApi = mockApi<TestRequest>([])
    const taApi = mockApi<TestAssignment>([])

    const wf = createDispatchWorkflow({
      appApi: mockApi(apps),
      familyApi: mockApi(models),
      sampleApi: mockApi(samples),
      trApi,
      taApi,
      orgApi: mockApi(orgs),
    })
    return { wf, trApi, taApi }
  }

  it('creates one TestRequest per lab and correct TestAssignments', async () => {
    const { wf, trApi, taApi } = setupWithApis()
    wf.selectApplication('a1')
    wf.setLabForModel('m1', 'lab-a')
    wf.setLabForModel('m2', 'lab-b')

    const notify = vi.fn()
    const count = await wf.issue('OIML-R-60', 'ia-staff', notify)

    expect(count).toBe(2)
    const trs = trApi.list()
    expect(trs.length).toBe(2)
    expect(trs.every(tr => tr.status === 'ISSUED')).toBe(true)
    expect(trs.every(tr => tr.standardId === 'OIML-R-60')).toBe(true)

    const tas = taApi.list()
    const DEFAULT_FORM_COUNT = 3
    expect(tas.length).toBe(2 * DEFAULT_FORM_COUNT)
    const taForLabA = tas.filter(ta => ta.laboratoryId === 'lab-a')
    expect(taForLabA.every(ta => ta.modelId === 'm1' && ta.sampleId === 's1')).toBe(true)
    const taForLabB = tas.filter(ta => ta.laboratoryId === 'lab-b')
    expect(taForLabB.every(ta => ta.modelId === 'm2')).toBe(true)

    expect(notify).toHaveBeenCalledWith('success', expect.stringContaining('2'))
  })

  it('skips models without lab assignment', async () => {
    const { wf, trApi, taApi } = setupWithApis()
    wf.selectApplication('a1')
    wf.setLabForModel('m1', 'lab-a')

    const count = await wf.issue('OIML-R-60', 'ia-staff', vi.fn())
    expect(count).toBe(1)
    expect(trApi.list().length).toBe(1)
    expect(taApi.list().length).toBe(3) // 3 default forms for m1
  })

  it('returns 0 when no application selected', async () => {
    const { wf, trApi } = setupWithApis()
    const count = await wf.issue('OIML-R-60', 'ia-staff', vi.fn())
    expect(count).toBe(0)
    expect(trApi.list().length).toBe(0)
  })
})
