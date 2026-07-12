<script setup lang="ts">
import { computed } from 'vue'
import { useEvaluationReport, useTestReportDetermination, useFormInstance } from '../../lib/entity-composables'
import { useRouteEntity } from '../../lib/use-route-entity'
import { synthesizeEvaluation } from '../../lib/evaluation-aggregator.service'
import { overallDecisionBadgeClass, modelDecisionBadgeClass } from '../../lib/badge-styles'

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
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <header>
      <h1 class="text-2xl mb-2 inline">{{ report?.reportNumber ?? id }}</h1>
      <span v-if="synthesis" class="text-xs px-2.5 py-0.5 rounded-sm font-medium uppercase ml-2" :class="overallDecisionBadgeClass(synthesis.overallDecision)">{{ synthesis.overallDecision }}</span>
    </header>
    <p v-if="loading" class="text-center py-8 text-ink-muted italic">Loading…</p>
    <template v-else-if="report && synthesis">
      <section class="grid grid-cols-4 gap-2 mb-6">
        <div class="border border-rule rounded p-3 text-center"><span class="block text-[0.6rem] uppercase text-ink-muted mb-1">Can finalize</span><span class="text-xl font-medium">{{ synthesis.canFinalize ? '✓' : '✗' }}</span></div>
        <div class="border border-rule rounded p-3 text-center"><span class="block text-[0.6rem] uppercase text-ink-muted mb-1">Test reports</span><span class="text-xl font-medium">{{ report.testReportIds?.length ?? 0 }}</span></div>
        <div class="border border-rule rounded p-3 text-center"><span class="block text-[0.6rem] uppercase text-ink-muted mb-1">Pending TRs</span><span class="text-xl font-medium">{{ synthesis.pendingReportIds.length }}</span></div>
        <div class="border border-rule rounded p-3 text-center"><span class="block text-[0.6rem] uppercase text-ink-muted mb-1">Incomplete models</span><span class="text-xl font-medium">{{ synthesis.incompleteModelIds.length }}</span></div>
      </section>
      <section v-if="synthesis.modelEvaluations.length" class="border border-rule rounded p-4 mb-4">
        <h2 class="text-base mb-3">Model Evaluations ({{ synthesis.modelEvaluations.length }})</h2>
        <table class="w-full border-collapse">
          <thead><tr><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Model</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Decision</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Covered</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Missing</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Contributors</th></tr></thead>
          <tbody>
            <tr v-for="me in synthesis.modelEvaluations" :key="me.modelId">
              <td class="py-2 border-b border-rule-soft text-xs"><code>{{ me.modelId.slice(0,12) }}</code></td>
              <td class="py-2 border-b border-rule-soft text-xs"><span class="text-[0.6rem] px-1 py-px rounded-sm" :class="modelDecisionBadgeClass(me.decision)">{{ me.decision }}</span></td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ me.coveredFormIds.length }}</td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ me.missingFormIds.length }}</td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ me.contributorTestReportIds.length }} TRs · {{ me.contributorLabIds.length }} labs</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section v-if="synthesis.perForm.length" class="border border-rule rounded p-4 mb-4">
        <h2 class="text-base mb-3">Per-Form Aggregate</h2>
        <table class="w-full border-collapse">
          <thead><tr><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Form</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Instances</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Result</th></tr></thead>
          <tbody>
            <tr v-for="f in synthesis.perForm" :key="f.formId"><td class="py-2 border-b border-rule-soft text-xs"><code>{{ f.formId }}</code></td><td class="py-2 border-b border-rule-soft text-xs">{{ f.instances.length }}</td><td class="py-2 border-b border-rule-soft text-xs"><span class="text-[0.6rem] px-1 py-px rounded-sm bg-paper-raised">{{ f.aggregateResult }}</span></td></tr>
          </tbody>
        </table>
      </section>
    </template>
    <p v-else class="text-center py-12 text-ink-muted italic">Evaluation report not found.</p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/evaluations" class="text-sm text-accent no-underline">← All evaluations</a></nav>
  </div>
</template>
