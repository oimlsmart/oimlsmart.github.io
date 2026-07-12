import type {
  Application,
  MeasuringInstrument,
  InstrumentSample,
  Organization,
  TestRequest,
  TestAssignment,
} from './entity-types'
import type { EntityApi } from './entity-composable'
import type { ModelPlan } from './dispatch-planner.service'
import { groupAssignmentsByLab, countTuples, effectiveLab, isPlanComplete } from './dispatch-planner.service'
import { filterTestLaboratories } from './lab-selection.service'
import { DEFAULT_DISPATCH_FORMS } from '../data/forms'

export interface DispatchWorkflowDeps {
  appApi: EntityApi<Application>
  familyApi: EntityApi<MeasuringInstrument>
  sampleApi: EntityApi<InstrumentSample>
  trApi: EntityApi<TestRequest>
  taApi: EntityApi<TestAssignment>
  orgApi: EntityApi<Organization>
}

export interface DispatchState {
  step: 1 | 2 | 3 | 4
  selectedAppId: string | null
  models: MeasuringInstrument[]
  samples: InstrumentSample[]
  labs: Organization[]
  plans: Map<string, ModelPlan>
}

export function createDispatchWorkflow(deps: DispatchWorkflowDeps) {
  const state: DispatchState = {
    step: 1,
    selectedAppId: null,
    models: [],
    samples: [],
    labs: [],
    plans: new Map(),
  }

  function getAcceptedApplications(): Application[] {
    return deps.appApi.list().filter(a => a.status === 'ACCEPTED')
  }

  function selectApplication(appId: string): { ok: true } | { ok: false; error: string } {
    state.selectedAppId = appId
    const app = deps.appApi.get(appId)
    if (!app) return { ok: false, error: 'Application not found' }

    const familyId = app.modelFamilyId ?? app.instrumentModelFamilyId
    if (!familyId) return { ok: false, error: 'Application has no model family' }

    state.models = deps.familyApi.filter(m => m.modelFamilyId === familyId)
    state.samples = deps.sampleApi.list().filter(s => s.applicationId === appId)
    state.labs = filterTestLaboratories(deps.orgApi.list())

    state.plans = new Map()
    for (const m of state.models) {
      state.plans.set(m.id, {
        modelId: m.id,
        selectedLabId: null,
        selectedForms: new Set<string>(),
        formLabOverrides: new Map<string, string>(),
      })
    }

    state.step = 2
    return { ok: true }
  }

  function sampleFor(modelId: string): InstrumentSample | undefined {
    return state.samples.find(s => s.modelId === modelId)
  }

  function setLabForModel(modelId: string, labId: string): void {
    const plan = state.plans.get(modelId)
    if (!plan) return
    plan.selectedLabId = labId
    if (plan.selectedForms.size === 0) {
      plan.selectedForms = new Set(DEFAULT_DISPATCH_FORMS)
    }
  }

  function toggleForm(modelId: string, formId: string): void {
    const plan = state.plans.get(modelId)
    if (!plan) return
    if (plan.selectedForms.has(formId)) {
      plan.selectedForms.delete(formId)
      plan.formLabOverrides.delete(formId)
    } else {
      plan.selectedForms.add(formId)
    }
  }

  function isModelConfigured(modelId: string): boolean {
    const p = state.plans.get(modelId)
    if (!p || !sampleFor(modelId)) return false
    return isPlanComplete(p)
  }

  function getTrsByLab(): Map<string, unknown> {
    return groupAssignmentsByLab(state.plans)
  }

  function getTupleCount(): number {
    return countTuples(state.plans)
  }

  async function issue(
    standardId: string,
    issuedBy: string,
    notify: (type: string, msg: string) => void,
  ): Promise<number> {
    if (!state.selectedAppId) return 0

    const trsByLab = getTrsByLab()
    let trCount = 0

    for (const [labId] of trsByLab.entries()) {
      trCount++
      const tr = await deps.trApi.create({
        standardId,
        requestNumber: `TR-${Date.now()}-${trCount}`,
        applicationId: state.selectedAppId,
        assignedLaboratoryId: labId,
        status: 'ISSUED',
        scheme: 'B',
        issuedBy,
      })

      for (const [modelId, plan] of state.plans.entries()) {
        const sample = sampleFor(modelId)
        if (!sample) continue
        for (const formId of plan.selectedForms) {
          const effectiveLabId = effectiveLab(plan, formId)
          if (effectiveLabId !== labId) continue
          await deps.taApi.create({
            testRequestId: tr.id,
            applicationId: state.selectedAppId,
            formId,
            sampleId: sample.id,
            modelId,
            laboratoryId: effectiveLabId,
            status: 'PENDING',
          })
        }
      }
    }

    notify('success', `Issued ${trCount} test request(s)`)
    return trCount
  }

  return {
    state,
    getAcceptedApplications,
    selectApplication,
    sampleFor,
    setLabForModel,
    toggleForm,
    isModelConfigured,
    getTrsByLab,
    getTupleCount,
    issue,
  }
}
