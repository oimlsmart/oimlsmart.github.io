<script setup lang="ts">
import { useInstrumentSample } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'
const { items: samples, loading } = useEntityList(useInstrumentSample())
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <h1 class="text-[1.75rem] mb-6">Sample Inventory</h1>
    <p v-if="loading" class="text-center py-12 text-ink-muted italic">Loading…</p>
    <table v-else-if="samples.length" class="w-full border-collapse">
      <thead><tr><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Serial</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Model</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Status</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Family</th></tr></thead>
      <tbody>
        <tr v-for="s in samples" :key="s.id">
          <td class="py-2.5 border-b border-rule-soft text-[0.8rem]"><code>{{ s.serialNumber ?? s.id }}</code></td>
          <td class="py-2.5 border-b border-rule-soft text-[0.8rem]">{{ s.modelId?.slice(0,16) }}</td>
          <td class="py-2.5 border-b border-rule-soft text-[0.8rem]"><span class="text-[0.65rem] px-1.5 py-px rounded-sm bg-paper-raised">{{ s.status }}</span></td>
          <td class="py-2.5 border-b border-rule-soft text-[0.8rem]">{{ s.familyId?.slice(0,12) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-center py-12 text-ink-muted italic">No samples.</p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/" class="text-sm text-accent">← Back</a></nav>
  </div>
</template>
