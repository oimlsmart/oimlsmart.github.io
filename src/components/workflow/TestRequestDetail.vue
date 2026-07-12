<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTestRequest, useTestAssignment } from '../../lib/entity-composables'
const trApi = useTestRequest()
const taApi = useTestAssignment()
const loading = ref(true)
const id = ref<string | null>(null)
const tr = computed(() => trApi.get(id.value ?? '') as Record<string, unknown> | undefined)
const assignments = computed(() => taApi.filter(() => true).filter((a: Record<string, unknown>) => a.testRequestId === id.value))
onMounted(() => {
  id.value = new URLSearchParams(window.location.search).get('id')
  loading.value = false
})
</script>
<template>
  <div class="page">
    <header><h1>{{ tr?.requestNumber ?? id }}</h1><span class="badge">{{ tr?.status }}</span></header>
    <p v-if="loading" class="loading">Loading…</p>
    <template v-else-if="tr">
      <section class="meta">
        <div><span>Lab</span><code>{{ tr.assignedLaboratoryId }}</code></div>
        <div><span>Standard</span><code>{{ tr.standardId }}</code></div>
        <div><span>Scheme</span><code>{{ tr.scheme }}</code></div>
        <div><span>Issued</span><code>{{ tr.issuedDate ?? '—' }}</code></div>
      </section>
      <section class="card">
        <h2>Assignments ({{ assignments.length }})</h2>
        <table class="table">
          <thead><tr><th>Form</th><th>Model</th><th>Sample</th><th>Lab</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="a in assignments" :key="a.id as string">
              <td><code>{{ a.formId }}</code></td>
              <td>{{ (a.modelId as string)?.slice(0,12) }}</td>
              <td>{{ (a.sampleId as string)?.slice(0,12) }}</td>
              <td>{{ (a.laboratoryId as string)?.slice(0,12) }}</td>
              <td><span class="mini-badge">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <p v-if="!assignments.length" class="muted">No assignments yet.</p>
      </section>
    </template>
    <p v-else class="empty">Test request not found.</p>
    <nav class="back"><a href="/app/test-requests">← All requests</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.5rem;margin:0 0 .5rem;display:inline}
.badge{font-size:.7rem;padding:2px 8px;border-radius:2px;background:#f0f0f0;margin-left:.5rem}
.meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.75rem;margin-bottom:1.5rem}
.meta div{display:flex;flex-direction:column;gap:.15rem}
.meta span{font-size:.65rem;text-transform:uppercase;letter-spacing:.05em;color:#999}
.meta code{font-family:monospace;font-size:.8rem}
.loading,.empty,.muted{text-align:center;padding:2rem;color:#999;font-style:italic}
.card{border:1px solid #e0e0e0;border-radius:4px;padding:1rem;margin-bottom:1rem}
.card h2{font-size:1rem;margin:0 0 .75rem}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.65rem;text-transform:uppercase;padding:.4rem;border-bottom:1px solid #e0e0e0;color:#666}
td{padding:.5rem .4rem;border-bottom:1px solid #f0f0f0;font-size:.75rem}
.mini-badge{font-size:.6rem;padding:1px 5px;border-radius:2px;background:#f0f0f0}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
a{color:#004996;text-decoration:none}
</style>
