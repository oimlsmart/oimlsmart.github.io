<script setup lang="ts">
import { useTestRequest } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'

const { items: requests, loading, reload } = useEntityList(useTestRequest())
</script>

<template>
  <div class="tr-list">
    <header class="header">
      <h1>Test Requests</h1>
      <a href="/app/dispatch" class="btn-primary">+ Dispatch new</a>
    </header>

    <p v-if="loading" class="loading">Loading…</p>

    <table v-else-if="requests.length > 0" class="table">
      <thead>
        <tr><th>Number</th><th>Lab</th><th>Status</th><th>Standard</th></tr>
      </thead>
      <tbody>
        <tr v-for="r in requests" :key="r.id as string">
          <td><code>{{ r.requestNumber ?? (r.id as string).slice(0, 8) }}</code></td>
          <td>{{ r.assignedLaboratoryId ?? '—' }}</td>
          <td><span class="status" :data-status="r.status">{{ r.status }}</span></td>
          <td>{{ r.standardId ?? '—' }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">No test requests yet. <a href="/app/dispatch">Dispatch one →</a></p>

    <nav class="back-nav">
      <a href="/app/">← Back to app home</a>
    </nav>
  </div>
</template>

<style scoped>
.tr-list { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: var(--font-sans); color: var(--ink); }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header h1 { font-size: 1.75rem; margin: 0; }
.btn-primary { padding: 0.5rem 1rem; background: var(--ink); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; text-decoration: none; }
.loading, .empty { text-align: center; padding: 4rem; color: var(--ink-soft); }
.empty a { color: var(--accent); }
.table { width: 100%; border-collapse: collapse; }
.table th { text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.5rem; border-bottom: 1px solid var(--rule); color: var(--ink-soft); }
.table td { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--rule); font-size: 0.875rem; }
.status { font-size: 0.75rem; padding: 2px 8px; border-radius: 2px; background: var(--paper-soft); }
.status[data-status="ISSUED"] { background: rgb(254 243 199); color: rgb(146 64 14); }
.status[data-status="COMPLETED"] { background: rgb(220 252 231); color: rgb(22 101 52); }
.back-nav { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); }
.back-nav a { font-size: 0.875rem; color: var(--accent); text-decoration: none; }
</style>
