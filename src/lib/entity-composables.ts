// Entity composables — one per IndexedDB store.
// Each is a thin wrapper around defineEntityComposable.
// Adding a new entity = adding one file here.

import { defineEntityComposable } from './entity-composable'
import type {
  Application,
  InstrumentModelFamily,
  InstrumentModelGroup,
  MeasuringInstrument,
  InstrumentSample,
  TestRequest,
  TestAssignment,
  TestReport,
  EvaluationReport,
  ModelEvaluation,
  TestReportDetermination,
  FormInstance,
  Organization,
  CustodyEvent,
  AuditEvent,
} from './entity-types'

export type {
  Application,
  InstrumentModelFamily,
  InstrumentModelGroup,
  MeasuringInstrument,
  InstrumentSample,
  TestRequest,
  TestAssignment,
  TestReport,
  EvaluationReport,
  ModelEvaluation,
  TestReportDetermination,
  FormInstance,
  Organization,
  CustodyEvent,
  AuditEvent,
} from './entity-types'

// ── Composable functions (call these in Vue components) ─────────────

export function useApplication() {
  return defineEntityComposable<Application>('applications')
}

export function useModelFamily() {
  return defineEntityComposable<InstrumentModelFamily>('instrumentModelFamilies')
}

export function useModelGroup() {
  return defineEntityComposable<InstrumentModelGroup>('instrumentModelGroups')
}

export function useMeasuringInstrument() {
  return defineEntityComposable<MeasuringInstrument>('measuringInstruments')
}

export function useInstrumentSample() {
  return defineEntityComposable<InstrumentSample>('instrumentSamples')
}

export function useTestRequest() {
  return defineEntityComposable<TestRequest>('testRequests')
}

export function useTestAssignment() {
  return defineEntityComposable<TestAssignment>('testAssignments')
}

export function useTestReport() {
  return defineEntityComposable<TestReport>('testReports')
}

export function useEvaluationReport() {
  return defineEntityComposable<EvaluationReport>('evaluationReports')
}

export function useModelEvaluation() {
  return defineEntityComposable<ModelEvaluation>('modelEvaluations')
}

export function useTestReportDetermination() {
  return defineEntityComposable<TestReportDetermination>('testReportDeterminations')
}

export function useFormInstance() {
  return defineEntityComposable<FormInstance>('formInstances')
}

export function useOrganization() {
  return defineEntityComposable<Organization>('organizations')
}

export function useCustodyEvent() {
  return defineEntityComposable<CustodyEvent>('custodyEvents')
}

export function useAuditEvent() {
  return defineEntityComposable<AuditEvent>('auditEvents')
}
