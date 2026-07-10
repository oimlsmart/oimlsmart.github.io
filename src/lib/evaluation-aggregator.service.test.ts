import { describe, it, expect } from 'vitest'
import { aggregateEvaluation, type FormInstance } from './evaluation-aggregator.service'
import type { TestReportDetermination } from './evaluation-domain'

// ─────────────────────────────────────────────────────────────────────
// Aggregator integration tests — verify the 3-level pipeline composes
// correctly. Domain-logic edge cases are covered by evaluation-domain.test.ts.
// ─────────────────────────────────────────────────────────────────────

function det(trId: string, decision: TestReportDetermination['decision']): TestReportDetermination {
  return {
    id: `det-${trId}`,
    evaluationReportId: 'er-1',
    testReportId: trId,
    decision,
    reviewerName: 'IA',
    reviewDate: '2026-07-10',
  }
}

function fi(formId: string, trId: string, modelId: string, result: FormInstance['result']): FormInstance {
  return { formId, testReportId: trId, modelId, result }
}

describe('aggregateEvaluation — Level 1 (admissibility)', () => {
  it('flags pending reports when a TR has no determination', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr1', 'tr2'],
      determinations: [det('tr1', 'ACCEPTED')],
      formInstances: [],
      formProgram: {},
      labsByTestReport: new Map(),
    })
    expect(r.pendingReportIds).toEqual(['tr2'])
    expect(r.canFinalize).toBe(false)
    expect(r.overallDecision).toBe('PENDING')
  })

  it('excludes REJECTED TRs from technical synthesis', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr1', 'tr2'],
      determinations: [det('tr1', 'REJECTED'), det('tr2', 'ACCEPTED')],
      formInstances: [
        fi('f1', 'tr1', 'm1', 'PASS'),  // rejected → excluded
        fi('f1', 'tr2', 'm1', 'PASS'),
      ],
      formProgram: { m1: ['f1'] },
      labsByTestReport: new Map([['tr1', 'lab-a'], ['tr2', 'lab-b']]),
    })
    expect(r.canFinalize).toBe(true)
    // The rejected TR's evidence is excluded from model synthesis.
    // With the accepted TR showing PASS, model-level decision is PASS,
    // so family-level is APPROVED. (TR-level REJECTED does NOT
    // propagate to family if other accepted TRs cover the models.)
    expect(r.overallDecision).toBe('APPROVED')
    const me = r.modelEvaluations.find(m => m.modelId === 'm1')!
    expect(me.coveredFormIds).toEqual(['f1'])
    expect(me.contributorTestReportIds).toEqual(['tr2'])  // only tr2
  })
})

describe('aggregateEvaluation — Level 2 (per-model)', () => {
  it('aggregates across multiple labs into one model evaluation', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr-a', 'tr-b'],
      determinations: [det('tr-a', 'ACCEPTED'), det('tr-b', 'ACCEPTED')],
      formInstances: [
        fi('load-cell-errors', 'tr-a', 'm1', 'PASS'),
        fi('humidity-ch', 'tr-b', 'm1', 'PASS'),
      ],
      formProgram: { m1: ['load-cell-errors', 'humidity-ch'] },
      labsByTestReport: new Map([['tr-a', 'lab-x'], ['tr-b', 'lab-y']]),
    })

    expect(r.canFinalize).toBe(true)
    expect(r.overallDecision).toBe('APPROVED')

    const me = r.modelEvaluations.find(m => m.modelId === 'm1')!
    expect(me.decision).toBe('PASS')
    expect(me.coveredFormIds.sort()).toEqual(['humidity-ch', 'load-cell-errors'])
    expect(me.missingFormIds).toEqual([])
    expect(me.contributorTestReportIds.sort()).toEqual(['tr-a', 'tr-b'])
    expect(me.contributorLabIds.sort()).toEqual(['lab-x', 'lab-y'])
  })

  it('marks model INCOMPLETE when a required form is missing', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr'],
      determinations: [det('tr', 'ACCEPTED')],
      formInstances: [fi('f1', 'tr', 'm1', 'PASS')],
      formProgram: { m1: ['f1', 'f2'] },  // f2 missing
      labsByTestReport: new Map([['tr', 'lab']]),
    })
    expect(r.incompleteModelIds).toEqual(['m1'])
    expect(r.canFinalize).toBe(false)
    expect(r.overallDecision).toBe('PENDING')

    const me = r.modelEvaluations.find(m => m.modelId === 'm1')!
    expect(me.decision).toBe('INCOMPLETE')
    expect(me.missingFormIds).toEqual(['f2'])
  })

  it('includes models in formProgram even with zero instances (so user sees INCOMPLETE)', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr'],
      determinations: [det('tr', 'ACCEPTED')],
      formInstances: [],
      formProgram: { 'm-empty': ['f1'] },
      labsByTestReport: new Map(),
    })
    expect(r.modelEvaluations.map(m => m.modelId)).toContain('m-empty')
    expect(r.modelEvaluations.find(m => m.modelId === 'm-empty')!.decision).toBe('INCOMPLETE')
  })
})

