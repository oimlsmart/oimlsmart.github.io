import { describe, it, expect } from 'vitest'
import { bucketByStatus, countOpen, formatAssignments, TestRequestStatus, type TestRequestLike } from './test-request-lifecycle'

function makeTR(over: Partial<TestRequestLike>): TestRequestLike {
  return { id: 'x', status: TestRequestStatus.ISSUED, assignedLaboratoryId: 'lab-a', ...over }
}

describe('bucketByStatus', () => {
  const requests: TestRequestLike[] = [
    makeTR({ id: '1', status: 'ISSUED' }),
    makeTR({ id: '2', status: 'ACCEPTED_BY_LAB' }),
    makeTR({ id: '3', status: 'IN_PROGRESS' }),
    makeTR({ id: '4', status: 'COMPLETED' }),
    makeTR({ id: '5', status: 'ISSUED', assignedLaboratoryId: 'other-lab' }),
    makeTR({ id: '6', status: 'UNKNOWN_STATUS' }),
  ]

  it('sorts requests assigned to the lab into the 4 lifecycle buckets', () => {
    const b = bucketByStatus(requests, 'lab-a')
    expect(b.incoming.map(r => r.id)).toEqual(['1'])
    expect(b.accepted.map(r => r.id)).toEqual(['2'])
    expect(b.inProgress.map(r => r.id)).toEqual(['3'])
    expect(b.completed.map(r => r.id)).toEqual(['4'])
  })

  it('excludes requests assigned to other labs', () => {
    const b = bucketByStatus(requests, 'lab-a')
    expect(b.incoming.find(r => r.id === '5')).toBeUndefined()
  })

  it('drops requests with unrecognized status', () => {
    const b = bucketByStatus(requests, 'lab-a')
    const all = [...b.incoming, ...b.accepted, ...b.inProgress, ...b.completed]
    expect(all.find(r => r.id === '6')).toBeUndefined()
  })

  it('returns empty buckets when no requests match', () => {
    const b = bucketByStatus([], 'lab-a')
    expect(b.incoming).toEqual([])
    expect(b.completed).toEqual([])
  })
})

describe('countOpen', () => {
  it('sums incoming + accepted + inProgress', () => {
    const b = bucketByStatus([
      makeTR({ id: '1', status: 'ISSUED' }),
      makeTR({ id: '2', status: 'ACCEPTED_BY_LAB' }),
      makeTR({ id: '3', status: 'IN_PROGRESS' }),
      makeTR({ id: '4', status: 'COMPLETED' }),
    ], 'lab-a')
    expect(countOpen(b)).toBe(3)
  })
})

describe('formatAssignments', () => {
  it('counts tuples and distinct forms', () => {
    expect(formatAssignments(makeTR({
      assignments: [{ formId: 'a' }, { formId: 'b' }, { formId: 'a' }],
    }))).toBe('3 tuples · 2 forms')
  })

  it('handles missing assignments', () => {
    expect(formatAssignments(makeTR({}))).toBe('0 tuples · 0 forms')
  })
})
