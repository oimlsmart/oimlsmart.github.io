<script setup lang="ts">
import { useApplication } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'
import { applicationStatusBadgeClass } from '../../lib/badge-styles'
import { getFamilyId } from '../../lib/entity-types'
const { items: apps, loading } = useEntityList(useApplication())
</script>
<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <h1 class="text-[1.75rem] mb-6">Applications</h1>
    <p v-if="loading" class="text-center py-12 text-ink-muted italic">Loading…</p>
    <table v-else-if="apps.length" class="w-full border-collapse">
      <thead><tr><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Number</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Status</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Standard</th><th class="text-left text-xs uppercase tracking-wider py-2 border-b border-rule text-ink-soft">Family</th></tr></thead>
      <tbody>
        <tr v-for="a in apps" :key="a.id">
          <td class="py-3 px-2 border-b border-rule text-sm"><a :href="`/app/application-detail?id=${a.id}`" class="text-accent no-underline hover:underline"><code>{{ a.applicationNumber ?? a.id.slice(0,8) }}</code></a></td>
          <td class="py-3 px-2 border-b border-rule text-sm"><span class="text-[0.7rem] px-2 py-0.5 rounded-sm" :class="applicationStatusBadgeClass(a.status)">{{ a.status }}</span></td>
          <td class="py-3 px-2 border-b border-rule text-sm">{{ a.standardId }}</td>
          <td class="py-3 px-2 border-b border-rule text-sm">{{ getFamilyId(a) ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-center py-12 text-ink-muted italic">No applications. <a href="/app/" class="text-accent">Load demo data first.</a></p>
    <nav class="mt-8 pt-4 border-t border-rule"><a href="/app/" class="text-sm text-accent">← Back</a></nav>
  </div>
</template>
