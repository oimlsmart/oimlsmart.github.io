// ─────────────────────────────────────────────────────────────────────
// Sample Selection Service — R 60-2 §2.4 / Annex D algorithm.
//
// Migrated from smart/browser/src/services/sample-selection.service.ts.
//
// Given an InstrumentModelFamily with its groups and the models within
// each group, this service walks the algorithm step-by-step and produces
// a SampleSelectionResult listing:
//   - Models requiring full evaluation
//   - Models requiring partial evaluation (with which additional tests)
//   - The single model for humidity testing (if applicable)
//   - The single model for digital-additional testing (if applicable)
//
// Pure function — IA staff review the output before any InstrumentSample
// records are created.
// ─────────────────────────────────────────────────────────────────────

import {
  compareGroupMerit,
  type InstrumentModelGroup,
} from './instrument-model-group'

/** Structural — what the service actually reads from a model. */
export interface MeasuringInstrument {
  id: string
  /** Maximum capacity (kg). Used for selection by capacity. */
  emax?: number
  [key: string]: unknown
}

export interface ModelWithGroup {
  model: MeasuringInstrument
  group: InstrumentModelGroup
  emax: number          // kg
  v_min: number         // kg (derived from Y)
}

export type SelectionKind =
  | 'full_evaluation'
  | 'partial_evaluation'
  | 'humidity'
  | 'digital_additional'

export interface SelectedModel {
  model: MeasuringInstrument
  group: InstrumentModelGroup
  emax: number
  v_min: number
  kind: SelectionKind
  /** For partial_evaluation: which additional tests are required. */
  additionalTests?: string[]
  /** Why this model was selected (human-readable). */
  reason: string
}

export interface SampleSelectionResult {
  selected: SelectedModel[]
  fullEvaluationModels: SelectedModel[]
  partialEvaluationModels: SelectedModel[]
  humidityModel?: SelectedModel
  digitalAdditionalModel?: SelectedModel
  warnings: string[]
}

/**
 * Run the R 60-2 §2.4 / Annex D sample selection algorithm.
 *
 * Inputs:
 *  - groups: InstrumentModelGroup[]
 *  - modelsByGroup: Map<groupId, MeasuringInstrument[]>
 *  - familyTechnology: 'analogue-passive' | 'analogue-active' | 'digital'
 *  - humidityApplicable: whether any group has humidity class CH or SH
 */
