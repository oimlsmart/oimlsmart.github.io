<script setup lang="ts">
import { useTestRequest } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'

const { items: requests, loading } = useEntityList(useTestRequest())

function statusClass(status: string): string {
  if (status === 'ISSUED') return 'bg-[#fef3c7] text-[#92400e]'
  if (status === 'COMPLETED') return 'bg-[#dcfce7] text-[#166534]'
  return 'bg-paper-soft text-ink-soft'
}
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-[1.75rem] m-0">Test Requests</h1>
      <a href="/app/dispatch" class="py-2 px-4 bg-ink text-white border-none rounded cursor-pointer text-sm no-underline hover:bg-accent">+ Dispatch new</a>
    </div>
    <p v-if="loading" class="text-center py-16 text-ink-soft">Loading…</p>
    <table v-else-if="requests.length > 0" class="w-full border-collapse">
      <thead><tr><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Number</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Lab</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Status</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Standard</th></tr></thead>
      <tbody>
        <tr v-for="r in requests" :key="r.id">
          <td class="py-3 px-2 border-b border-rule text-sm"><code>{{ r.requestNumber ?? r.id.slice(0, 8) }}</code></td>
          <td class="py-3 px-2 border-b border-rule text-sm">{{ r.assignedLaboratoryId ?? '—' }}</td>
          <td class="py-3 px-2 border-b border-rule text-sm"><span class="text-xs px-2 py-0.5 rounded-sm" :class="statusClass(r.status)">{{ r.status }}</span></td>
          <td class="py-3 px-2 border-b border-rule text-sm">{{ r.standardId ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-center py-16 text-ink-soft">No test requests yet. <a href="/app/dispatch" class="text-accent">Dispatch one →</a></p>
    <nav class="mt-12 pt-6 border-t border-rule"><a href="/app/" class="text-sm text-accent no-underline">← Back to app home</a></nav>
  </div>
</template>
