<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModelFamily, useModelGroup, useMeasuringInstrument } from '../../lib/entity-composables'
const famApi = useModelFamily()
const grpApi = useModelGroup()
const mdlApi = useMeasuringInstrument()
const loading = ref(true)
const families = ref<Array<Record<string, unknown>>>([])
onMounted(async () => { families.value = famApi.list(); loading.value = false })
function groupCount(fid: string) { return grpApi.filter((g: Record<string, unknown>) => g.familyId === fid).length }
function modelCount(fid: string) { return mdlApi.filter((m: Record<string, unknown>) => m.modelFamilyId === fid).length }
</script>
<template>
  <div class="page">
    <header><h1>Model Families</h1></header>
    <p v-if="loading" class="loading">Loading…</p>
    <ul v-else-if="families.length" class="list">
      <li v-for="f in families" :key="f.id as string" class="card">
        <h2>{{ f.familyName ?? f.id }}</h2>
        <div class="meta">
          <span>Code: <code>{{ f.familyCode ?? '—' }}</code></span>
          <span>Technology: {{ f.technology ?? '—' }}</span>
          <span>Groups: {{ groupCount(f.id as string) }}</span>
          <span>Models: {{ modelCount(f.id as string) }}</span>
        </div>
      </li>
    </ul>
    <p v-else class="empty">No model families. <a href="/app/">Load demo data first.</a></p>
    <nav class="back"><a href="/app/">← Back</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.75rem;margin:0 0 1.5rem}
.loading,.empty{text-align:center;padding:3rem;color:#999;font-style:italic}
.list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.75rem}
.card{border:1px solid #e0e0e0;border-radius:4px;padding:1rem}
.card h2{font-size:1rem;margin:0 0 .5rem}
.meta{display:flex;flex-wrap:wrap;gap:1rem;font-size:.75rem;color:#666}
.meta code{font-family:monospace}
a{color:#004996}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
</style>