export function selectSamples(params: {
  groups: InstrumentModelGroup[]
  modelsByGroup: Map<string, MeasuringInstrument[]>
  familyTechnology: 'analogue-passive' | 'analogue-active' | 'digital'
  humidityApplicable: boolean
}): SampleSelectionResult {
  const warnings: string[] = []
  const selected = new Map<string, SelectedModel>()  // by modelId

  const allModels = flattenModels(params.groups, params.modelsByGroup)
  if (allModels.length === 0) {
    warnings.push('No models provided — family has no testable load cells')
    return emptyResult(warnings)
  }

  // ── Step D.2.2: smallest capacity in each group ─────────────────
  const sortedGroups = [...params.groups].sort(compareGroupMerit)
  const selectedByGroup = new Map<string, ModelWithGroup>()

  for (const group of sortedGroups) {
    const groupModels = allModels.filter(m => m.group.id === group.id)
    if (groupModels.length === 0) continue
    const smallest = groupModels[0]   // already sorted by emax ASC
    selectedByGroup.set(group.id, smallest)
    recordSelection(selected, smallest, 'full_evaluation',
      `Smallest capacity in ${group.groupLabel} (${smallest.emax} kg) — R 60-2 §2.4.1`)
  }

  // ── Step D.2.3–D.2.5: merit walk within each group ─────────────
  for (const group of sortedGroups) {
    const groupModels = allModels.filter(m => m.group.id === group.id)
    const startingPoint = selectedByGroup.get(group.id)
    if (!startingPoint) continue

    let previous = startingPoint
    for (const candidate of groupModels) {
      if (candidate.model.id === previous.model.id) continue
      if (candidate.emax <= previous.emax) continue

      const lowerBound = previous.emax * 5
      const upperBound = previous.emax * 10

      if (candidate.emax >= lowerBound && candidate.emax <= upperBound) {
        recordSelection(selected, candidate, 'full_evaluation',
          `Next capacity in ${group.groupLabel} (${candidate.emax} kg = ${ratio(previous.emax, candidate.emax)}× previous) — R 60-2 §2.4.2`)
        previous = candidate
      } else if (candidate.emax > upperBound) {
        recordSelection(selected, candidate, 'full_evaluation',
          `Next capacity in ${group.groupLabel} (${candidate.emax} kg, smallest exceeding 10× previous) — R 60-2 §2.4.2`)
        previous = candidate
      }
    }
  }

  // ── Step D.2.6: deduplicate same-capacity across groups ────────
  const byCapacity = new Map<number, SelectedModel[]>()
  for (const sel of selected.values()) {
    const key = Math.round(sel.emax)
    const arr = byCapacity.get(key) ?? []
    arr.push(sel)
    byCapacity.set(key, arr)
  }
  const droppedDueToDuplication: SelectedModel[] = []
  for (const [capacity, sels] of byCapacity) {
    if (sels.length <= 1) continue
    const sorted = sels.sort((a, b) => compareGroupMerit(a.group, b.group))
    const keeper = sorted[0]
    for (const s of sorted.slice(1)) {
      selected.delete(s.model.id)
      droppedDueToDuplication.push(s)
      warnings.push(`Capacity ${capacity} kg: kept ${keeper.group.groupLabel}, dropped ${s.group.groupLabel} (R 60-2 §2.4.6 — same capacity, lower merit)`)
    }
  }

  // ── Step D.2.6 (cont): partial-evaluation flags ────────────────
  for (const dropped of droppedDueToDuplication) {
    const keeper = byCapacity.get(Math.round(dropped.emax))?.[0]
    if (!keeper) continue

    const additionalTests: string[] = []
    if (dropped.v_min < keeper.v_min || dropped.group.Y > keeper.group.Y) {
      additionalTests.push('temperature_mdlo', 'barometric_pressure')
    }
    if (dropped.group.Y > keeper.group.Y) {
      additionalTests.push('creep_dr')
    }
    if (additionalTests.length > 0) {
      recordSelection(selected, {
        model: dropped.model, group: dropped.group,
        emax: dropped.emax, v_min: dropped.v_min,
      }, 'partial_evaluation',
        `Same capacity (${dropped.emax} kg) as ${keeper.group.groupLabel} but has worse vmin or Y — partial evaluation`,
        additionalTests)
    }
  }

  // ── Step D.2.7: humidity sample ────────────────────────────────
  let humidityModel: SelectedModel | undefined
  if (params.humidityApplicable) {
    const candidates = [...selected.values()].sort((a, b) => {
      if (b.group.n_LC !== a.group.n_LC) return b.group.n_LC - a.group.n_LC
      return a.v_min - b.v_min
    })
    if (candidates.length > 0) {
      humidityModel = {
        ...candidates[0], kind: 'humidity',
        reason: `Selected for humidity test — most severe (highest n_LC=${candidates[0].group.n_LC}, lowest vmin=${candidates[0].v_min}) — R 60-2 §2.4.5`,
      }
      selected.set(humidityModel.model.id + ':humidity', humidityModel)
    }
  }

  // ── Step D.2.8: digital additional tests ───────────────────────
  let digitalModel: SelectedModel | undefined
  if (params.familyTechnology === 'digital') {
    const candidates = [...selected.values()].sort((a, b) => {
      if (b.group.n_LC !== a.group.n_LC) return b.group.n_LC - a.group.n_LC
      return a.v_min - b.v_min
    })
    if (candidates.length > 0) {
      digitalModel = {
        ...candidates[0], kind: 'digital_additional',
        reason: `Selected for additional digital tests — most severe characteristics`,
      }
      selected.set(digitalModel.model.id + ':digital', digitalModel)
    }
  }

  const all = [...selected.values()]
  if (all.length === 0) {
    warnings.push('No models selected — family may have no testable load cells')
  } else if (all.length > 6) {
    warnings.push(`${all.length} models selected — IA review recommended to consolidate below 6`)
  }

  return {
    selected: all,
    fullEvaluationModels: all.filter(s => s.kind === 'full_evaluation'),
    partialEvaluationModels: all.filter(s => s.kind === 'partial_evaluation'),
    humidityModel,
    digitalAdditionalModel: digitalModel,
    warnings,
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function flattenModels(
  groups: InstrumentModelGroup[],
  modelsByGroup: Map<string, MeasuringInstrument[]>,
): ModelWithGroup[] {
  const out: ModelWithGroup[] = []
  for (const group of groups) {
    const models = modelsByGroup.get(group.id) ?? []
    for (const model of models) {
      const emax = extractEmax(model)
      const v_min = computeVmin(model, group)
      if (emax <= 0) continue
      out.push({ model, group, emax, v_min })
    }
  }
  return out.sort((a, b) => a.emax - b.emax)
}

function extractEmax(model: MeasuringInstrument): number {
  const raw = model.emax
  return typeof raw === 'number' ? raw : 0
}

function computeVmin(model: MeasuringInstrument, group: InstrumentModelGroup): number {
  const emax = extractEmax(model)
  if (emax <= 0 || group.Y <= 0) return Number.POSITIVE_INFINITY
  return emax / group.Y
}

function recordSelection(
  map: Map<string, SelectedModel>,
  entry: ModelWithGroup,
  kind: SelectionKind,
  reason: string,
  additionalTests?: string[],
): void {
  const key = kind === 'full_evaluation' ? entry.model.id : `${entry.model.id}:${kind}`
  if (map.has(key) && kind === 'full_evaluation') return   // already selected
  map.set(key, {
    model: entry.model,
    group: entry.group,
    emax: entry.emax,
    v_min: entry.v_min,
    kind,
    additionalTests,
    reason,
  })
}

function ratio(previous: number, current: number): string {
  const r = current / previous
  return r.toFixed(1)
}

function emptyResult(warnings: string[]): SampleSelectionResult {
  return {
    selected: [],
    fullEvaluationModels: [],
    partialEvaluationModels: [],
    warnings,
  }
}
