import { describe, it, expect } from 'vitest'
import { ok, err, isOk, isErr, unwrapOr, mapOk, type Result } from './result'

describe('Result helpers', () => {
  describe('ok / err constructors', () => {
    it('ok() produces a success result with value', () => {
      const r = ok(42)
      expect(r.ok).toBe(true)
      expect((r as { value: number }).value).toBe(42)
    })

    it('err() produces a failure result with error', () => {
      const r = err('boom')
      expect(r.ok).toBe(false)
      expect((r as { error: string }).error).toBe('boom')
    })
  })

  describe('type guards', () => {
    it('isOk narrows to Ok in a branch', () => {
      const r: Result<number, string> = ok(5)
      if (isOk(r)) {
        // r is narrowed to Ok<number> here
        expect(r.value).toBe(5)
      } else {
        expect.fail('should have narrowed to Ok')
      }
    })

    it('isErr narrows to Err in a branch', () => {
      const r: Result<number, string> = err('nope')
      if (isErr(r)) {
        expect(r.error).toBe('nope')
      } else {
        expect.fail('should have narrowed to Err')
      }
    })
  })

  describe('unwrapOr', () => {
    it('returns the value on success', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42)
    })

    it('returns the fallback on failure', () => {
      expect(unwrapOr(err('boom'), 0)).toBe(0)
    })

    it('fallback works for complex types', () => {
      expect(unwrapOr(err('x'), [1, 2, 3])).toEqual([1, 2, 3])
    })
  })

  describe('mapOk', () => {
    it('transforms the success value', () => {
      const r = mapOk(ok(5), n => n * 2)
      expect(isOk(r) && r.value).toBe(10)
    })

    it('passes errors through unchanged', () => {
      const r = mapOk(err<number, string>('fail'), n => n * 2)
      expect(isErr(r) && r.error).toBe('fail')
    })
  })

  describe('error type can be structured', () => {
    it('supports typed error variants', () => {
      type LabError =
        | { kind: 'EmptyInput' }
        | { kind: 'NoMatch'; detail: string }

      const fail: Result<string[], LabError> = err({ kind: 'NoMatch', detail: 'no labs' })
      if (isErr(fail)) {
        expect(fail.error.kind).toBe('NoMatch')
      }
    })
  })
})
