// ─────────────────────────────────────────────────────────────────────
// Evaluation Aggregator Service — 3-level synthesis.
//
// Migrated from smart/browser/src/services/evaluation-aggregator.service.ts.
//
// Pure service — takes domain inputs, returns derived summary. No state.
//
// Levels:
//   Level 1: TestReport → TestReportDetermination (admissibility gate)
//   Level 2: ModelEvaluation (per-model technical synthesis across labs)
//   Level 3: EvaluationReport (family-level aggregate)
// ─────────────────────────────────────────────────────────────────────

import {
  isEvaluationComplete,
  deriveModelDecision,
  deriveFamilyDecision,
  type TestReportDetermination,
  type ModelEvaluation,
  type ModelDecision,
  type FormResult,
} from './evaluation-domain'

/** Structural input — what the aggregator actually reads from a FormInstance. */
export interface FormInstance {
  formId: string
  testReportId?: string
  modelId?: string
  sampleId?: string
  result?: FormResult
}

export interface FormProgram {
  /** Required form identifiers per the test program for a given model. */
  [modelId: string]: string[]
}

export interface AggregationInput {
  testReportIds: readonly string[]
  determinations: ReadonlyArray<TestReportDetermination>
  /** All FormInstances across all TestReports. */
  formInstances: ReadonlyArray<FormInstance>
  /** Per-model required form program. */
  formProgram: FormProgram
  /** Lab IDs by testReportId (for contributor attribution). */
  labsByTestReport: Map<string, string>
}

export interface FormAggregate {
  formId: string
  instances: Array<{ testReportId: string; instance: FormInstance }>
  aggregateResult: FormResult | 'MIXED'
}

export interface AggregationResult {
  /** Family-level decision (the EvaluationReport.overallDecision). */
  overallDecision: 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED' | 'PENDING'
  /** Whether the evaluation can be finalized. */
  canFinalize: boolean
  /** Per-TR admissibility decisions (Level 1). */
  perReport: Map<string, TestReportDetermination | undefined>
  /** Per-model technical evaluations (Level 2). */
  modelEvaluations: ModelEvaluation[]
  /** Outstanding TRs without an admissibility determination. */
  pendingReportIds: string[]
  /** Outstanding models with INCOMPLETE decision. */
  incompleteModelIds: string[]
  /** Per-form aggregate across accepted TRs. */
  perForm: FormAggregate[]
}

/**
 * Aggregate determinations + form instances + per-model form program
 * into a 3-level evaluation summary.
 */
