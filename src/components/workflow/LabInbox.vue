<script setup lang="ts">
import { computed } from 'vue'
import { useTestRequest } from '../../lib/entity-composables'
import { useEntityList } from '../../lib/use-entity-list'
import { useAuth } from '../../lib/useAuth'
import { bucketByStatus, countOpen, formatAssignments, type TestRequestLike } from '../../lib/test-request-lifecycle'

const { user } = useAuth()
const { items: allRequests, loading } = useEntityList(useTestRequest())

const labId = computed(() => {
  const u = user.value as { labId?: string } | null
  return u?.labId ?? 'sample-lab-a'
})

const buckets = computed(() => bucketByStatus(allRequests.value as TestRequestLike[], labId.value))
const totalOpen = computed(() => countOpen(buckets.value))

const bucketConfigs = [
  { key: 'incoming' as const, label: 'Awaiting your response', sectionClass: 'bg-[rgba(254,243,199,0.3)] py-2 px-4 pb-4 rounded' },
  { key: 'accepted' as const, label: 'Ready to start', sectionClass: '' },
  { key: 'inProgress' as const, label: 'In progress', sectionClass: '' },
  { key: 'completed' as const, label: 'Completed', sectionClass: 'opacity-60' },
]
</script>

<template>
  <div class="max-w-[900px] mx-auto py-8 px-6 font-sans text-ink">
    <div class="mb-8">
      <span class="text-xs uppercase tracking-wider text-ink-soft">Lab workspace</span>
      <h1 class="text-[1.75rem] mt-1 mb-2">Incoming work</h1>
      <p class="text-sm text-ink-soft m-0">Test requests assigned to <code class="font-mono text-[0.8125rem]">{{ labId }}</code> · {{ totalOpen }} open {{ totalOpen === 1 ? 'item' : 'items' }}</p>
    </div>
    <p v-if="loading" class="text-center py-16 text-ink-soft italic">Loading…</p>
    <template v-else>
      <p v-if="totalOpen === 0 && buckets.completed.length === 0" class="text-center py-16 text-ink-soft italic">No test requests assigned to this lab yet.</p>
      <section
        v-for="cfg in bucketConfigs"
        :key="cfg.key"
        v-show="buckets[cfg.key].length > 0"
        class="mb-6"
        :class="cfg.sectionClass"
      >
        <header class="flex items-baseline gap-3 mb-3">
          <h2 class="text-base m-0">{{ cfg.label }}</h2>
          <span class="text-sm text-ink-soft font-mono">{{ buckets[cfg.key].length }}</span>
        </header>
        <ul class="list-none p-0 m-0 flex flex-col gap-2">
          <li v-for="r in buckets[cfg.key]" :key="r.id" class="bg-paper border border-rule px-4 py-3 rounded transition-colors hover:border-accent">
            <code class="font-mono text-sm">{{ r.requestNumber ?? r.id }}</code>
            <p class="mt-1 mb-0 text-xs text-ink-soft font-mono">{{ formatAssignments(r) }}</p>
          </li>
        </ul>
      </section>
    </template>
    <nav class="mt-12 pt-6 border-t border-rule"><a href="/app/" class="text-sm text-accent no-underline hover:underline">← Back to app home</a></nav>
  </div>
</template>
