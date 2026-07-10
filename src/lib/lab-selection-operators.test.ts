import { describe, it, expect } from 'vitest'
import {
  registerMatchOperator,
  getMatchOperator,
  listMatchOperators,
} from './lab-selection-operators'
import type { Lab, LabRankingContext, MatchSpec } from './lab-selection.service'

const noopContext: LabRankingContext = { modelParams: {}, requiredForms: [] }
const noopLab: Lab = { capabilities: [] }
const noopMatch: MatchSpec = { operator: '' }

describe('operator registry', () => {
  it('registers all 5 built-in operators', () => {
    const names = listMatchOperators()
    expect(names).toContain('always_pass')
    expect(names).toContain('has_capability')
    expect(names).toContain('capability_from_field')
    expect(names).toContain('capability_covers_value')
    expect(names).toContain('capability_prefix_match')
    expect(names.length).toBeGreaterThanOrEqual(5)
  })

  it('getMatchOperator returns the handler for a known operator', () => {
    const op = getMatchOperator('always_pass')
    expect(op).toBeDefined()
    expect(op!(noopMatch, noopLab, noopContext)).toBe(true)
  })

  it('getMatchOperator returns undefined for unknown operator', () => {
    expect(getMatchOperator('nonexistent_op')).toBeUndefined()
  })

  it('a custom operator can be registered without editing the service', () => {
    let wasCalled = false
    registerMatchOperator('test_custom_op', () => {
      wasCalled = true
      return true
    })

    const op = getMatchOperator('test_custom_op')
    expect(op).toBeDefined()
    op!(noopMatch, noopLab, noopContext)
    expect(wasCalled).toBe(true)
  })

  it('registerMatchOperator overwrites existing operator (last-wins)', () => {
    registerMatchOperator('test_overwrite', () => false)
    registerMatchOperator('test_overwrite', () => true)

    const op = getMatchOperator('test_overwrite')
    expect(op!(noopMatch, noopLab, noopContext)).toBe(true)
  })
})
