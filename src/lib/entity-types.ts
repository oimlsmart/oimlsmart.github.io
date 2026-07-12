export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
export type TestRequestStatus = 'DRAFT' | 'ISSUED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED'
export type TestAssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type OrganizationKind = 'issuing-authority' | 'test-laboratory' | 'manufacturer' | 'utilizer' | 'associate'
export type Scheme = 'A' | 'B'
export type DeterminationDecision = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'INCOMPLETE'
export type EvaluationReportStatus = 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED'
export type OverallDecision = 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED' | 'PENDING'
export type SampleStatus = 'available' | 'in-use' | 'returned' | 'consumed'

export interface Application {
  id: string
  status: ApplicationStatus | string
  applicationNumber?: string
  dateOfApplication?: string
  modelFamilyId?: string
  instrumentModelFamilyId?: string
  applicantId?: string
  standardId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface InstrumentModelFamily {
  id: string
  name?: string
  familyName?: string
  familyCode?: string
  technology?: string
  description?: string
  standardId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface InstrumentModelGroup {
  id: string
  groupLabel?: string
  accuracyClass?: string
  n_LC?: number
  Y?: number
  Z?: number
  familyId?: string
  standardId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface MeasuringInstrument {
  id: string
  model: string
  modelFamilyId?: string
  modelGroupId?: string
  emax?: number
  accuracyClass?: string
  service?: string
  standardId?: string
  manufacturerId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface InstrumentSample {
  id: string
  modelId: string
  familyId?: string
  applicationId?: string
  serialNumber?: string
  status?: SampleStatus | string
  standardId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface TestRequest {
  id: string
  requestNumber?: string
  applicationId: string
  assignedLaboratoryId: string
  standardId: string
  scheme: Scheme | string
  status: TestRequestStatus | string
  requestingAuthorityId?: string
  issuedBy?: string
  issuedDate?: string
  testConditions?: Record<string, unknown>
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface TestAssignment {
  id: string
  testRequestId: string
  applicationId: string
  formId: string
  sampleId: string
  modelId: string
  laboratoryId: string
  status: TestAssignmentStatus | string
  [key: string]: unknown
}

export interface TestReport {
  id: string
  testRequestId?: string
  [key: string]: unknown
}

export interface EvaluationReport {
  id: string
  reportNumber?: string
  testReportIds: string[]
  standardId?: string
  applicationId?: string
  authorityId?: string
  overallDecision?: OverallDecision | string
  status?: EvaluationReportStatus | string
  reviewNotes?: string
  reviewerName?: string
  conditions?: unknown[]
  synopsis?: Record<string, unknown>
  summary?: unknown[]
  examinationFormInstances?: unknown[]
  reportFormInstances?: unknown[]
  formDeterminations?: unknown[]
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface ModelEvaluation {
  id: string
  evaluationReportId?: string
  modelId?: string
  decision?: DeterminationDecision | string
  [key: string]: unknown
}

export interface TestReportDetermination {
  id: string
  testReportId: string
  decision: DeterminationDecision | string
  evaluationReportId: string
  reviewerName?: string
  reviewDate?: string
  [key: string]: unknown
}

export interface FormInstance {
  id: string
  formId?: string
  testReportId?: string
  modelId?: string
  sampleId?: string
  result?: string
  [key: string]: unknown
}

export interface Organization {
  id: string
  name: string
  kind?: OrganizationKind | string
  capabilities?: string[]
  standardId?: string
  created?: string
  modified?: string
  [key: string]: unknown
}

export interface CustodyEvent {
  id: string
  [key: string]: unknown
}

export interface AuditEvent {
  id: string
  [key: string]: unknown
}
