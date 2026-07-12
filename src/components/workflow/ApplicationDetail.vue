<script setup lang="ts">
import { computed } from 'vue'
import { useRouteEntity } from '../../lib/use-route-entity'
import { useApplication, useMeasuringInstrument, useTestRequest } from '../../lib/entity-composables'

const appApi = useApplication()
const modelApi = useMeasuringInstrument()
const trApi = useTestRequest()

const { id, loading } = useRouteEntity(appApi)
const app = computed(() => appApi.get(id.value ?? ''))
const models = computed(() => {
  if (!app.value) return []
  const fid = app.value.modelFamilyId ?? app.value.instrumentModelFamilyId
  if (!fid) return []
  return modelApi.filter(m => m.modelFamilyId === fid)
})
const trs = computed(() => trApi.filter(t => t.applicationId === id.value))
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <header><h1 class="text-2xl mb-2 inline">Application {{ app?.applicationNumber ?? id }}</h1><span class="text-xs px-2 py-0.5 rounded-sm bg-paper-raised ml-2">{{ app?.status }}</span></header>
    <p v-if="loading" class="text-center py-8 text-ink-muted italic">Loading…</p>
    <template v-else-if="app">
      <section class="border border-rule rounded p-4 mb-4">
        <h2 class="text-base mb-3">Models ({{ models.length }})</h2>
        <table class="w-full border-collapse">
          <thead><tr><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Designation</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Emax</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Class</th></tr></thead>
          <tbody>
            <tr v-for="m in models" :key="m.id">
              <td class="py-2 border-b border-rule-soft text-sm"><code>{{ m.model }}</code></td>
              <td class="py-2 border-b border-rule-soft text-sm">{{ m.emax ? (m.emax >= 1000 ? `${m.emax/1000}t` : `${m.emax}kg`) : '—' }}</td>
              <td class="py-2 border-b border-rule-soft text-sm">{{ m.accuracyClass ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="border border-rule rounded p-4 mb-4">
        <h2 class="text-base mb-3">Test Requests ({{ trs.length }})</h2>
        <p v-if="!trs.length" class="text-ink-muted italic">None yet. <a href="/app/dispatch" class="text-accent">Dispatch one →</a></p>
        <ul v-else class="list-none p-0">
          <li v-for="t in trs" :key="t.id" class="py-2 border-b border-rule-soft"><a :href="`/app/test-request-detail?id=${t.id}`" class="text-accent no-underline"><code>{{ t.requestNumber }}</code></a> <span class="text-xs px-2 py-0.5 rounded-sm bg-paper-raised">{{ t.status }}</span></li>
        </ul>
      </section>
    </template>
    <p v-else class="text-center py-8 text-ink-muted italic">Application not found.</p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/applications" class="text-sm text-accent no-underline">← All applications</a></nav>
  </div>
</template>
