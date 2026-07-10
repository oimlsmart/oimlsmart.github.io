// ─────────────────────────────────────────────────────────────────────
// IndexedDB store schema — pure data, single source of truth.
//
// Migrated from smart/browser/src/composables/database.ts.
// The schema is a plain object: store name → { key, indexes }.
// No imports from generated types — the structural type constraint
// ({ id: string }) is enforced by Repository<T> at the consumer side.
// ─────────────────────────────────────────────────────────────────────

export interface StoreMeta {
  /** Key path for the object store (always 'id' in this schema). */
  readonly key: string
  /** Index name → index keyPath. */
  readonly indexes: Record<string, string>
}

export const STORE_SCHEMA = {
  formInstances: {
    key: 'id',
    indexes: { formId: 'formId', standardId: 'standardId', testReportId: 'testReportId', sampleId: 'sampleId', laboratoryId: 'laboratoryId', modelId: 'modelId' },
  },
  certificates: { key: 'id', indexes: { standardId: 'standardId' } },
  certificateAnnexes: { key: 'id', indexes: { certificateId: 'certificateId' } },
  organizations: { key: 'id', indexes: { kind: 'kind', oimlCode: 'oimlCode', oimlId: 'oimlId' } },
  manufacturers: { key: 'id', indexes: { company: 'company' } },
  instrumentModelFamilies: { key: 'id', indexes: { manufacturerId: 'manufacturerId', standardId: 'standardId' } },
  instrumentModelGroups: { key: 'id', indexes: { familyId: 'familyId', manufacturerId: 'manufacturerId', standardId: 'standardId' } },
  measuringInstruments: { key: 'id', indexes: { modelFamilyId: 'modelFamilyId', modelGroupId: 'modelGroupId', manufacturerId: 'manufacturerId', standardId: 'standardId' } },
  instrumentSamples: { key: 'id', indexes: { familyId: 'familyId', modelId: 'modelId', applicationId: 'applicationId', serialNumber: 'serialNumber', status: 'status', standardId: 'standardId' } },
  custodyEvents: { key: 'id', indexes: { sampleId: 'sampleId' } },
  testRequests: { key: 'id', indexes: { applicationId: 'applicationId', assignedLaboratoryId: 'assignedLaboratoryId', requestingAuthorityId: 'requestingAuthorityId', status: 'status', testReportId: 'testReportId', standardId: 'standardId' } },
  testAssignments: { key: 'id', indexes: { testRequestId: 'testRequestId', sampleId: 'sampleId', modelId: 'modelId', laboratoryId: 'laboratoryId', formId: 'formId', status: 'status', applicationId: 'applicationId' } },
  testReports: { key: 'id', indexes: { laboratoryId: 'laboratoryId', status: 'status', standardId: 'standardId', testRequestId: 'testRequestId', sampleId: 'sampleId', applicationId: 'applicationId' } },
  evaluationReports: { key: 'id', indexes: { authorityId: 'authorityId', standardId: 'standardId', applicationId: 'applicationId' } },
  testReportDeterminations: { key: 'id', indexes: { evaluationReportId: 'evaluationReportId', testReportId: 'testReportId' } },
  modelEvaluations: { key: 'id', indexes: { evaluationReportId: 'evaluationReportId', modelId: 'modelId', decision: 'decision' } },
  applications: { key: 'id', indexes: { manufacturerId: 'manufacturerId', status: 'status', standardId: 'standardId', instrumentModelFamilyId: 'instrumentModelFamilyId', modelFamilyId: 'modelFamilyId' } },
  auditEvents: { key: 'id', indexes: { entityType: 'entityType', timestamp: 'timestamp', standardId: 'standardId' } },
  experts: { key: 'id', indexes: { kind: 'kind' } },
} as const satisfies Record<string, StoreMeta>

export type StoreName = keyof typeof STORE_SCHEMA

export const ALL_STORE_NAMES = Object.keys(STORE_SCHEMA) as readonly StoreName[]

export const DB_NAME = 'oiml-smart'
export const DB_VERSION = 1
