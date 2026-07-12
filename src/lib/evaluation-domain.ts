// ─────────────────────────────────────────────────────────────────────
// Evaluation domain — types + decision-derivation logic.
//
// Migrated from smart/browser/src/data/types/{test-report-determination,
// model-evaluation}.ts. Bundled into one module because the helpers
// reference each other (TR-level decisions feed into model-level
// decisions feed into family-level decisions).
//
// The original used generated types from data-classes.yaml. Here we
// declare structural types — only the fields the helpers actually
// read. Caller-side full records remain assignable.
// ─────────────────────────────────────────────────────────────────────

// ── Level 1: TestReport admissibility ────────────────────────────────

export type TestReportDeterminationDecision =
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONDITIONALLY_ACCEPTED'

export interface TestReportDetermination {
  id: string
  evaluationReportId: string
  testReportId: string
  decision: TestReportDeterminationDecision
  reviewerName: string
  reviewDate: string
}

export type OverallDecision =
  | 'APPROVED'
  | 'REJECTED'
  | 'CONDITIONALLY_APPROVED'
  | 'PENDING'

/**
 * Whether every TestReport has a determination — the admissibility gate.
 */
export function isEvaluationComplete(
  testReportIds: readonly string[],
  determinations: ReadonlyArray<Pick<TestReportDetermination, 'testReportId'>>,
): boolean {
  if (testReportIds.length === 0) return false
  const determined = new Set(determinations.map(d => d.testReportId))
  return testReportIds.every(id => determined.has(id))
}

// ── Level 2: Per-model technical synthesis ───────────────────────────

export type ModelDecision = 'PASS' | 'FAIL' | 'CONDITIONAL' | 'INCOMPLETE'

export interface ModelEvaluation {
  id: string
  evaluationReportId: string
  modelId: string
  requiredFormIds: string[]
  coveredFormIds: string[]
  missingFormIds: string[]
  contributorTestReportIds: string[]
  contributorLabIds: string[]
  decision: ModelDecision
  reviewerName: string
  reviewDate: string
}

export type FormResult = 'PASS' | 'FAIL' | 'NA' | 'PENDING'

export interface ModelFormResult {
  formId: string
  result: FormResult
}

/**
 * Derive the per-model decision from a set of FormInstance results.
 *
 * Rules:
 *   - INCOMPLETE: any required form has NO submitted instance
 *   - FAIL: any submitted instance has result='FAIL'
 *   - CONDITIONAL: covered but some instance is PENDING
 *   - PASS: all required covered with all PASS/NA
 */
export function deriveModelDecision(params: {
  requiredFormIds: readonly string[]
  formResults: ReadonlyArray<ModelFormResult>
}): ModelDecision {
  const byForm = new Map<string, Set<FormResult>>()
  for (const r of params.formResults) {
    if (!byForm.has(r.formId)) byForm.set(r.formId, new Set())
    byForm.get(r.formId)!.add(r.result)
  }

  if (params.requiredFormIds.some(id => !byForm.has(id))) return 'INCOMPLETE'
  if (params.requiredFormIds.some(id => byForm.get(id)?.has('FAIL'))) return 'FAIL'
  if (params.requiredFormIds.some(id => byForm.get(id)?.has('PENDING'))) return 'CONDITIONAL'
  return 'PASS'
}

/**
 * Derive the family-level decision from a complete set of per-model decisions:
 *   - Empty → PENDING
 *   - Any INCOMPLETE → PENDING (cannot finalize)
 *   - Any FAIL → REJECTED
 *   - Any CONDITIONAL → CONDITIONALLY_APPROVED
 *   - Otherwise → APPROVED
 */
export function deriveFamilyDecision(
  modelDecisions: readonly ModelDecision[],
): OverallDecision {
  if (modelDecisions.length === 0) return 'PENDING'
  if (modelDecisions.some(d => d === 'INCOMPLETE')) return 'PENDING'
  if (modelDecisions.some(d => d === 'FAIL')) return 'REJECTED'
  if (modelDecisions.some(d => d === 'CONDITIONAL')) return 'CONDITIONALLY_APPROVED'
  return 'APPROVED'
}
