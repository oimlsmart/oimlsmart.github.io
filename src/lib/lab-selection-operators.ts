import type { Lab, LabRankingContext, MatchSpec } from './lab-selection.service'

export type MatchEvaluator = (
  match: MatchSpec,
  lab: Lab,
  context: LabRankingContext,
) => boolean

const operators = new Map<string, MatchEvaluator>()

export function registerMatchOperator(name: string, fn: MatchEvaluator): void {
  operators.set(name, fn)
}

export function getMatchOperator(name: string): MatchEvaluator | undefined {
  return operators.get(name)
}

export function listMatchOperators(): string[] {
  return Array.from(operators.keys())
}

function getLabCapabilities(lab: Lab): Set<string> {
  return new Set(lab.capabilities ?? [])
}

function parseTier(s: string): number | null {
  const m = /^([\d.]+)(kg|t|g)?$/.exec(s.trim())
  if (!m) return null
  const value = parseFloat(m[1])
  const unit = m[2]
  if (unit === 't') return value * 1000
  if (unit === 'g') return value / 1000
  return value
}

registerMatchOperator('always_pass', () => true)

registerMatchOperator('has_capability', (match, lab) => {
  if (!match.required_capability) return true
  return getLabCapabilities(lab).has(match.required_capability)
})

registerMatchOperator('capability_from_field', (match, lab, context) => {
  if (!match.required_capability_prefix || !match.model_field) return true
  const fieldValue = String(context.modelParams[match.model_field] ?? '')
  if (!fieldValue) return true
  return getLabCapabilities(lab).has(match.required_capability_prefix + fieldValue)
})

registerMatchOperator('capability_covers_value', (match, lab, context) => {
  if (!match.required_capability_prefix || !match.model_field) return true
  const modelValue = Number(context.modelParams[match.model_field])
  if (!modelValue || modelValue <= 0) return true
  const capabilities = getLabCapabilities(lab)
  return [...capabilities].some(cap => {
    if (!cap.startsWith(match.required_capability_prefix!)) return false
    const tierStr = cap.slice(match.required_capability_prefix!.length)
    const tier = parseTier(tierStr)
    return tier != null && tier >= modelValue
  })
})

registerMatchOperator('capability_prefix_match', (match, lab) => {
  if (!match.lab_capability_prefix) return true
  return [...getLabCapabilities(lab)].some(c => c.startsWith(match.lab_capability_prefix))
})
