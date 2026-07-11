<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInstrumentSample } from '../../lib/entity-composables'
const api = useInstrumentSample()
const loading = ref(true)
const samples = ref<Array<Record<string, unknown>>>([])
onMounted(async () => { samples.value = api.list(); loading.value = false })
</script>
<template>
  <div class="page">
    <header><h1>Sample Inventory</h1></header>
    <p v-if="loading" class="loading">Loading…</p>
    <table v-else-if="samples.length" class="table">
      <thead><tr><th>Serial</th><th>Model</th><th>Status</th><th>Family</th></tr></thead>
      <tbody>
        <tr v-for="s in samples" :key="s.id as string">
          <td><code>{{ s.serialNumber ?? s.id }}</code></td>
          <td>{{ (s.modelId as string)?.slice(0,16) }}</td>
          <td><span class="badge">{{ s.status }}</span></td>
          <td>{{ (s.familyId as string)?.slice(0,12) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">No samples.</p>
    <nav class="back"><a href="/app/">← Back</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.75rem;margin:0 0 1.5rem}
.loading,.empty{text-align:center;padding:3rem;color:#999;font-style:italic}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.7rem;text-transform:uppercase;padding:.5rem;border-bottom:1px solid #e0e0e0;color:#666}
td{padding:.6rem;border-bottom:1px solid #f0f0f0;font-size:.8rem}
.badge{font-size:.65rem;padding:1px 6px;border-radius:2px;background:#f0f0f0}
a{color:#004996}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
</style>
