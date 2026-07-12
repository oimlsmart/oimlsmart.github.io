<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEvaluationReport, useTestReportDetermination, useFormInstance } from '../../lib/entity-composables'
import { synthesizeAll } from '../../lib/evaluation-aggregator.service'

const erApi = useEvaluationReport()
const loading = ref(true)
const reports = ref<ReturnType<typeof erApi.list>>([])

async function load() {
  loading.value = true
  reports.value = erApi.list()
  loading.value = false
}

const synthesisById = computed(() => synthesizeAll(
  reports.value.map(r => r.id),
  { reportApi: erApi, determinationApi: useTestReportDetermination(), formInstanceApi: useFormInstance() },
))

function decisionClass(d: string | undefined): string {
  if (d === 'APPROVED') return 'bg-[#10b981] text-white'
  if (d === 'REJECTED') return 'bg-[#ef4444] text-white'
  if (d === 'CONDITIONALLY_APPROVED') return 'bg-[#f59e0b] text-white'
  return 'bg-rule text-ink-soft'
}

onMounted(load)
</script>

<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <div class="mb-8"><h1 class="text-[1.75rem] m-0">Evaluation Reports</h1></div>
    <p v-if="loading" class="text-center py-16 text-ink-soft">Loading…</p>
    <ul v-else-if="reports.length > 0" class="list-none p-0 flex flex-col gap-3">
      <li v-for="r in reports" :key="r.id" class="border border-rule rounded p-4 transition-colors hover:border-accent">
        <div class="flex justify-between items-center mb-2">
          <code class="font-mono text-sm">{{ r.reportNumber ?? r.id.slice(0, 8) }}</code>
          <span class="text-xs px-2.5 py-0.5 rounded-sm font-medium uppercase tracking-wider" :class="decisionClass(synthesisById.get(r.id)?.overallDecision)">{{ synthesisById.get(r.id)?.overallDecision }}</span>
        </div>
        <div class="flex gap-6 text-[0.8125rem] text-ink-soft font-mono">
          <span>Test Reports: {{ r.testReportIds?.length ?? 0 }}</span>
          <span>Can finalize: {{ synthesisById.get(r.id)?.canFinalize ? '✓' : '✗' }}</span>
          <span>Pending: {{ synthesisById.get(r.id)?.pendingReportIds.length }}</span>
        </div>
      </li>
    </ul>
    <p v-else class="text-center py-16 text-ink-soft">No evaluation reports yet.</p>
    <nav class="mt-12 pt-6 border-t border-rule"><a href="/app/" class="text-sm text-accent no-underline">← Back to app home</a></nav>
  </div>
</template>
