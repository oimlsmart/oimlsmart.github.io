export const TestRequestStatus = {
  ISSUED: 'ISSUED',
  ACCEPTED_BY_LAB: 'ACCEPTED_BY_LAB',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const

export type TestRequestStatusValue = typeof TestRequestStatus[keyof typeof TestRequestStatus]

export interface TestRequestLike {
  id: string
  status: string
  assignedLaboratoryId?: string
  requestNumber?: string
  assignments?: Array<{ formId?: string }>
  [key: string]: unknown
}

export interface LabInboxBuckets<T extends TestRequestLike> {
  incoming: T[]
  accepted: T[]
  inProgress: T[]
  completed: T[]
}

const STATUS_TO_BUCKET: Record<string, keyof LabInboxBuckets<TestRequestLike>> = {
  [TestRequestStatus.ISSUED]: 'incoming',
  [TestRequestStatus.ACCEPTED_BY_LAB]: 'accepted',
  [TestRequestStatus.IN_PROGRESS]: 'inProgress',
  [TestRequestStatus.COMPLETED]: 'completed',
}

export function bucketByStatus<T extends TestRequestLike>(
  requests: T[],
  labId: string,
): LabInboxBuckets<T> {
  const buckets: LabInboxBuckets<T> = { incoming: [], accepted: [], inProgress: [], completed: [] }
  for (const r of requests) {
    if (r.assignedLaboratoryId !== labId) continue
    const bucket = STATUS_TO_BUCKET[r.status]
    if (bucket) buckets[bucket].push(r)
  }
  return buckets
}

export function countOpen<T extends TestRequestLike>(buckets: LabInboxBuckets<T>): number {
  return buckets.incoming.length + buckets.accepted.length + buckets.inProgress.length
}

export function formatAssignments(r: TestRequestLike): string {
  const assignments = r.assignments ?? []
  const forms = new Set(assignments.map(a => a.formId))
  return `${assignments.length} tuples · ${forms.size} forms`
}
