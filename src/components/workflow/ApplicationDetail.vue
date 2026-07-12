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
  <div class="page">
    <header><h1>Application {{ app?.applicationNumber ?? id }}</h1><span class="badge" :data-status="app?.status">{{ app?.status }}</span></header>
    <p v-if="loading" class="loading">Loading…</p>
    <template v-else-if="app">
      <section class="card">
        <h2>Models ({{ models.length }})</h2>
        <table class="table"><thead><tr><th>Designation</th><th>Emax</th><th>Class</th></tr></thead>
          <tbody><tr v-for="m in models" :key="m.id"><td><code>{{ m.model }}</code></td><td>{{ m.emax ? (m.emax >= 1000 ? `${m.emax/1000}t` : `${m.emax}kg`) : '—' }}</td><td>{{ m.accuracyClass ?? '—' }}</td></tr></tbody></table>
      </section>
      <section class="card">
        <h2>Test Requests ({{ trs.length }})</h2>
        <p v-if="!trs.length" class="muted">None yet. <a :href="`/app/dispatch`">Dispatch one →</a></p>
        <ul v-else class="list"><li v-for="t in trs" :key="t.id"><a :href="`/app/test-request-detail?id=${t.id}`"><code>{{ t.requestNumber }}</code></a> <span class="badge">{{ t.status }}</span></li></ul>
      </section>
    </template>
    <p v-else class="empty">Application not found.</p>
    <nav class="back"><a href="/app/applications">← All applications</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:var(--font-sans);color:var(--ink)}
h1{font-size:1.5rem;margin:0 0 .5rem;display:inline}
.badge{font-size:.7rem;padding:2px 8px;border-radius:2px;background:var(--paper-raised);margin-left:.5rem}
.loading,.empty,.muted{text-align:center;padding:2rem;color:var(--ink-muted);font-style:italic}
.card{border:1px solid var(--rule);border-radius:4px;padding:1rem;margin-bottom:1rem}
.card h2{font-size:1rem;margin:0 0 .75rem}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.7rem;text-transform:uppercase;padding:.4rem;border-bottom:1px solid var(--rule);color:var(--ink-soft)}
td{padding:.5rem;border-bottom:1px solid var(--rule-soft);font-size:.8rem}
.list{list-style:none;padding:0}
.list li{padding:.5rem 0;border-bottom:1px solid var(--rule-soft)}
a{color:var(--accent);text-decoration:none}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid var(--rule)}
</style>
