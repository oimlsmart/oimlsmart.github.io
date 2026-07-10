import { describe, it, expect } from 'vitest'
import {
  rankLabs,
  eligibleLabs,
  topRecommendation,
  filterTestLaboratories,
  type Lab,
  type LabSelectionCriterion,
  type LabRankingContext,
} from './lab-selection.service'

// ─────────────────────────────────────────────────────────────────────
// Lab selection tests — prove the ported service is behavior-equivalent
// to the original in smart/browser. The service is pure: it has no
// external dependencies (no IndexedDB, no YAML reader), so the tests
// build criteria and lab fixtures inline.
// ─────────────────────────────────────────────────────────────────────

function makeLab(id: string, caps: string[], extras: Partial<Lab> = {}): Lab & { id: string; kind?: string } {
  return { id, capabilities: caps, ...extras }
}

function makeCriterion(over: Partial<LabSelectionCriterion>): LabSelectionCriterion {
  return {
    id: 'c',
    weight: 'required',
    label: '',
    description: '',
    match: { operator: 'always_pass' },
    ...over,
  }
}

function makeCtx(over: Partial<LabRankingContext> = {}): LabRankingContext {
  return {
    modelParams: {},
    requiredForms: [],
    ...over,
  }
}

describe('rankLabs', () => {
  it('returns empty array when no labs provided', () => {
    const scores = rankLabs([], makeCtx(), [])
    expect(scores).toEqual([])
  })

  it('scores every lab against every applicable criterion', () => {
    const criteria = [
      makeCriterion({ id: 'c1', weight: 'required', match: { operator: 'has_capability', required_capability: 'humidity' } }),
      makeCriterion({ id: 'c2', weight: 'preferred', match: { operator: 'always_pass' } }),
      makeCriterion({ id: 'c3', weight: 'preferred', match: { operator: 'always_pass' } }),
    ]
    const labs = [makeLab('a', ['humidity']), makeLab('b', [])]
    const scores = rankLabs(labs, makeCtx(), criteria)

    expect(scores.length).toBe(2)
    const labA = scores.find(s => s.lab.id === 'a')!
    // labA passes all 3 criteria, 2 of which are preferred → recommended
    expect(labA.passed.map(c => c.id).sort()).toEqual(['c1', 'c2', 'c3'])
    expect(labA.failed).toEqual([])
    expect(labA.recommendation).toBe('recommended')

    const labB = scores.find(s => s.lab.id === 'b')!
    // labB fails the required c1, but passes the 2 preferred always_pass criteria
    expect(labB.passed.map(c => c.id).sort()).toEqual(['c2', 'c3'])
    expect(labB.failed.map(c => c.id)).toEqual(['c1'])
    expect(labB.recommendation).toBe('ineligible')
  })

  it('sorts: recommended first, then eligible, then ineligible', () => {
    // recommended = required + 2+ preferred
    // eligible    = required + 0-1 preferred
    // ineligible  = failed required
    const criteria = [
      makeCriterion({ id: 'req', weight: 'required', match: { operator: 'has_capability', required_capability: 'x' } }),
      makeCriterion({ id: 'p1', weight: 'preferred', match: { operator: 'has_capability', required_capability: 'p1' } }),
      makeCriterion({ id: 'p2', weight: 'preferred', match: { operator: 'has_capability', required_capability: 'p2' } }),
    ]
    const recommendedLab = makeLab('rec', ['x', 'p1', 'p2'])
    const eligibleLab = makeLab('elig', ['x'])         // passes req only
    const ineligibleLab = makeLab('inel', [])          // fails req
    const scores = rankLabs([eligibleLab, ineligibleLab, recommendedLab], makeCtx(), criteria)
    expect(scores.map(s => s.recommendation)).toEqual(['recommended', 'eligible', 'ineligible'])
  })
})

