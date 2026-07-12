<script setup lang="ts">
import { computed } from 'vue'
import { useTestRequest, useTestAssignment } from '../../lib/entity-composables'
import { useRouteEntity } from '../../lib/use-route-entity'
const trApi = useTestRequest()
const taApi = useTestAssignment()
const { id, loading } = useRouteEntity(trApi)
const tr = computed(() => trApi.get(id.value ?? ''))
const assignments = computed(() => taApi.filter(a => a.testRequestId === id.value))
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <header><h1 class="text-2xl mb-2 inline">{{ tr?.requestNumber ?? id }}</h1><span class="text-xs px-2 py-0.5 rounded-sm bg-paper-raised ml-2">{{ tr?.status }}</span></header>
    <p v-if="loading" class="text-center py-8 text-ink-muted italic">Loading…</p>
    <template v-else-if="tr">
      <section class="grid gap-3 mb-6 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <div class="flex flex-col gap-0.5"><span class="text-[0.65rem] uppercase tracking-wider text-ink-muted">Lab</span><code class="font-mono text-sm">{{ tr.assignedLaboratoryId }}</code></div>
        <div class="flex flex-col gap-0.5"><span class="text-[0.65rem] uppercase tracking-wider text-ink-muted">Standard</span><code class="font-mono text-sm">{{ tr.standardId }}</code></div>
        <div class="flex flex-col gap-0.5"><span class="text-[0.65rem] uppercase tracking-wider text-ink-muted">Scheme</span><code class="font-mono text-sm">{{ tr.scheme }}</code></div>
        <div class="flex flex-col gap-0.5"><span class="text-[0.65rem] uppercase tracking-wider text-ink-muted">Issued</span><code class="font-mono text-sm">{{ tr.issuedDate ?? '—' }}</code></div>
      </section>
      <section class="border border-rule rounded p-4 mb-4">
        <h2 class="text-base mb-3">Assignments ({{ assignments.length }})</h2>
        <table class="w-full border-collapse">
          <thead><tr><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Form</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Model</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Sample</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Lab</th><th class="text-left text-[0.65rem] uppercase py-1.5 border-b border-rule text-ink-soft">Status</th></tr></thead>
          <tbody>
            <tr v-for="a in assignments" :key="a.id">
              <td class="py-2 border-b border-rule-soft text-xs"><code>{{ a.formId }}</code></td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ a.modelId?.slice(0,12) }}</td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ a.sampleId?.slice(0,12) }}</td>
              <td class="py-2 border-b border-rule-soft text-xs">{{ a.laboratoryId?.slice(0,12) }}</td>
              <td class="py-2 border-b border-rule-soft text-xs"><span class="text-[0.6rem] px-1 py-px rounded-sm bg-paper-raised">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <p v-if="!assignments.length" class="text-center py-8 text-ink-muted italic">No assignments yet.</p>
      </section>
    </template>
    <p v-else class="text-center py-8 text-ink-muted italic">Test request not found.</p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/test-requests" class="text-sm text-accent no-underline">← All requests</a></nav>
  </div>
</template>
