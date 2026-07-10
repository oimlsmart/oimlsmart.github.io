// Entity composables — one per IndexedDB store.
// Each is a thin wrapper around defineEntityComposable.
// Adding a new entity = adding one file here.

import { defineEntityComposable } from './entity-composable'
import type { StoreName } from './repository'

// ── Structural types (only fields the API surface needs) ────────────

export interface Application extends Record<string, unknown> { id: string }
export interface InstrumentModelFamily extends Record<string, unknown> { id: string }
export interface InstrumentModelGroup extends Record<string, unknown> { id: string }
export interface MeasuringInstrument extends Record<string, unknown> { id: string }
export interface InstrumentSample extends Record<string, unknown> { id: string }
export interface TestRequest extends Record<string, unknown> { id: string }
export interface TestAssignment extends Record<string, unknown> { id: string }
export interface TestReport extends Record<string, unknown> { id: string }
export interface EvaluationReport extends Record<string, unknown> { id: string }
export interface ModelEvaluation extends Record<string, unknown> { id: string }
export interface TestReportDetermination extends Record<string, unknown> { id: string }
export interface FormInstance extends Record<string, unknown> { id: string }
export interface Organization extends Record<string, unknown> { id: string }
export interface CustodyEvent extends Record<string, unknown> { id: string }
export interface AuditEvent extends Record<string, unknown> { id: string }

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
