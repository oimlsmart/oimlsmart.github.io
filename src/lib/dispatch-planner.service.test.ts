import { describe, it, expect } from 'vitest'
import {
  effectiveLab,
  isPlanComplete,
  groupAssignmentsByLab,
  countTuples,
  type ModelPlan,
} from './dispatch-planner.service'

// ─────────────────────────────────────────────────────────────────────
// Dispatch planner — unit tests for the multi-lab-per-model splitting.
//
// These tests prove the IA can split a single model's tests across
// multiple labs (the user's core workflow requirement), without
// mounting the Vue wizard.
// ─────────────────────────────────────────────────────────────────────

function makePlan(modelId: string, over: Partial<ModelPlan> = {}): ModelPlan {
  return {
    modelId,
    selectedLabId: null,
    selectedForms: new Set(),
    formLabOverrides: new Map(),
    ...over,
  }
}

describe('effectiveLab', () => {
  it('returns the model default when no override exists', () => {
    const plan = makePlan('m1', { selectedLabId: 'lab-a', selectedForms: new Set(['f1']) })
    expect(effectiveLab(plan, 'f1')).toBe('lab-a')
  })

  it('returns the per-form override when set', () => {
    const plan = makePlan('m1', {
      selectedLabId: 'lab-a',
      selectedForms: new Set(['f1', 'f2']),
      formLabOverrides: new Map([['f2', 'lab-b']]),
    })
    expect(effectiveLab(plan, 'f1')).toBe('lab-a')
    expect(effectiveLab(plan, 'f2')).toBe('lab-b')
  })

  it('returns null when neither default nor override is set', () => {
    const plan = makePlan('m1', { selectedForms: new Set(['f1']) })
    expect(effectiveLab(plan, 'f1')).toBeNull()
  })
})

describe('isPlanComplete', () => {
  it('is false when no forms are selected', () => {
    const plan = makePlan('m1', { selectedLabId: 'lab-a' })
    expect(isPlanComplete(plan)).toBe(false)
  })

  it('is false when a selected form has no lab (default or override)', () => {
    const plan = makePlan('m1', {
      selectedLabId: 'lab-a',
      selectedForms: new Set(['f1', 'f2']),
    })
    // f1 has the default, f2 has no override and no default either
    // wait — selectedLabId applies to both. Let me fix: clear the default.
    plan.selectedLabId = null
    plan.formLabOverrides.set('f1', 'lab-a')
    // f2 has no assignment
    expect(isPlanComplete(plan)).toBe(false)
  })

  it('is true when every selected form has a lab', () => {
    const plan = makePlan('m1', {
      selectedLabId: 'lab-a',
      selectedForms: new Set(['f1', 'f2', 'f3']),
      formLabOverrides: new Map([['f2', 'lab-b']]),
    })
    // f1 → lab-a (default), f2 → lab-b (override), f3 → lab-a (default)
    expect(isPlanComplete(plan)).toBe(true)
  })
})

describe('groupAssignmentsByLab', () => {
  it('produces one group per lab when each model uses its default', () => {
    const plans = new Map([
      ['m1', makePlan('m1', { selectedLabId: 'lab-a', selectedForms: new Set(['f1', 'f2']) })],
      ['m2', makePlan('m2', { selectedLabId: 'lab-b', selectedForms: new Set(['f3']) })],
    ])
    const groups = groupAssignmentsByLab(plans)
    expect(groups.size).toBe(2)
    expect(groups.get('lab-a')?.length).toBe(2)
    expect(groups.get('lab-b')?.length).toBe(1)
  })

  it('splits one model across multiple labs when overrides are set', () => {
    // The user's stated requirement: different labs on different tests
    // on the same model.
    const plans = new Map([
      ['m1', makePlan('m1', {
        selectedLabId: 'lab-a',
        selectedForms: new Set(['load-cell-errors', 'creep-dr', 'humidity-ch']),
        formLabOverrides: new Map([
          ['creep-dr', 'lab-b'],
          ['humidity-ch', 'lab-c'],
        ]),
      })],
    ])
    const groups = groupAssignmentsByLab(plans)
    expect(groups.size).toBe(3)
    expect(groups.get('lab-a')?.map(a => a.formId)).toEqual(['load-cell-errors'])
    expect(groups.get('lab-b')?.map(a => a.formId)).toEqual(['creep-dr'])
    expect(groups.get('lab-c')?.map(a => a.formId)).toEqual(['humidity-ch'])
    // All assignments reference the same model
    for (const group of groups.values()) {
      for (const a of group) {
        expect(a.modelId).toBe('m1')
      }
    }
  })

  it('skips incomplete plans (some form missing a lab)', () => {
    const plans = new Map([
      ['m1', makePlan('m1', {
        selectedLabId: 'lab-a',
        selectedForms: new Set(['f1', 'f2']),
        // f2 has no lab anywhere because we clear the default for it...
        // actually with selectedLabId set, both get it. Let me construct
        // a real incomplete plan.
      })],
    ])
    plans.get('m1')!.selectedLabId = null
    plans.get('m1')!.formLabOverrides.set('f1', 'lab-a')
    // f2 has no lab
    const groups = groupAssignmentsByLab(plans)
    expect(groups.size).toBe(0)
  })

  it('returns empty map for empty input', () => {
    expect(groupAssignmentsByLab(new Map()).size).toBe(0)
  })
})

describe('countTuples', () => {
  it('sums selected forms across complete plans', () => {
    const plans = new Map([
      ['m1', makePlan('m1', { selectedLabId: 'lab-a', selectedForms: new Set(['f1', 'f2', 'f3']) })],
      ['m2', makePlan('m2', { selectedLabId: 'lab-b', selectedForms: new Set(['f4']) })],
    ])
    expect(countTuples(plans)).toBe(4)
  })

  it('excludes incomplete plans', () => {
    const plans = new Map([
      ['m1', makePlan('m1', { selectedLabId: 'lab-a', selectedForms: new Set(['f1']) })],
      ['m2', makePlan('m2', { selectedForms: new Set(['f2']) })],  // no lab
    ])
    expect(countTuples(plans)).toBe(1)
  })
})
