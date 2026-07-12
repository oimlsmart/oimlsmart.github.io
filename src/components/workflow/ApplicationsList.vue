<script setup lang="ts">
import { useApplication } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'
const { items: apps, loading } = useEntityList(useApplication())
</script>
<template>
  <div class="page">
    <header><h1>Applications</h1></header>
    <p v-if="loading" class="loading">Loading…</p>
    <table v-else-if="apps.length" class="table">
      <thead><tr><th>Number</th><th>Status</th><th>Standard</th><th>Family</th></tr></thead>
      <tbody>
        <tr v-for="a in apps" :key="a.id">
          <td><a :href="`/app/application-detail?id=${a.id}`"><code>{{ a.applicationNumber ?? a.id.slice(0,8) }}</code></a></td>
          <td><span class="badge" :data-status="a.status">{{ a.status }}</span></td>
          <td>{{ a.standardId }}</td>
          <td>{{ (a.modelFamilyId ?? a.instrumentModelFamilyId) ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">No applications. <a href="/app/">Load demo data first.</a></p>
    <nav class="back"><a href="/app/">← Back</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:var(--ink,#1a1a1a)}
h1{font-size:1.75rem;margin:0 0 1.5rem}
.loading,.empty{text-align:center;padding:3rem;color:#999;font-style:italic}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;padding:.5rem;border-bottom:1px solid #e0e0e0;color:#666}
td{padding:.75rem .5rem;border-bottom:1px solid #e0e0e0;font-size:.875rem}
a{color:#004996;text-decoration:none}
a:hover{text-decoration:underline}
.badge{font-size:.7rem;padding:2px 8px;border-radius:2px;background:#f0f0f0}
.badge[data-status="ACCEPTED"]{background:#dcfce7;color:#166534}
.badge[data-status="SUBMITTED"]{background:#fef3c7;color:#92400e}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
.back a{font-size:.875rem}
</style>
