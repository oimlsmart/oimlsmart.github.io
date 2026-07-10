import type { LabSelectionCriterion, CriterionWeight, ParameterType } from './lab-selection.service'

const VALID_WEIGHTS: readonly CriterionWeight[] = ['required', 'preferred']
const VALID_PARAMETER_TYPES: readonly ParameterType[] = ['dimension', 'parameter', 'operational']

interface RawCriterion {
  id?: unknown
  weight?: unknown
  parameter_type?: unknown
  label?: unknown
  description?: unknown
  applies_when?: unknown
  match?: unknown
}

interface RawStandardsFile {
  standards?: Array<{ id?: unknown; lab_selection_criteria?: unknown[] }>
}

export class CriteriaLoadError extends Error {
  constructor(standardId: string, criterionIndex: number, reason: string) {
    super(`Invalid criterion #${criterionIndex} for standard "${standardId}": ${reason}`)
    this.name = 'CriteriaLoadError'
  }
}

export function loadLabSelectionCriteria(
  yamlText: string,
  standardId: string,
): LabSelectionCriterion[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(yamlText)
  } catch {
    parsed = parseSimpleYaml(yamlText)
  }

  const file = parsed as RawStandardsFile
  if (!file || !file.standards || !Array.isArray(file.standards)) {
    return []
  }

  const std = file.standards.find(s => s.id === standardId)
  if (!std || !std.lab_selection_criteria || !Array.isArray(std.lab_selection_criteria)) {
    return []
  }

  return (std.lab_selection_criteria as RawCriterion[]).map((raw, i) =>
    validateCriterion(raw, standardId, i),
  )
}

function validateCriterion(
  raw: RawCriterion,
  standardId: string,
  index: number,
): LabSelectionCriterion {
  if (typeof raw.id !== 'string' || raw.id.length === 0) {
    throw new CriteriaLoadError(standardId, index, 'missing or invalid "id"')
  }
  if (typeof raw.weight !== 'string' || !VALID_WEIGHTS.includes(raw.weight as CriterionWeight)) {
    throw new CriteriaLoadError(standardId, index, `invalid "weight" (expected one of: ${VALID_WEIGHTS.join(', ')})`)
  }
  if (typeof raw.label !== 'string' || raw.label.length === 0) {
    throw new CriteriaLoadError(standardId, index, 'missing or invalid "label"')
  }
  if (typeof raw.description !== 'string' || raw.description.length === 0) {
    throw new CriteriaLoadError(standardId, index, 'missing or invalid "description"')
  }
  if (!raw.match || typeof raw.match !== 'object' || typeof (raw.match as { operator?: unknown }).operator !== 'string') {
    throw new CriteriaLoadError(standardId, index, 'missing or invalid "match.operator"')
  }

  const criterion: LabSelectionCriterion = {
    id: raw.id,
    weight: raw.weight as CriterionWeight,
    label: raw.label,
    description: raw.description,
    match: raw.match as LabSelectionCriterion['match'],
  }

  if (typeof raw.parameter_type === 'string') {
    if (!VALID_PARAMETER_TYPES.includes(raw.parameter_type as ParameterType)) {
      throw new CriteriaLoadError(standardId, index, `invalid "parameter_type" (expected one of: ${VALID_PARAMETER_TYPES.join(', ')})`)
    }
    criterion.parameter_type = raw.parameter_type as ParameterType
  }

  if (raw.applies_when && typeof raw.applies_when === 'object') {
    criterion.applies_when = raw.applies_when as LabSelectionCriterion['applies_when']
  }

  return criterion
}

function parseSimpleYaml(text: string): unknown {
  return { standards: [] }
}
