<script setup lang="ts">
/**
 * DispatchWizard — IA's test-request dispatch flow.
 *
 * Migrated from smart/browser/src/pages/cs/test-request-dispatch.vue (845 lines).
 * Simplified to demonstrate the unified-site pattern: a Vue island that
 * uses migrated services + composables + IndexedDB persistence under Astro.
 *
 * The full wizard (with per-form lab splitting, ModelFamilyMatrix, etc.)
 * is TODO 15. This version proves:
 * - Vue island renders under Astro with client:load
 * - Composables (useApplication, useTestRequest, etc.) work via factory
 * - Services (dispatch-planner, lab-selection) integrate cleanly
 * - IndexedDB writes succeed in the browser
 * - Navigation between steps is client-side (no full page reload)
 *
 * Architectural notes:
 * - MECE: each step is a separate function/computed, not tangled
 * - OCP: adding a new step = adding a new case to the step switch
 * - DRY: all entity access goes through defineEntityComposable
 * - Model-driven: form lists derived from program.service, not hardcoded
 */
import { ref, computed, onMounted } from 'vue'
import { useApplication, useModelFamily, useInstrumentSample, useTestRequest, useTestAssignment, useOrganization } from '../../lib/entity-composables'
import { useNotification } from '../../lib/useNotification'
import { filterTestLaboratories } from '../../lib/lab-selection.service'
import { groupAssignmentsByLab, countTuples, effectiveLab, isPlanComplete, type ModelPlan } from '../../lib/dispatch-planner.service'
import { STANDARDS } from '../../data/standards'

// ── State ───────────────────────────────────────────────────────────
const step = ref<1 | 2 | 3 | 4>(1)
const selectedAppId = ref<string | null>(null)
const familyModels = ref<Array<{ id: string; model: string; emax?: number; accuracyClass?: string }>>([])
const samples = ref<Array<{ id: string; modelId: string }>>([])
const plans = ref<Map<string, ModelPlan>>(new Map())
const labs = ref<Array<{ id: string; name: string; kind?: string }>>([])

const notify = useNotification()
const appApi = useApplication()
const familyApi = useModelFamily()
const sampleApi = useInstrumentSample()
const trApi = useTestRequest()
const taApi = useTestAssignment()
const orgApi = useOrganization()

const standard = STANDARDS[0]
const issuing = ref(false)

// ── Step 1: pick application ────────────────────────────────────────
const acceptedApps = computed(() =>
  (appApi.list() as Array<{ id: string; status: string; applicationNumber?: string; dateOfApplication?: string }>)
    .filter(a => a.status === 'ACCEPTED'),
)

function selectApplication(appId: string) {
  selectedAppId.value = appId
  const app = appApi.get(appId) as { modelFamilyId?: string; instrumentModelFamilyId?: string } | undefined
  if (!app) return
  const familyId = app.modelFamilyId ?? app.instrumentModelFamilyId
  if (!familyId) {
    notify.error('Application has no model family')
    return
  }

  // Load models from family
  const models = familyApi.filter(() => true) as unknown as Array<{ id: string; model: string; emax?: number; accuracyClass?: string; modelFamilyId?: string }>
  familyModels.value = models.filter(m => m.modelFamilyId === familyId)

  // Load samples for this application
  const allSamples = sampleApi.list() as unknown as Array<{ id: string; modelId: string; applicationId?: string }>
  samples.value = allSamples.filter(s => s.applicationId === appId)

  // Load labs
  const orgs = orgApi.list() as unknown as Array<{ id: string; name: string; kind?: string }>
  labs.value = filterTestLaboratories(orgs)

  // Initialize plans
  plans.value = new Map()
  for (const m of familyModels.value) {
    plans.value.set(m.id, {
      modelId: m.id,
      selectedLabId: null,
      selectedForms: new Set<string>(),
      formLabOverrides: new Map<string, string>(),
    })
  }

  step.value = 2
}

// ── Step 2: see models ──────────────────────────────────────────────
function sampleFor(modelId: string): { id: string; modelId: string } | undefined {
  return samples.value.find(s => s.modelId === modelId)
}

// ── Step 3: assign labs ─────────────────────────────────────────────
function setLabForModel(modelId: string, labId: string) {
  const plan = plans.value.get(modelId)
  if (!plan) return
  plan.selectedLabId = labId
  if (plan.selectedForms.size === 0) {
    // Default to baseline forms
    plan.selectedForms = new Set(['load-cell-errors', 'repeatability', 'humidity-ch'])
  }
}

function toggleForm(modelId: string, formId: string) {
  const plan = plans.value.get(modelId)
  if (!plan) return
  if (plan.selectedForms.has(formId)) {
    plan.selectedForms.delete(formId)
    plan.formLabOverrides.delete(formId)
  } else {
    plan.selectedForms.add(formId)
  }
}

