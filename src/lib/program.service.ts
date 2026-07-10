// ─────────────────────────────────────────────────────────────────────
// Program Service — derive required-form program for a model.
//
// Migrated from smart/browser/src/services/program.service.ts.
//
// The original had a stateful dependency on `getModels(standardId)` /
// `ensureModelsLoaded(...)`. Here we separate the concerns:
//
//   - `applies(rule, model)` is pure — given a rule and a model, does
//     the rule fire? No data dependency.
//   - `requiredFormsFor({ tests, forms, model })` is pure — given the
//     standard's tests + forms + a model, returns the applicable forms.
//     The caller is responsible for sourcing tests/forms (loaded YAML,
//     API, fixture).
//
// This makes the service trivially testable and runtime-agnostic.
// ─────────────────────────────────────────────────────────────────────

export interface ModelDimensions {
  accuracyClass?: 'A' | 'B' | 'C' | 'D'
  technology?: 'analogue-passive' | 'analogue-active' | 'digital'
  humidityClass?: 'CH' | 'SH' | 'NH'
}

export interface ApplicabilityRule {
  accuracy_class?: string[]
  technology?: string[]
  humidity_class?: string[]
}

export interface ConformanceTest {
  name: string
  identifier?: string
  applicability?: ApplicabilityRule
}

export interface FormDecl {
  name: string
  /** Identifier or list of identifiers this form satisfies. */
  conformance_test?: string | string[]
}

/**
 * Check whether a model matches an applicability rule. Returns true if
 * every constraint in the rule is satisfied by the model's dimensions.
 * Rules with no constraints apply to everything.
 *
 * Comparison is case-insensitive on accuracy_class and humidity_class.
 */
export function applies(rule: ApplicabilityRule | undefined, model: ModelDimensions): boolean {
  if (!rule) return true
  if (rule.accuracy_class?.length && model.accuracyClass) {
    const expected = rule.accuracy_class.map(c => c.toUpperCase())
    if (!expected.includes(model.accuracyClass.toUpperCase())) return false
  }
  if (rule.technology?.length && model.technology) {
    if (!rule.technology.includes(model.technology)) return false
  }
  if (rule.humidity_class?.length && model.humidityClass) {
    const expected = rule.humidity_class.map(c => c.toUpperCase())
    if (!expected.includes(model.humidityClass.toUpperCase())) return false
  }
  return true
}

/**
 * Derive the list of form names required for the given model.
 *
 * Caller sources the standard's tests + forms (typically from YAML via
 * Astro content collections, or from a preloaded cache). The function
 * itself is pure.
 *
 * Algorithm:
 *   1. Walk all tests; keep those whose applicability matches the model.
 *   2. Build a map from test identifier → form name.
 *   3. For each applicable test, look up its form.
 *   4. Deduplicate and sort.
 */
export function requiredFormsFor(params: {
  tests: readonly ConformanceTest[]
  forms: readonly FormDecl[]
  model: ModelDimensions
}): string[] {
  const { tests, forms, model } = params

  const testToForm = new Map<string, string>()
  for (const f of forms) {
    const refs = Array.isArray(f.conformance_test) ? f.conformance_test : [f.conformance_test]
    for (const ref of refs) {
      if (ref) testToForm.set(ref, f.name)
    }
  }

  const formNames = new Set<string>()
  for (const t of tests) {
    if (!applies(t.applicability, model)) continue
    if (!t.identifier) continue
    const formName = testToForm.get(t.identifier)
    if (formName) formNames.add(formName)
  }

  return [...formNames].sort()
}

/**
 * Convenience: build a form program (Record<modelId, formIds[]>) for
 * many models against the same standard's tests + forms.
 */
export function buildFormProgram(params: {
  tests: readonly ConformanceTest[]
  forms: readonly FormDecl[]
  models: ReadonlyArray<{ id: string } & ModelDimensions>
}): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const m of params.models) {
    out[m.id] = requiredFormsFor({
      tests: params.tests,
      forms: params.forms,
      model: m,
    })
  }
  return out
}