describe('aggregateEvaluation — Level 3 (family)', () => {
  it('CONDITIONALLY_ACCEPTED TR triggers CONDITIONALLY_APPROVED family decision', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr'],
      determinations: [det('tr', 'CONDITIONALLY_ACCEPTED')],
      formInstances: [fi('f1', 'tr', 'm1', 'PASS')],
      formProgram: { m1: ['f1'] },
      labsByTestReport: new Map([['tr', 'lab']]),
    })
    // All models PASS, but TR is conditional → family is conditional
    expect(r.overallDecision).toBe('CONDITIONALLY_APPROVED')
  })

  it('REJECTED model triggers REJECTED family decision', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr'],
      determinations: [det('tr', 'ACCEPTED')],
      formInstances: [fi('f1', 'tr', 'm1', 'FAIL')],
      formProgram: { m1: ['f1'] },
      labsByTestReport: new Map([['tr', 'lab']]),
    })
    expect(r.overallDecision).toBe('REJECTED')
  })

  it('PENDING when admissibility incomplete regardless of model state', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr1', 'tr2'],
      determinations: [det('tr1', 'ACCEPTED')],  // tr2 missing
      formInstances: [fi('f1', 'tr1', 'm1', 'PASS')],
      formProgram: { m1: ['f1'] },
      labsByTestReport: new Map([['tr1', 'lab']]),
    })
    expect(r.overallDecision).toBe('PENDING')
    expect(r.canFinalize).toBe(false)
  })
})

describe('aggregateEvaluation — per-form aggregation', () => {
  it('groups FormInstances by formId across TRs', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr-a', 'tr-b'],
      determinations: [det('tr-a', 'ACCEPTED'), det('tr-b', 'ACCEPTED')],
      formInstances: [
        fi('shared-form', 'tr-a', 'm1', 'PASS'),
        fi('shared-form', 'tr-b', 'm1', 'PASS'),
      ],
      formProgram: { m1: ['shared-form'] },
      labsByTestReport: new Map([['tr-a', 'lab-x'], ['tr-b', 'lab-y']]),
    })

    const agg = r.perForm.find(f => f.formId === 'shared-form')!
    expect(agg.instances.length).toBe(2)
    expect(agg.aggregateResult).toBe('PASS')
  })

  it('marks MIXED when same form has PASS in one TR and PENDING in another', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr-a', 'tr-b'],
      determinations: [det('tr-a', 'ACCEPTED'), det('tr-b', 'ACCEPTED')],
      formInstances: [
        fi('shared-form', 'tr-a', 'm1', 'PASS'),
        fi('shared-form', 'tr-b', 'm1', 'PENDING'),
      ],
      formProgram: { m1: ['shared-form'] },
      labsByTestReport: new Map([['tr-a', 'lab-x'], ['tr-b', 'lab-y']]),
    })

    const agg = r.perForm.find(f => f.formId === 'shared-form')!
    expect(agg.aggregateResult).toBe('MIXED')
  })

  it('any FAIL across TRs makes aggregate FAIL', () => {
    const r = aggregateEvaluation({
      testReportIds: ['tr-a', 'tr-b'],
      determinations: [det('tr-a', 'ACCEPTED'), det('tr-b', 'ACCEPTED')],
      formInstances: [
        fi('shared-form', 'tr-a', 'm1', 'PASS'),
        fi('shared-form', 'tr-b', 'm1', 'FAIL'),
      ],
      formProgram: { m1: ['shared-form'] },
      labsByTestReport: new Map([['tr-a', 'lab-x'], ['tr-b', 'lab-y']]),
    })

    const agg = r.perForm.find(f => f.formId === 'shared-form')!
    expect(agg.aggregateResult).toBe('FAIL')
  })
})