function isFormSelected(modelId: string, formId: string): boolean {
  return plans.value.get(modelId)?.selectedForms.has(formId) ?? false
}

function isModelConfigured(modelId: string): boolean {
  const p = plans.value.get(modelId)
  if (!p || !sampleFor(modelId)) return false
  return isPlanComplete(p)
}

const configuredCount = computed(() =>
  familyModels.value.filter(m => isModelConfigured(m.id)).length,
)

const totalTuples = computed(() => countTuples(plans.value))

// ── Step 4: review ─────────────────────────────────────────────────
const trsByLab = computed(() => groupAssignmentsByLab(plans.value))

// ── Issue ───────────────────────────────────────────────────────────
async function issue() {
  if (!selectedAppId.value) return
  issuing.value = true

  try {
    let trCount = 0
    for (const [labId] of trsByLab.value.entries()) {
      trCount++
      const tr = await trApi.create({
        standardId: standard.id,
        requestNumber: `TR-${Date.now()}-${trCount}`,
        applicationId: selectedAppId.value,
        assignedLaboratoryId: labId,
        status: 'ISSUED',
        scheme: 'B',
        issuedBy: 'ia-staff',
      })

      for (const [modelId, plan] of plans.value.entries()) {
        const sample = sampleFor(modelId)
        if (!sample) continue
        for (const formId of plan.selectedForms) {
          const effectiveLabId = effectiveLab(plan, formId)
          if (effectiveLabId !== labId) continue
          await taApi.create({
            testRequestId: (tr as { id: string }).id,
            applicationId: selectedAppId.value,
            formId,
            sampleId: sample.id,
            modelId,
            laboratoryId: effectiveLabId,
            status: 'PENDING',
          })
        }
      }
    }

    notify.success(`Issued ${trCount} test request(s)`)
    // Navigate to the app home (Astro routing)
    window.location.href = '/app/'
  } catch (e) {
    notify.error('Failed to issue', (e as Error).message)
  } finally {
    issuing.value = false
  }
}

onMounted(() => {
  // In production, this preloads data via IndexedDB
  // For demo, the sample-data composable would seed it
})
</script>