export function aggregateEvaluation(input: AggregationInput): AggregationResult {
  // ── Level 1: Admissibility ──────────────────────────────────────
  const perReport = new Map<string, TestReportDetermination | undefined>()
  for (const trId of input.testReportIds) {
    perReport.set(trId, input.determinations.find(d => d.testReportId === trId))
  }
  const pendingReportIds = input.testReportIds.filter(id => !perReport.get(id))

  // Admissibility gate: every TR must be ACCEPTED or CONDITIONALLY_ACCEPTED.
  // REJECTED TRs are excluded from technical synthesis.
  const acceptedTestReportIds = new Set(
    input.testReportIds.filter(id => {
      const det = perReport.get(id)
      return det && (det.decision === 'ACCEPTED' || det.decision === 'CONDITIONALLY_ACCEPTED')
    }),
  )

  const acceptedFormInstances = input.formInstances.filter(
    fi => fi.testReportId && acceptedTestReportIds.has(fi.testReportId),
  )

  // ── Level 2: Per-model synthesis ────────────────────────────────
  const modelEvaluations: ModelEvaluation[] = []
  const modelIds = new Set<string>(
    acceptedFormInstances
      .map(fi => fi.modelId || fi.sampleId)
      .filter((v): v is string => !!v),
  )

  // Always include every model that has a required form program, even
  // if no evidence has been submitted yet (so the user sees INCOMPLETE).
  for (const modelId of Object.keys(input.formProgram)) {
    modelIds.add(modelId)
  }

  for (const modelId of modelIds) {
    const requiredFormIds = input.formProgram[modelId] ?? []
    const modelInstances = acceptedFormInstances.filter(
      fi => (fi.modelId || fi.sampleId) === modelId,
    )
    const formResults = modelInstances.map(fi => ({
      formId: fi.formId,
      result: (fi.result || 'PENDING') as FormResult,
    }))

    const decision = deriveModelDecision({ requiredFormIds, formResults })

    const coveredSet = new Set(formResults.map(r => r.formId))
    const coveredFormIds = requiredFormIds.filter(id => coveredSet.has(id))
    const missingFormIds = requiredFormIds.filter(id => !coveredSet.has(id))

    const contributorTRIds = new Set<string>()
    const contributorLabIds = new Set<string>()
    for (const fi of modelInstances) {
      if (fi.testReportId) {
        contributorTRIds.add(fi.testReportId)
        const labId = input.labsByTestReport.get(fi.testReportId)
        if (labId) contributorLabIds.add(labId)
      }
    }

    modelEvaluations.push({
      id: `me-${modelId}`,
      evaluationReportId: '',   // filled by caller
      modelId,
      requiredFormIds,
      coveredFormIds,
      missingFormIds,
      contributorTestReportIds: [...contributorTRIds],
      contributorLabIds: [...contributorLabIds],
      decision,
      reviewerName: '',         // filled by caller
      reviewDate: '',           // filled by caller
    })
  }

  const incompleteModelIds = modelEvaluations
    .filter(me => me.decision === 'INCOMPLETE')
    .map(me => me.modelId)

  // ── Level 3: Family-level aggregate ─────────────────────────────
  const admissibilityComplete = isEvaluationComplete(input.testReportIds, input.determinations)
  const allModelsComplete = incompleteModelIds.length === 0
  const canFinalize = admissibilityComplete && allModelsComplete && modelEvaluations.length > 0

  let overallDecision: AggregationResult['overallDecision']
  if (!admissibilityComplete || !allModelsComplete || modelEvaluations.length === 0) {
    overallDecision = 'PENDING'
  } else {
    overallDecision = deriveFamilyDecisionFromTrsAndModels({
      determinations: input.determinations,
      modelDecisions: modelEvaluations.map(me => me.decision),
    })
  }

  const perForm = aggregateByForm(acceptedFormInstances)

  return {
    overallDecision,
    canFinalize,
    perReport,
    modelEvaluations,
    pendingReportIds,
    incompleteModelIds,
    perForm,
  }
}

function deriveFamilyDecisionFromTrsAndModels(params: {
  determinations: ReadonlyArray<TestReportDetermination>
  modelDecisions: readonly ModelDecision[]
}): 'APPROVED' | 'REJECTED' | 'CONDITIONALLY_APPROVED' {
  const familyFromModels = deriveFamilyDecision(params.modelDecisions)
  if (familyFromModels === 'REJECTED') return 'REJECTED'
  if (familyFromModels === 'CONDITIONALLY_APPROVED') return 'CONDITIONALLY_APPROVED'
  // APPROVED at model level — also check TR determinations for conditional
  if (params.determinations.some(d => d.decision === 'CONDITIONALLY_ACCEPTED')) {
    return 'CONDITIONALLY_APPROVED'
  }
  return 'APPROVED'
}

function aggregateByForm(instances: ReadonlyArray<FormInstance>): FormAggregate[] {
  const byForm = new Map<string, FormAggregate>()
  for (const fi of instances) {
    const existing = byForm.get(fi.formId) ?? {
      formId: fi.formId,
      instances: [] as FormAggregate['instances'],
      aggregateResult: 'PENDING' as FormAggregate['aggregateResult'],
    }
    existing.instances.push({
      testReportId: fi.testReportId ?? '',
      instance: fi,
    })
    byForm.set(fi.formId, existing)
  }
  for (const agg of byForm.values()) {
    agg.aggregateResult = deriveFormAggregate(agg.instances.map(i => i.instance))
  }
  return [...byForm.values()]
}

function deriveFormAggregate(
  instances: ReadonlyArray<FormInstance>,
): FormAggregate['aggregateResult'] {
  if (instances.length === 0) return 'PENDING'
  const results = new Set(instances.map(i => i.result ?? 'PENDING'))
  if (results.size === 1) return results.values().next().value as FormAggregate['aggregateResult']
  if (results.has('FAIL')) return 'FAIL'
  return 'MIXED'
}
