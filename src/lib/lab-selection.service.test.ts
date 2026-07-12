import { describe, it, expect } from 'vitest'
import { filterTestLaboratories, type Lab } from './lab-selection.service'

describe('filterTestLaboratories', () => {
  it('keeps only orgs with kind test-laboratory', () => {
    const orgs: Array<Lab & { id: string; kind?: string }> = [
      { id: 'ia', kind: 'issuing-authority' },
      { id: 'lab-a', kind: 'test-laboratory' },
      { id: 'lab-b', kind: 'test-laboratory' },
      { id: 'mfg', kind: 'manufacturer' },
    ]
    const labs = filterTestLaboratories(orgs)
    expect(labs.map(l => l.id)).toEqual(['lab-a', 'lab-b'])
  })

  it('returns empty array when no orgs match', () => {
    expect(filterTestLaboratories([])).toEqual([])
    expect(filterTestLaboratories([{ id: 'x', kind: 'manufacturer' }])).toEqual([])
  })
})