describe('criterion operators', () => {
  it('has_capability matches by exact capability', () => {
    const criteria = [makeCriterion({
      match: { operator: 'has_capability', required_capability: 'class-c' },
    })]
    const labs = [makeLab('has', ['class-c']), makeLab('missing', ['class-a'])]
    const scores = rankLabs(labs, makeCtx(), criteria)
    expect(scores[0].lab.id).toBe('has')
    expect(scores[0].recommendation).toBe('eligible')
  })

  it('capability_from_field concatenates prefix + model field value', () => {
    const criteria = [makeCriterion({
      match: {
        operator: 'capability_from_field',
        required_capability_prefix: 'class-',
        model_field: 'accuracyClass',
      },
    })]
    const labs = [makeLab('ok', ['class-c']), makeLab('no', ['class-a'])]
    const ctx = makeCtx({ modelParams: { accuracyClass: 'c' } })
    const scores = rankLabs(labs, ctx, criteria)
    expect(scores[0].lab.id).toBe('ok')
  })

  it('capability_covers_value parses unit suffixes (kg/t/g)', () => {
    const criteria = [makeCriterion({
      weight: 'required',
      match: {
        operator: 'capability_covers_value',
        required_capability_prefix: 'capacity-',
        model_field: 'emax',
      },
    })]
    const labs = [
      makeLab('big', ['capacity-10t']),       // 10000 kg — covers 5000
      makeLab('exact', ['capacity-5000kg']),  // 5000 kg — covers 5000
      makeLab('small', ['capacity-100kg']),   // 100 kg — doesn't cover
    ]
    const ctx = makeCtx({ modelParams: { emax: 5000 } })
    const scores = rankLabs(labs, ctx, criteria)

    const eligible = scores.filter(s => s.recommendation !== 'ineligible')
    expect(eligible.map(s => s.lab.id).sort()).toEqual(['big', 'exact'])
  })

  it('capability_prefix_match checks for any cap starting with prefix', () => {
    const criteria = [makeCriterion({
      match: { operator: 'capability_prefix_match', lab_capability_prefix: 'humidity-' },
    })]
    const labs = [
      makeLab('has-humidity', ['humidity-ch', 'humidity-sh']),
      makeLab('no-humidity', ['class-c']),
    ]
    const scores = rankLabs(labs, makeCtx(), criteria)
    expect(scores[0].lab.id).toBe('has-humidity')
  })

  it('always_pass always passes (used for soft preferred)', () => {
    const criteria = [makeCriterion({
      weight: 'preferred',
      match: { operator: 'always_pass' },
    })]
    const scores = rankLabs([makeLab('x', [])], makeCtx(), criteria)
    expect(scores[0].passed.length).toBe(1)
    expect(scores[0].preferredRank).toBe(1)
  })

  it('unknown operator passes (forward-compatible)', () => {
    const criteria = [makeCriterion({
      match: { operator: 'future_operator_xyz' },
    })]
    const scores = rankLabs([makeLab('x', [])], makeCtx(), criteria)
    expect(scores[0].passed.length).toBe(1)
  })
})

describe('applies_when', () => {
  it('skips criteria whose applies_when condition is not met', () => {
    const criteria = [
      makeCriterion({
        id: 'humidity-only',
        weight: 'required',
        applies_when: { model_field: 'humidityClass', in: ['CH', 'SH'] },
        match: { operator: 'has_capability', required_capability: 'humidity-chamber' },
      }),
    ]
    const labs = [makeLab('a', ['humidity-chamber'])]

    // No humidityClass set → criterion does NOT apply → lab passes vacuously
    const scoresWithout = rankLabs(labs, makeCtx({ modelParams: {} }), criteria)
    expect(scoresWithout[0].passed.length).toBe(0)
    expect(scoresWithout[0].failed.length).toBe(0)

    // humidityClass = CH → criterion applies → lab passes if cap present
    const scoresWith = rankLabs(labs, makeCtx({ modelParams: { humidityClass: 'CH' } }), criteria)
    expect(scoresWith[0].passed.length).toBe(1)
  })

  it('not_null filter', () => {
    const criteria = [makeCriterion({
      applies_when: { model_field: 'emax', not_null: true },
      match: { operator: 'always_pass' },
    })]
    const scores = rankLabs([makeLab('x', [])], makeCtx({ modelParams: { emax: null } }), criteria)
    expect(scores[0].passed.length).toBe(0)
  })

  it('equals filter', () => {
    const criteria = [makeCriterion({
      applies_when: { model_field: 'scheme', equals: 'B' },
      match: { operator: 'always_pass' },
    })]
    const scoresA = rankLabs([makeLab('x', [])], makeCtx({ modelParams: { scheme: 'A' } }), criteria)
    expect(scoresA[0].passed.length).toBe(0)
    const scoresB = rankLabs([makeLab('x', [])], makeCtx({ modelParams: { scheme: 'B' } }), criteria)
    expect(scoresB[0].passed.length).toBe(1)
  })
})

describe('eligibleLabs / topRecommendation', () => {
  it('eligibleLabs excludes ineligible', () => {
    const criteria = [makeCriterion({
      weight: 'required',
      match: { operator: 'has_capability', required_capability: 'x' },
    })]
    const labs = [makeLab('ok', ['x']), makeLab('no', [])]
    const scores = rankLabs(labs, makeCtx(), criteria)
    expect(eligibleLabs(scores).map(l => l.id)).toEqual(['ok'])
  })

  it('topRecommendation returns first eligible', () => {
    const criteria = [makeCriterion({
      weight: 'required',
      match: { operator: 'has_capability', required_capability: 'x' },
    })]
    const labs = [makeLab('first', ['x']), makeLab('second', ['x'])]
    const scores = rankLabs(labs, makeCtx(), criteria)
    expect(topRecommendation(scores)?.id).toBe('first')
  })

  it('topRecommendation returns null when all ineligible', () => {
    const criteria = [makeCriterion({
      weight: 'required',
      match: { operator: 'has_capability', required_capability: 'x' },
    })]
    const labs = [makeLab('no', [])]
    const scores = rankLabs(labs, makeCtx(), criteria)
    expect(topRecommendation(scores)).toBeNull()
  })
})

describe('filterTestLaboratories', () => {
  it('keeps only test-laboratory organizations', () => {
    const orgs = [
      makeLab('lab', [], { kind: 'test-laboratory' }),
      makeLab('ia', [], { kind: 'issuing-authority' }),
      makeLab('mfr', [], { kind: 'manufacturer' }),
      makeLab('lab2', [], { kind: 'test-laboratory' }),
    ]
    const filtered = filterTestLaboratories(orgs)
    expect(filtered.map(o => o.id)).toEqual(['lab', 'lab2'])
  })
})
