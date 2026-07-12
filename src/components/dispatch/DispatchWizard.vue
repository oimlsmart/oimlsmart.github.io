<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useApplication, useMeasuringInstrument, useInstrumentSample,
  useTestRequest, useTestAssignment, useOrganization,
} from '../../lib/entity-composables'
import { useNotificationStore } from '../../stores/notifications'
import { createDispatchWorkflow } from '../../lib/dispatch-workflow'
import { STANDARDS } from '../../data/standards'
import { DEFAULT_DISPATCH_FORMS } from '../../data/forms'

const notify = useNotificationStore()
const wf = createDispatchWorkflow({
  appApi: useApplication(),
  familyApi: useMeasuringInstrument(),
  sampleApi: useInstrumentSample(),
  trApi: useTestRequest(),
  taApi: useTestAssignment(),
  orgApi: useOrganization(),
})

const standard = STANDARDS[0]
const issuing = ref(false)
const step = computed(() => wf.state.step)

const acceptedApps = computed(() => wf.getAcceptedApplications())

function selectApp(appId: string) {
  const result = wf.selectApplication(appId)
  if (!result.ok) notify.error(result.error)
}

const configuredCount = computed(() =>
  wf.state.models.filter(m => wf.isModelConfigured(m.id)).length,
)
const totalTuples = computed(() => wf.getTupleCount())
const trsByLab = computed(() => wf.getTrsByLab())
const DEFAULT_FORMS = DEFAULT_DISPATCH_FORMS

function isFormSelected(modelId: string, formId: string): boolean {
  return wf.state.plans.get(modelId)?.selectedForms.has(formId) ?? false
}

async function issue() {
  issuing.value = true
  try {
    await wf.issue(standard.id, 'ia-staff', (type, msg) => {
      if (type === 'success') notify.success(msg)
      else notify.error(msg)
    })
    window.location.href = '/app/'
  } catch (e) {
    notify.error('Failed to issue', (e as Error).message)
  } finally {
    issuing.value = false
  }
}

onMounted(() => {})
</script>

