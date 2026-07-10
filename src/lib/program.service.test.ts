import { describe, it, expect } from 'vitest'
import {
  applies,
  requiredFormsFor,
  buildFormProgram,
  type ApplicabilityRule,
  type ConformanceTest,
  type FormDecl,
  type ModelDimensions,
} from './program.service'

describe('applies', () => {
  const model: ModelDimensions = {
    accuracyClass: 'C',
    technology: 'analogue-passive',
    humidityClass: 'CH',
  }

  it('returns true for missing rule', () => {
    expect(applies(undefined, model)).toBe(true)
  })

  it('returns true for empty rule', () => {
    expect(applies({}, model)).toBe(true)
  })

  it('matches by accuracy_class (case-insensitive)', () => {
    const rule: ApplicabilityRule = { accuracy_class: ['c', 'd'] }
    expect(applies(rule, model)).toBe(true)
  })

  it('rejects when accuracy_class excluded', () => {
    const rule: ApplicabilityRule = { accuracy_class: ['a', 'b'] }
    expect(applies(rule, model)).toBe(false)
  })

  it('matches by technology (case-sensitive)', () => {
    expect(applies({ technology: ['analogue-passive'] }, model)).toBe(true)
    expect(applies({ technology: ['digital'] }, model)).toBe(false)
  })

  it('matches by humidity_class (case-insensitive)', () => {
    expect(applies({ humidity_class: ['ch'] }, model)).toBe(true)
    expect(applies({ humidity_class: ['sh', 'nh'] }, model)).toBe(false)
  })

  it('combines constraints with AND', () => {
    const rule: ApplicabilityRule = {
      accuracy_class: ['c'],
      technology: ['analogue-passive'],
      humidity_class: ['ch'],
    }
    expect(applies(rule, model)).toBe(true)

    const rule2: ApplicabilityRule = {
      accuracy_class: ['c'],
      technology: ['digital'],   // model is analogue
    }
    expect(applies(rule2, model)).toBe(false)
  })

  it('skips constraint when model lacks the field', () => {
    // If model has no humidityClass, humidity_class rule is ignored
    expect(applies({ humidity_class: ['ch'] }, { accuracyClass: 'C' })).toBe(true)
  })
})

describe('requiredFormsFor', () => {
  const tests: ConformanceTest[] = [
    { name: 'Measurement error', identifier: '/conf/measurement-error', applicability: { accuracy_class: ['A', 'B', 'C', 'D'] } },
    { name: 'Humidity CH', identifier: '/conf/humidity-ch', applicability: { humidity_class: ['CH'] } },
    { name: 'Humidity SH', identifier: '/conf/humidity-sh', applicability: { humidity_class: ['SH'] } },
    { name: 'EMC tests', identifier: '/conf/emc', applicability: { technology: ['digital'] } },
    { name: 'Always applies', identifier: '/conf/always' },
  ]
  const forms: FormDecl[] = [
    { name: 'load-cell-errors', conformance_test: '/conf/measurement-error' },
    { name: 'humidity-ch', conformance_test: '/conf/humidity-ch' },
    { name: 'humidity-sh', conformance_test: '/conf/humidity-sh' },
    { name: 'emc-susceptibility', conformance_test: ['/conf/emc', '/conf/emc-susceptibility'] },
    { name: 'unbound-form' },  // no conformance_test
  ]

  it('returns empty when no tests apply', () => {
    expect(requiredFormsFor({ tests: [], forms, model: { accuracyClass: 'C' } })).toEqual([])
  })

  it('returns matching forms for analogue class C with CH humidity', () => {
    const model: ModelDimensions = {
      accuracyClass: 'C',
      technology: 'analogue-passive',
      humidityClass: 'CH',
    }
    const r = requiredFormsFor({ tests, forms, model })
    expect(r).toEqual([
      'humidity-ch',
      'load-cell-errors',
    ])  // sorted
  })

  it('includes EMC form only for digital models', () => {
    const digital: ModelDimensions = { technology: 'digital' }
    expect(requiredFormsFor({ tests, forms, model: digital })).toContain('emc-susceptibility')

    const analogue: ModelDimensions = { technology: 'analogue-passive' }
    expect(requiredFormsFor({ tests, forms, model: analogue })).not.toContain('emc-susceptibility')
  })

  it('deduplicates forms bound to multiple tests', () => {
    const digital: ModelDimensions = { technology: 'digital' }
    const r = requiredFormsFor({ tests, forms, model: digital })
    const emcCount = r.filter(f => f === 'emc-susceptibility').length
    expect(emcCount).toBe(1)
  })

  it('includes always-applicable tests', () => {
    const r = requiredFormsFor({ tests, forms, model: { accuracyClass: 'A' } })
    // '/conf/always' has no form binding — it's a test but no form satisfies it
    // So nothing extra appears. Verify by adding a binding.
    const formsWithAlways: FormDecl[] = [
      ...forms,
      { name: 'always-form', conformance_test: '/conf/always' },
    ]
    const r2 = requiredFormsFor({ tests, forms: formsWithAlways, model: { accuracyClass: 'A' } })
    expect(r2).toContain('always-form')
  })

  it('ignores tests without identifier', () => {
    const t: ConformanceTest[] = [{ name: 'orphan', applicability: {} }]
    expect(requiredFormsFor({ tests: t, forms, model: { accuracyClass: 'C' } })).toEqual([])
  })
})

describe('buildFormProgram', () => {
  it('produces per-model form list', () => {
    const tests: ConformanceTest[] = [
      { name: 'a', identifier: '/conf/a', applicability: { accuracy_class: ['a', 'b'] } },
      { name: 'b', identifier: '/conf/b', applicability: { accuracy_class: ['c', 'd'] } },
    ]
    const forms: FormDecl[] = [
      { name: 'form-a', conformance_test: '/conf/a' },
      { name: 'form-b', conformance_test: '/conf/b' },
    ]
    const models = [
      { id: 'm1', accuracyClass: 'A' as const },
      { id: 'm2', accuracyClass: 'C' as const },
    ]
    const program = buildFormProgram({ tests, forms, models })
    expect(program).toEqual({
      m1: ['form-a'],
      m2: ['form-b'],
    })
  })
})
