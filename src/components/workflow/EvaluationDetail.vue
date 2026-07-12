<script setup lang="ts">
import { computed } from 'vue'
import { useEvaluationReport, useTestReportDetermination, useFormInstance } from '../../lib/entity-composables'
import { useRouteEntity } from '../../lib/use-route-entity'
import { synthesizeEvaluation } from '../../lib/evaluation-aggregator.service'

const erApi = useEvaluationReport()
const { id, loading } = useRouteEntity(erApi)
const synthesis = computed(() => id.value ? synthesizeEvaluation(id.value, {
  reportApi: erApi,
  determinationApi: useTestReportDetermination(),
  formInstanceApi: useFormInstance(),
}) : null)
const report = computed(() => erApi.get(id.value ?? ''))
</script>
<template>
  <div class="page">
    <header>
      <h1>{{ report?.reportNumber ?? id }}</h1>
      <span v-if="synthesis" class="decision" :data-decision="synthesis.overallDecision">{{ synthesis.overallDecision }}</span>
    </header>
    <p v-if="loading">Loading…</p>
    <template v-else-if="report && synthesis">
      <section class="status-grid">
        <div class="stat"><span class="label">Can finalize</span><span class="value">{{ synthesis.canFinalize ? '✓' : '✗' }}</span></div>
        <div class="stat"><span class="label">Test reports</span><span class="value">{{ (report.testReportIds as string[])?.length ?? 0 }}</span></div>
        <div class="stat"><span class="label">Pending TRs</span><span class="value">{{ synthesis.pendingReportIds.length }}</span></div>
        <div class="stat"><span class="label">Incomplete models</span><span class="value">{{ synthesis.incompleteModelIds.length }}</span></div>
      </section>
      <section class="card" v-if="synthesis.modelEvaluations.length">
        <h2>Model Evaluations ({{ synthesis.modelEvaluations.length }})</h2>
        <table class="table">
          <thead><tr><th>Model</th><th>Decision</th><th>Covered</th><th>Missing</th><th>Contributors</th></tr></thead>
          <tbody>
            <tr v-for="me in synthesis.modelEvaluations" :key="me.modelId">
              <td><code>{{ me.modelId.slice(0,12) }}</code></td>
              <td><span class="mini" :data-decision="me.decision">{{ me.decision }}</span></td>
              <td>{{ me.coveredFormIds.length }}</td>
              <td>{{ me.missingFormIds.length }}</td>
              <td>{{ me.contributorTestReportIds.length }} TRs · {{ me.contributorLabIds.length }} labs</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section class="card" v-if="synthesis.perForm.length">
        <h2>Per-Form Aggregate</h2>
        <table class="table">
          <thead><tr><th>Form</th><th>Instances</th><th>Result</th></tr></thead>
          <tbody>
            <tr v-for="f in synthesis.perForm" :key="f.formId"><td><code>{{ f.formId }}</code></td><td>{{ f.instances.length }}</td><td><span class="mini">{{ f.aggregateResult }}</span></td></tr>
          </tbody>
        </table>
      </section>
    </template>
    <p v-else class="empty">Evaluation report not found.</p>
    <nav class="back"><a href="/app/evaluations">← All evaluations</a></nav>
  </div>
</template>
<style scoped>
.page{max-width:900px;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#1a1a1a}
h1{font-size:1.5rem;margin:0 0 .5rem;display:inline}
.decision{font-size:.7rem;padding:3px 10px;border-radius:2px;font-weight:500;text-transform:uppercase;margin-left:.5rem;color:#fff}
.decision[data-decision="APPROVED"]{background:#10b981}
.decision[data-decision="REJECTED"]{background:#ef4444}
.decision[data-decision="CONDITIONALLY_APPROVED"]{background:#f59e0b}
.decision[data-decision="PENDING"]{background:#e2e8f0;color:#475569}
.status-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;margin-bottom:1.5rem}
.stat{border:1px solid #e0e0e0;border-radius:4px;padding:.75rem;text-align:center}
.label{display:block;font-size:.6rem;text-transform:uppercase;color:#999;margin-bottom:.25rem}
.value{font-size:1.25rem;font-weight:500}
.card{border:1px solid #e0e0e0;border-radius:4px;padding:1rem;margin-bottom:1rem}
.card h2{font-size:1rem;margin:0 0 .75rem}
.table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:.65rem;text-transform:uppercase;padding:.4rem;border-bottom:1px solid #e0e0e0;color:#666}
td{padding:.5rem .4rem;border-bottom:1px solid #f0f0f0;font-size:.75rem}
.mini{font-size:.6rem;padding:1px 5px;border-radius:2px;background:#f0f0f0}
.mini[data-decision="PASS"]{background:#dcfce7;color:#166534}
.mini[data-decision="FAIL"]{background:#fee2e2;color:#991b1b}
.mini[data-decision="INCOMPLETE"]{background:#fef3c7;color:#92400e}
.empty{text-align:center;padding:3rem;color:#999}
.back{margin-top:2rem;padding-top:1rem;border-top:1px solid #e0e0e0}
a{color:#004996;text-decoration:none}
</style>
