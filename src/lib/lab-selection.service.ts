// ─────────────────────────────────────────────────────────────────────
// Lab Selection Service — generic criterion evaluator.
//
// Operators are registered in lab-selection-operators.ts via an
// operator registry (true OCP — adding an operator = registering a
// handler, not editing this file). evaluateMatch looks up the
// operator by name and falls back to pass for unknown operators.
//
// Adding a new criterion = adding a YAML entry with one of the
// registered operators. Adding a new operator = calling
// registerMatchOperator in lab-selection-operators.ts.
// The service never references R 60 domain concepts directly.
// ─────────────────────────────────────────────────────────────────────

import { getMatchOperator } from './lab-selection-operators'

export type CriterionWeight = 'required' | 'preferred'
export type ParameterType = 'dimension' | 'parameter' | 'operational'

export interface MatchSpec {
  operator: string
  required_capability?: string
  required_capability_prefix?: string
  model_field?: string
  lab_capability_prefix?: string
}

export interface AppliesWhen {
  model_field?: string
  in?: unknown[]
  equals?: unknown
  not_null?: boolean
}

export interface LabSelectionCriterion {
  id: string
  weight: CriterionWeight
  parameter_type?: ParameterType
  label: string
  description: string
  applies_when?: AppliesWhen
  match: MatchSpec
}

export interface LabRankingContext {
  /** Model parameters (accuracyClass, technology, humidityClass, construction, emax, etc.) */
  modelParams: Record<string, unknown>
  /** Required forms for the test program */
  requiredForms: string[]
  scheme?: 'A' | 'B'
  applicantCountry?: string
}

/**
 * Structural input — what the service actually consumes from a lab.
 *
 * The full TestLaboratory record (in smart/browser) has many more fields
 * (accreditation, contact info, IA endorsement, etc.) that are irrelevant
 * to selection. Anything with `capabilities` works here.
 */
export interface Lab {
  capabilities?: string[]
  [key: string]: unknown
}

export interface LabScore<L extends Lab = Lab> {
  lab: L
  passed: LabSelectionCriterion[]
  failed: LabSelectionCriterion[]
  preferredRank: number
  recommendation: 'eligible' | 'ineligible' | 'recommended'
}

export function rankLabs<L extends Lab>(
  labs: L[],
  context: LabRankingContext,
  criteria: LabSelectionCriterion[],
): LabScore<L>[] {
  return labs
    .map(lab => scoreLab<L>(lab, context, criteria))
    .sort(compareLabScores)
}

function scoreLab<L extends Lab>(
  lab: L,
  context: LabRankingContext,
  criteria: LabSelectionCriterion[],
): LabScore<L> {
  const passed: LabSelectionCriterion[] = []
  const failed: LabSelectionCriterion[] = []

  for (const c of criteria) {
    if (!criterionApplies(c, context)) continue
    if (evaluateMatch(c.match, lab, context)) {
      passed.push(c)
    } else {
      failed.push(c)
    }
  }

  const failedRequired = failed.some(c => c.weight === 'required')
  const preferredRank = passed.filter(c => c.weight === 'preferred').length

  let recommendation: LabScore['recommendation']
  if (failedRequired) {
    recommendation = 'ineligible'
  } else if (preferredRank >= 2) {
    recommendation = 'recommended'
  } else {
    recommendation = 'eligible'
  }

  return { lab, passed, failed, preferredRank, recommendation }
}

function criterionApplies(c: LabSelectionCriterion, context: LabRankingContext): boolean {
  if (!c.applies_when) return true
  const aw = c.applies_when
  if (!aw.model_field) return true

  const value = context.modelParams[aw.model_field]

  if (aw.not_null && value == null) return false
  if (aw.equals !== undefined && value !== aw.equals) return false
  if (aw.in && !aw.in.includes(value)) return false

  return true
}

function evaluateMatch(
  match: MatchSpec,
  lab: Lab,
  context: LabRankingContext,
): boolean {
  const op = getMatchOperator(match.operator)
  if (!op) return true
  return op(match, lab, context)
}

function compareLabScores(a: LabScore, b: LabScore): number {
  const aIneligible = a.recommendation === 'ineligible' ? 1 : 0
  const bIneligible = b.recommendation === 'ineligible' ? 1 : 0
  if (aIneligible !== bIneligible) return aIneligible - bIneligible
  const aRecommended = a.recommendation === 'recommended' ? 0 : 1
  const bRecommended = b.recommendation === 'recommended' ? 0 : 1
  if (aRecommended !== bRecommended) return aRecommended - bRecommended
  return b.preferredRank - a.preferredRank
}

export function eligibleLabs<L extends Lab>(scores: LabScore<L>[]): L[] {
  return scores.filter(s => s.recommendation !== 'ineligible').map(s => s.lab)
}

export function topRecommendation<L extends Lab>(scores: LabScore<L>[]): L | null {
  const eligible = scores.filter(s => s.recommendation !== 'ineligible')
  return eligible.length > 0 ? eligible[0].lab : null
}

/**
 * Filter a mixed list of organizations down to test laboratories.
 * Kept for back-compat with the dispatch wizard, which receives
 * `Array<{ kind?: string }>` from the org store.
 */
export function filterTestLaboratories<L extends Lab & { kind?: string }>(
  orgs: L[],
): L[] {
  return orgs.filter(o => o.kind === 'test-laboratory')
}