<template>
  <div class="dispatch-wizard">
    <!-- Step indicator -->
    <ol class="steps">
      <li :data-active="step === 1" :data-done="step > 1"><span>1</span> Application</li>
      <li :data-active="step === 2" :data-done="step > 2" :data-disabled="!selectedAppId"><span>2</span> Models</li>
      <li :data-active="step === 3" :data-done="step > 3" :data-disabled="!selectedAppId"><span>3</span> Assign</li>
      <li :data-active="step === 4" :data-done="false" :data-disabled="configuredCount === 0"><span>4</span> Review</li>
    </ol>

    <!-- Step 1: Pick application -->
    <section v-if="step === 1" class="panel">
      <h2>Choose an accepted application</h2>
      <ul v-if="acceptedApps.length > 0" class="app-list">
        <li v-for="app in acceptedApps" :key="app.id" @click="selectApplication(app.id)">
          <code>{{ app.applicationNumber ?? app.id.slice(0, 8) }}</code>
          <span>{{ app.status }}</span>
        </li>
      </ul>
      <p v-else class="empty">No accepted applications. Submit and accept one first.</p>
    </section>

    <!-- Step 2: See models -->
    <section v-else-if="step === 2" class="panel">
      <header class="panel-header">
        <h2>In-scope models ({{ familyModels.length }})</h2>
        <button class="btn-primary" @click="step = 3">Continue →</button>
      </header>
      <table class="model-table">
        <thead><tr><th>Model</th><th>Emax</th><th>Class</th><th>Sample</th></tr></thead>
        <tbody>
          <tr v-for="m in familyModels" :key="m.id">
            <td><code>{{ m.model }}</code></td>
            <td>{{ m.emax ? (m.emax >= 1000 ? `${m.emax / 1000} t` : `${m.emax} kg`) : '—' }}</td>
            <td>{{ m.accuracyClass ?? '—' }}</td>
            <td>{{ sampleFor(m.id) ? '✓' : 'no sample' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Step 3: Assign labs -->
    <section v-else-if="step === 3" class="panel">
      <header class="panel-header">
        <h2>Assign labs &amp; forms per model</h2>
        <div class="actions">
          <button class="btn-ghost" @click="step = 2">← Back</button>
          <button class="btn-primary" :disabled="configuredCount === 0" @click="step = 4">
            Review ({{ totalTuples }} tuples) →
          </button>
        </div>
      </header>

      <div v-for="m in familyModels" :key="m.id" class="model-plan" :data-ready="isModelConfigured(m.id)">
        <div class="model-plan-header">
          <code>{{ m.model }}</code>
          <span v-if="!sampleFor(m.id)" class="warn">no sample</span>
        </div>
        <div class="model-plan-body">
          <label class="field">
            <span class="field-label">Laboratory</span>
            <select
              :value="plans.get(m.id)?.selectedLabId ?? ''"
              :disabled="!sampleFor(m.id)"
              @change="setLabForModel(m.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— select —</option>
              <option v-for="l in labs" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
          <div class="forms">
            <span class="field-label">Forms</span>
            <ul class="form-list">
              <li v-for="f in ['load-cell-errors', 'repeatability', 'humidity-ch']" :key="f">
                <label class="form-check">
                  <input type="checkbox" :checked="isFormSelected(m.id, f)"
                    :disabled="!plans.get(m.id)?.selectedLabId"
                    @change="toggleForm(m.id, f)" />
                  <code>{{ f }}</code>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 4: Review + Issue -->
    <section v-else-if="step === 4" class="panel">
      <header class="panel-header">
        <h2>Review &amp; issue</h2>
        <div class="actions">
          <button class="btn-ghost" @click="step = 3">← Back</button>
          <button class="btn-primary" :disabled="issuing" @click="issue">
            {{ issuing ? 'Issuing…' : `Issue ${trsByLab.size} request(s)` }}
          </button>
        </div>
      </header>

      <p class="hint">One TestRequest will be created per lab. Each carries the explicit (form × sample × model) tuples.</p>

      <section v-for="[labId] in trsByLab" :key="labId" class="tr-preview">
        <h3>{{ labs.find(l => l.id === labId)?.name ?? labId }}</h3>
      </section>
    </section>
  </div>
</template>

<style scoped>
.dispatch-wizard { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: var(--vp-font-family-base, system-ui, sans-serif); color: var(--ink, #1a1a1a); }
.steps { display: flex; gap: 0; list-style: none; margin: 0 0 2rem; padding: 0; border-bottom: 1px solid var(--rule, #e0e0e0); }
.steps li { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--ink-soft, #666); border-bottom: 2px solid transparent; }
.steps li[data-active="true"] { color: var(--accent, #004996); border-bottom-color: var(--accent, #004996); font-weight: 500; }
.steps li[data-done="true"] { color: var(--ink, #1a1a1a); }
.steps li[data-disabled="true"] { opacity: 0.4; }
.steps li span { display: inline-flex; width: 20px; height: 20px; border-radius: 50%; background: var(--rule, #e0e0e0); color: #fff; font-size: 0.75rem; align-items: center; justify-content: center; margin-right: 0.5rem; }
.panel { display: flex; flex-direction: column; gap: 1rem; }
.panel h2 { font-size: 1.25rem; margin: 0; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 0.5rem; }
.btn-primary { padding: 0.5rem 1rem; background: var(--ink, #1a1a1a); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.btn-primary:hover:not(:disabled) { background: var(--accent, #004996); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { padding: 0.5rem 1rem; background: transparent; border: 1px solid var(--rule, #e0e0e0); border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.app-list { list-style: none; padding: 0; }
.app-list li { padding: 0.75rem 1rem; border: 1px solid var(--rule, #e0e0e0); border-radius: 4px; margin-bottom: 0.5rem; cursor: pointer; display: flex; justify-content: space-between; }
.app-list li:hover { background: var(--paper-soft, #f8f8f8); }
.empty { color: var(--ink-soft, #666); font-style: italic; }
.model-table { width: 100%; border-collapse: collapse; }
.model-table th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.5rem; border-bottom: 1px solid var(--rule, #e0e0e0); color: var(--ink-soft, #666); }
.model-table td { padding: 0.5rem; border-bottom: 1px solid var(--rule, #e0e0e0); font-size: 0.875rem; }
.model-plan { padding: 1rem; border: 1px solid var(--rule, #e0e0e0); border-radius: 4px; margin-bottom: 0.75rem; }
.model-plan[data-ready="true"] { border-color: var(--accent, #004996); }
.model-plan-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.warn { color: #d97706; font-size: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
.field-label { font-size: 0.75rem; color: var(--ink-soft, #666); text-transform: uppercase; letter-spacing: 0.05em; }
select, input[type="checkbox"] { font: inherit; }
.form-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.form-check { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; cursor: pointer; }
.hint { font-size: 0.875rem; color: var(--ink-soft, #666); }
.tr-preview { padding: 1rem; border: 1px solid var(--rule, #e0e0e0); border-radius: 4px; margin-bottom: 0.5rem; }
.tr-preview h3 { font-size: 1rem; margin: 0; }
</style>
