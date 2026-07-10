// ─────────────────────────────────────────────────────────────────────
// Dispatch planner — pure functions for IA test-request dispatch.
//
// Extracted from the wizard Vue component so the multi-lab-per-model
// splitting logic is unit-testable without mounting the component.
//
// The core operation: given a per-model plan (default lab + selected
// forms + per-form overrides), produce per-lab assignment groups. Each
// group becomes one TestRequest at issue time. This is what enables
// the IA scenario:
//
//   "different test labs on doing what tests on what models"
//
// by allowing a single model's forms to be split across labs.
// ─────────────────────────────────────────────────────────────────────

export interface ModelPlan {
  modelId: string
  /** Default lab for this model; used by any form without an override. */
  selectedLabId: string | null
  /** Forms to test for this model. */
  selectedForms: Set<string>
  /** Per-form lab assignment. Wins over selectedLabId when present. */
  formLabOverrides: Map<string, string>
}

export interface FormLabAssignment {
  modelId: string
  formId: string
  labId: string
}

/**
 * The effective lab for a (model, form) tuple. Per-form override wins;
 * falls back to model default; null if neither is assigned.
 */
export function effectiveLab(plan: ModelPlan, formId: string): string | null {
  return plan.formLabOverrides.get(formId) ?? plan.selectedLabId
}

/**
 * Whether every selected form on this plan has a lab assigned.
 * Required before the plan can contribute to a TestRequest.
 */
export function isPlanComplete(plan: ModelPlan): boolean {
  if (plan.selectedForms.size === 0) return false
  for (const f of plan.selectedForms) {
    if (!effectiveLab(plan, f)) return false
  }
  return true
}

/**
 * Flatten per-model plans into per-lab assignment groups. Each group
 * becomes one TestRequest. Models with per-form overrides appear in
 * multiple groups — that's the multi-TR-per-model flow.
 *
 * Incomplete plans (some form missing a lab) are skipped — caller
 * should validate first via isPlanComplete.
 */
export function groupAssignmentsByLab(
  plans: Map<string, ModelPlan>,
): Map<string, FormLabAssignment[]> {
  const out = new Map<string, FormLabAssignment[]>()
  for (const [, plan] of plans) {
    if (!isPlanComplete(plan)) continue
    for (const formId of plan.selectedForms) {
      const labId = effectiveLab(plan, formId)
      // isPlanComplete guarantees labId is non-null here
      const resolved = labId as string
      if (!out.has(resolved)) out.set(resolved, [])
      out.get(resolved)!.push({ modelId: plan.modelId, formId, labId: resolved })
    }
  }
  return out
}

/**
 * Total count of (form × sample × model) tuples that will be created.
 * Equals the sum of selected forms across all complete plans.
 */
export function countTuples(plans: Map<string, ModelPlan>): number {
  let n = 0
  for (const plan of plans.values()) {
    if (!isPlanComplete(plan)) continue
    n += plan.selectedForms.size
  }
  return n
}
