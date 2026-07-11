<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useEvaluationReport, useTestReportDetermination, useFormInstance } from '../../lib/entity-composables'
import { aggregateEvaluation } from '../../lib/evaluation-aggregator.service'

const erApi = useEvaluationReport()
const detApi = useTestReportDetermination()
const fiApi = useFormInstance()
const loading = ref(true)
const reports = ref<Array<Record<string, unknown>>>([])

async function load() {
  loading.value = true
  reports.value = erApi.list()
  loading.value = false
}

function getSynthesis(report: Record<string, unknown>) {
  const testReportIds = (report.testReportIds as string[]) ?? []
  const determinations = detApi.list() as Array<{ testReportId: string; decision: string; evaluationReportId: string }>
  const formInstances = fiApi.list() as Array<{ formId: string; testReportId?: string; modelId?: string; result?: string }>
  const labsByTestReport = new Map<string, string>()

  return aggregateEvaluation({
    testReportIds,
    determinations: determinations.filter(d => d.evaluationReportId === report.id),
    formInstances,
    formProgram: {},
    labsByTestReport,
  })
}

onMounted(load)
</script>

<template>
  <div class="eval-list">
    <header class="header">
      <h1>Evaluation Reports</h1>
    </header>

    <p v-if="loading" class="loading">Loading…</p>

    <ul v-else-if="reports.length > 0" class="list">
      <li v-for="r in reports" :key="r.id as string" class="card">
        <div class="card-header">
          <code class="num">{{ r.reportNumber ?? (r.id as string).slice(0, 8) }}</code>
          <span class="decision" :data-decision="getSynthesis(r).overallDecision">
            {{ getSynthesis(r).overallDecision }}
          </span>
        </div>
        <div class="card-body">
          <span>Test Reports: {{ (r.testReportIds as string[])?.length ?? 0 }}</span>
          <span>Can finalize: {{ getSynthesis(r).canFinalize ? '✓' : '✗' }}</span>
          <span>Pending: {{ getSynthesis(r).pendingReportIds.length }}</span>
        </div>
      </li>
    </ul>

    <p v-else class="empty">No evaluation reports yet.</p>

    <nav class="back-nav">
      <a href="/app/">← Back to app home</a>
    </nav>
  </div>
</template>

<style scoped>
.eval-list { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: var(--font-sans); color: var(--ink); }
.header { margin-bottom: 2rem; }
.header h1 { font-size: 1.75rem; margin: 0; }
.loading, .empty { text-align: center; padding: 4rem; color: var(--ink-soft); }
.list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; }
.card { border: 1px solid var(--rule); border-radius: 4px; padding: 1rem; transition: border-color 0.15s; }
.card:hover { border-color: var(--accent); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.num { font-family: var(--font-mono); font-size: 0.875rem; }
.decision { font-size: 0.75rem; padding: 2px 10px; border-radius: 2px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.decision[data-decision="APPROVED"] { background: rgb(16 185 129); color: #fff; }
.decision[data-decision="REJECTED"] { background: rgb(239 68 68); color: #fff; }
.decision[data-decision="CONDITIONALLY_APPROVED"] { background: rgb(245 158 11); color: #fff; }
.decision[data-decision="PENDING"] { background: rgb(226 232 240); color: rgb(71 85 105); }
.card-body { display: flex; gap: 1.5rem; font-size: 0.8125rem; color: var(--ink-soft); font-family: var(--font-mono); }
.back-nav { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); }
.back-nav a { font-size: 0.875rem; color: var(--accent); text-decoration: none; }
</style>
