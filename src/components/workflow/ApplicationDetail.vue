<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApplication, useModelFamily, useMeasuringInstrument, useTestRequest } from '../../lib/entity-composables'
const appApi = useApplication()
const familyApi = useModelFamily()
const modelApi = useMeasuringInstrument()
const trApi = useTestRequest()
const loading = ref(true)
const id = ref<string | null>(null)
const app = computed(() => appApi.get(id.value ?? '') as Record<string, unknown> | undefined)
const models = computed(() => {
  if (!app.value) return []
  const fid = app.value.modelFamilyId ?? app.value.instrumentModelFamilyId
  return modelApi.filter(() => true).filter((m: Record<string, unknown>) => m.modelFamilyId === fid)
})
const trs = computed(() => trApi.filter(() => true).filter((t: Record<string, unknown>) => t.applicationId === id.value))
onMounted(() => {
  id.value = new URLSearchParams(window.location.search).get('id')
  loading.value = false
})
</script>
<template>
  <div class="page">
    <header><h1>Application {{ app?.applicationNumber ?? id }}</h1><span class="badge" :data-status="app?.status">{{ app?.status }}</span></header>
    <p v-if="loading" class="loading">Loading…</p>
    <template v-else-if="app">
      <section class="card">
        <h2>Models ({{ models.length }})</h2>
        <table class="table"><thead><tr><th>Designation</th><th>Emax</th><th>Class</th></tr></thead>
          <tbody><tr v-for="m in models" :key="m.id as string"><td><code>{{ m.model }}</code></td><td>{{ m.emax ? (m.emax >= 1000 ? `${m.emax/1000}t` : `${m.emax}kg`) : '—' }}</td><td>{{ m.accuracyClass ?? '—' }}</td></tr></tbody></table>
      </section>
      <section class="card">
        <h2>Test Requests ({{ trs.length }})</h2>
        <p v-if="!trs.length" class="muted">None yet. <a :href="`/app/dispatch`">Dispatch one →</a></p>
        <ul v-else class="list"><li v-for="t in trs" :key="t.id as string"><a :href="`/app/test-request-detail?id=${t.id}`"><code>{{ t.requestNumber }}</code></a> <span class="badge">{{ t.status }}</span></li></ul>
      </section>
    </template>
    <p v-else class="empty">Application not found.</p>
    <nav class="back"><a href="/app/applications">← All applications</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.5rem;margin:0 0 .5rem;display:inline}
.badge{font-size:.7rem;padding:2px 8px;border-radius:2px;background:#f0f0f0;margin-left:.5rem}
.loading,.empty,.muted{text-align:center;padding:2rem;color:#999;font-style:italic}
.card{border:1px solid #e0e0e0;border-radius:4px;padding:1rem;margin-bottom:1rem}
.card h2{font-size:1rem;margin:0 0 .75rem}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.7rem;text-transform:uppercase;padding:.4rem;border-bottom:1px solid #e0e0e0;color:#666}
td{padding:.5rem;border-bottom:1px solid #f0f0f0;font-size:.8rem}
.list{list-style:none;padding:0}
.list li{padding:.5rem 0;border-bottom:1px solid #f0f0f0}
a{color:#004996;text-decoration:none}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
</style>
