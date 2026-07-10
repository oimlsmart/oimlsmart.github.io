import { describe, it, expect } from 'vitest'
import {
  deriveOverallDecision,
  isEvaluationComplete,
  deriveModelDecision,
  deriveFamilyDecision,
  type TestReportDetermination,
  type ModelDecision,
} from './evaluation-domain'

describe('deriveOverallDecision (Level 1)', () => {
  function det(decision: TestReportDetermination['decision']): Pick<TestReportDetermination, 'decision'> {
    return { decision }
  }

  it('returns PENDING when no determinations', () => {
    expect(deriveOverallDecision([])).toBe('PENDING')
  })

  it('returns APPROVED when all ACCEPTED', () => {
    expect(deriveOverallDecision([det('ACCEPTED'), det('ACCEPTED')])).toBe('APPROVED')
  })

  it('returns REJECTED when any REJECTED', () => {
    expect(deriveOverallDecision([det('ACCEPTED'), det('REJECTED')])).toBe('REJECTED')
  })

  it('returns CONDITIONALLY_APPROVED for ACCEPTED + CONDITIONALLY_ACCEPTED mix', () => {
    expect(deriveOverallDecision([det('ACCEPTED'), det('CONDITIONALLY_ACCEPTED')])).toBe('CONDITIONALLY_APPROVED')
  })

  it('REJECTED dominates over CONDITIONAL', () => {
    expect(deriveOverallDecision([det('CONDITIONALLY_ACCEPTED'), det('REJECTED')])).toBe('REJECTED')
  })
})

describe('isEvaluationComplete', () => {
  it('returns false when no test reports', () => {
    expect(isEvaluationComplete([], [])).toBe(false)
  })

  it('returns true when every TR has a determination', () => {
    expect(isEvaluationComplete(['tr1', 'tr2'], [
      { testReportId: 'tr1' }, { testReportId: 'tr2' },
    ])).toBe(true)
  })

  it('returns false when a TR is missing', () => {
    expect(isEvaluationComplete(['tr1', 'tr2'], [
      { testReportId: 'tr1' },
    ])).toBe(false)
  })
})

describe('deriveModelDecision (Level 2)', () => {
  it('returns INCOMPLETE when any required form has no instance', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1', 'f2'],
      formResults: [{ formId: 'f1', result: 'PASS' }],
    })
    expect(d).toBe('INCOMPLETE')
  })

  it('returns FAIL when any submitted instance is FAIL', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1', 'f2'],
      formResults: [
        { formId: 'f1', result: 'PASS' },
        { formId: 'f2', result: 'FAIL' },
      ],
    })
    expect(d).toBe('FAIL')
  })

  it('returns CONDITIONAL when covered but some PENDING', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1', 'f2'],
      formResults: [
        { formId: 'f1', result: 'PASS' },
        { formId: 'f2', result: 'PENDING' },
      ],
    })
    expect(d).toBe('CONDITIONAL')
  })

  it('returns PASS when all required covered with PASS/NA', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1', 'f2', 'f3'],
      formResults: [
        { formId: 'f1', result: 'PASS' },
        { formId: 'f2', result: 'NA' },
        { formId: 'f3', result: 'PASS' },
      ],
    })
    expect(d).toBe('PASS')
  })

  it('PASS wins over NA when both present for a form', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1'],
      formResults: [
        { formId: 'f1', result: 'PASS' },
        { formId: 'f1', result: 'NA' },
      ],
    })
    expect(d).toBe('PASS')
  })

  it('FAIL dominates CONDITIONAL when both present for a form', () => {
    const d = deriveModelDecision({
      requiredFormIds: ['f1'],
      formResults: [
        { formId: 'f1', result: 'FAIL' },
        { formId: 'f1', result: 'PENDING' },
      ],
    })
    expect(d).toBe('FAIL')
  })
})

describe('deriveFamilyDecision (Level 3)', () => {
  const cases: Array<{ name: string; inputs: ModelDecision[]; expected: ReturnType<typeof deriveFamilyDecision> }> = [
    { name: 'empty → PENDING', inputs: [], expected: 'PENDING' },
    { name: 'all PASS → APPROVED', inputs: ['PASS', 'PASS'], expected: 'APPROVED' },
    { name: 'any INCOMPLETE → PENDING', inputs: ['PASS', 'INCOMPLETE'], expected: 'PENDING' },
    { name: 'any FAIL → REJECTED', inputs: ['PASS', 'FAIL'], expected: 'REJECTED' },
    { name: 'mix PASS+CONDITIONAL → CONDITIONALLY_APPROVED', inputs: ['PASS', 'CONDITIONAL'], expected: 'CONDITIONALLY_APPROVED' },
    { name: 'INCOMPLETE checked first (blocks finalization)', inputs: ['FAIL', 'INCOMPLETE'], expected: 'PENDING' },
  ]
  for (const c of cases) {
    it(c.name, () => {
      expect(deriveFamilyDecision(c.inputs)).toBe(c.expected)
    })
  }
})