<template>
  <div class="dispatch-wizard">
    <ol class="steps">
      <li :data-active="step === 1" :data-done="step > 1"><span>1</span> Application</li>
      <li :data-active="step === 2" :data-done="step > 2" :data-disabled="!wf.state.selectedAppId"><span>2</span> Models</li>
      <li :data-active="step === 3" :data-done="step > 3" :data-disabled="!wf.state.selectedAppId"><span>3</span> Assign</li>
      <li :data-active="step === 4" :data-done="false" :data-disabled="configuredCount === 0"><span>4</span> Review</li>
    </ol>

    <section v-if="step === 1" class="panel">
      <h2>Choose an accepted application</h2>
      <ul v-if="acceptedApps.length > 0" class="app-list">
        <li v-for="app in acceptedApps" :key="app.id" @click="selectApp(app.id)">
          <code>{{ app.applicationNumber ?? app.id.slice(0, 8) }}</code>
          <span>{{ app.status }}</span>
        </li>
      </ul>
      <p v-else class="empty">No accepted applications. Submit and accept one first.</p>
    </section>

    <section v-else-if="step === 2" class="panel">
      <header class="panel-header">
        <h2>In-scope models ({{ wf.state.models.length }})</h2>
        <button class="btn-primary" @click="wf.state.step = 3">Continue →</button>
      </header>
      <table class="model-table">
        <thead><tr><th>Model</th><th>Emax</th><th>Class</th><th>Sample</th></tr></thead>
        <tbody>
          <tr v-for="m in wf.state.models" :key="m.id">
            <td><code>{{ m.model }}</code></td>
            <td>{{ m.emax ? (m.emax >= 1000 ? `${m.emax / 1000} t` : `${m.emax} kg`) : '—' }}</td>
            <td>{{ m.accuracyClass ?? '—' }}</td>
            <td>{{ wf.sampleFor(m.id) ? '✓' : 'no sample' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else-if="step === 3" class="panel">
      <header class="panel-header">
        <h2>Assign labs &amp; forms per model</h2>
        <div class="actions">
          <button class="btn-ghost" @click="wf.state.step = 2">← Back</button>
          <button class="btn-primary" :disabled="configuredCount === 0" @click="wf.state.step = 4">
            Review ({{ totalTuples }} tuples) →
          </button>
        </div>
      </header>

      <div v-for="m in wf.state.models" :key="m.id" class="model-plan" :data-ready="wf.isModelConfigured(m.id)">
        <div class="model-plan-header">
          <code>{{ m.model }}</code>
          <span v-if="!wf.sampleFor(m.id)" class="warn">no sample</span>
        </div>
        <div class="model-plan-body">
          <label class="field">
            <span class="field-label">Laboratory</span>
            <select
              :value="wf.state.plans.get(m.id)?.selectedLabId ?? ''"
              :disabled="!wf.sampleFor(m.id)"
              @change="wf.setLabForModel(m.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— select —</option>
              <option v-for="l in wf.state.labs" :key="l.id" :value="l.id">{{ l.name }}</option>
            </select>
          </label>
          <div class="forms">
            <span class="field-label">Forms</span>
            <ul class="form-list">
              <li v-for="f in DEFAULT_FORMS" :key="f">
                <label class="form-check">
                  <input type="checkbox" :checked="isFormSelected(m.id, f)"
                    :disabled="!wf.state.plans.get(m.id)?.selectedLabId"
                    @change="wf.toggleForm(m.id, f)" />
                  <code>{{ f }}</code>
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section v-else-if="step === 4" class="panel">
      <header class="panel-header">
        <h2>Review &amp; issue</h2>
        <div class="actions">
          <button class="btn-ghost" @click="wf.state.step = 3">← Back</button>
          <button class="btn-primary" :disabled="issuing" @click="issue">
            {{ issuing ? 'Issuing…' : `Issue ${trsByLab.size} request(s)` }}
          </button>
        </div>
      </header>
      <p class="hint">One TestRequest will be created per lab. Each carries the explicit (form × sample × model) tuples.</p>
      <section v-for="[labId] in trsByLab" :key="labId" class="tr-preview">
        <h3>{{ wf.state.labs.find(l => l.id === labId)?.name ?? labId }}</h3>
      </section>
    </section>
  </div>
</template>

<style scoped>
.dispatch-wizard { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: var(--font-sans); color: var(--ink); }
.steps { display: flex; gap: 0; list-style: none; margin: 0 0 2rem; padding: 0; border-bottom: 1px solid var(--rule); }
.steps li { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--ink-soft); border-bottom: 2px solid transparent; }
.steps li[data-active="true"] { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }
.steps li[data-done="true"] { color: var(--ink); }
.steps li[data-disabled="true"] { opacity: 0.4; }
.steps li span { display: inline-flex; width: 20px; height: 20px; border-radius: 50%; background: var(--rule); color: #fff; font-size: 0.75rem; align-items: center; justify-content: center; margin-right: 0.5rem; }
.panel { display: flex; flex-direction: column; gap: 1rem; }
.panel h2 { font-size: 1.25rem; margin: 0; }
.panel-header { display: flex; justify-content: space-between; align-items: center; }
.actions { display: flex; gap: 0.5rem; }
.btn-primary { padding: 0.5rem 1rem; background: var(--ink); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.btn-primary:hover:not(:disabled) { background: var(--accent); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { padding: 0.5rem 1rem; background: transparent; border: 1px solid var(--rule); border-radius: 4px; cursor: pointer; font-size: 0.875rem; }
.app-list { list-style: none; padding: 0; }
.app-list li { padding: 0.75rem 1rem; border: 1px solid var(--rule); border-radius: 4px; margin-bottom: 0.5rem; cursor: pointer; display: flex; justify-content: space-between; }
.app-list li:hover { background: var(--paper-soft); }
.empty { color: var(--ink-soft); font-style: italic; }
.model-table { width: 100%; border-collapse: collapse; }
.model-table th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.5rem; border-bottom: 1px solid var(--rule); color: var(--ink-soft); }
.model-table td { padding: 0.5rem; border-bottom: 1px solid var(--rule); font-size: 0.875rem; }
.model-plan { padding: 1rem; border: 1px solid var(--rule); border-radius: 4px; margin-bottom: 0.75rem; }
.model-plan[data-ready="true"] { border-color: var(--accent); }
.model-plan-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
.warn { color: #d97706; font-size: 0.75rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
.field-label { font-size: 0.75rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; }
select, input[type="checkbox"] { font: inherit; }
.form-list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.form-check { display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; cursor: pointer; }
.hint { font-size: 0.875rem; color: var(--ink-soft); }
.tr-preview { padding: 1rem; border: 1px solid var(--rule); border-radius: 4px; margin-bottom: 0.5rem; }
.tr-preview h3 { font-size: 1rem; margin: 0; }
</style>
