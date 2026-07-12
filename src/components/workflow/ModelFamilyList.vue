<script setup lang="ts">
import { useModelFamily, useModelGroup, useMeasuringInstrument } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'
const famApi = useModelFamily()
const grpApi = useModelGroup()
const mdlApi = useMeasuringInstrument()
const { items: families, loading } = useEntityList(famApi)
function groupCount(fid: string) { return grpApi.filter(g => g.familyId === fid).length }
function modelCount(fid: string) { return mdlApi.filter(m => m.modelFamilyId === fid).length }
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <h1 class="text-[1.75rem] mb-6">Model Families</h1>
    <p v-if="loading" class="text-center py-12 text-ink-muted italic">Loading…</p>
    <ul v-else-if="families.length" class="list-none p-0 flex flex-col gap-3">
      <li v-for="f in families" :key="f.id" class="border border-rule rounded p-4">
        <h2 class="text-base mb-2">{{ f.familyName ?? f.id }}</h2>
        <div class="flex flex-wrap gap-4 text-xs text-ink-soft">
          <span>Code: <code class="font-mono">{{ f.familyCode ?? '—' }}</code></span>
          <span>Technology: {{ f.technology ?? '—' }}</span>
          <span>Groups: {{ groupCount(f.id) }}</span>
          <span>Models: {{ modelCount(f.id) }}</span>
        </div>
      </li>
    </ul>
    <p v-else class="text-center py-12 text-ink-muted italic">No model families. <a href="/app/" class="text-accent">Load demo data first.</a></p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/" class="text-sm text-accent">← Back</a></nav>
  </div>
</template>
