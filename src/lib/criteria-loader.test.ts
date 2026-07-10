import { describe, it, expect } from 'vitest'
import { loadLabSelectionCriteria, CriteriaLoadError } from './criteria-loader'

const validYaml = JSON.stringify({
  standards: [
    {
      id: 'OIML-R-60',
      lab_selection_criteria: [
        {
          id: 'has-load-cell-capability',
          weight: 'required',
          label: 'Load cell capability',
          description: 'Lab must be able to test load cells',
          match: { operator: 'has_capability', required_capability: 'load-cell-test' },
        },
        {
          id: 'accuracy-class-pref',
          weight: 'preferred',
          parameter_type: 'dimension',
          label: 'Accuracy class coverage',
          description: 'Prefers labs with broader accuracy coverage',
          match: { operator: 'capability_prefix_match', lab_capability_prefix: 'acc-' },
        },
      ],
    },
  ],
})

describe('loadLabSelectionCriteria', () => {
  it('returns criteria for a known standard', () => {
    const criteria = loadLabSelectionCriteria(validYaml, 'OIML-R-60')
    expect(criteria.length).toBe(2)
    expect(criteria[0].id).toBe('has-load-cell-capability')
    expect(criteria[1].parameter_type).toBe('dimension')
  })

  it('returns empty array for unknown standard', () => {
    const criteria = loadLabSelectionCriteria(validYaml, 'OIML-R-999')
    expect(criteria).toEqual([])
  })

  it('returns empty array when file has no standards key', () => {
    const criteria = loadLabSelectionCriteria('{}', 'OIML-R-60')
    expect(criteria).toEqual([])
  })

  it('throws on missing id', () => {
    const bad = JSON.stringify({
      standards: [{ id: 'X', lab_selection_criteria: [{ weight: 'required', label: 'L', description: 'D', match: { operator: 'always_pass' } }] }],
    })
    expect(() => loadLabSelectionCriteria(bad, 'X')).toThrow(CriteriaLoadError)
  })

  it('throws on invalid weight', () => {
    const bad = JSON.stringify({
      standards: [{ id: 'X', lab_selection_criteria: [{ id: 'c1', weight: 'maybe', label: 'L', description: 'D', match: { operator: 'always_pass' } }] }],
    })
    expect(() => loadLabSelectionCriteria(bad, 'X')).toThrow(CriteriaLoadError)
  })

  it('throws on missing match.operator', () => {
    const bad = JSON.stringify({
      standards: [{ id: 'X', lab_selection_criteria: [{ id: 'c1', weight: 'required', label: 'L', description: 'D', match: {} }] }],
    })
    expect(() => loadLabSelectionCriteria(bad, 'X')).toThrow(CriteriaLoadError)
  })

  it('throws on invalid parameter_type', () => {
    const bad = JSON.stringify({
      standards: [{ id: 'X', lab_selection_criteria: [{ id: 'c1', weight: 'required', parameter_type: 'bogus', label: 'L', description: 'D', match: { operator: 'always_pass' } }] }],
    })
    expect(() => loadLabSelectionCriteria(bad, 'X')).toThrow(CriteriaLoadError)
  })

  it('preserves optional applies_when', () => {
    const yaml = JSON.stringify({
      standards: [{
        id: 'X',
        lab_selection_criteria: [{
          id: 'c1', weight: 'required', label: 'L', description: 'D',
          applies_when: { model_field: 'technology', in: ['strain-gauge'] },
          match: { operator: 'always_pass' },
        }],
      }],
    })
    const criteria = loadLabSelectionCriteria(yaml, 'X')
    expect(criteria[0].applies_when?.model_field).toBe('technology')
    expect(criteria[0].applies_when?.in).toEqual(['strain-gauge'])
  })
})
