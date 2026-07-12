<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTestRequest } from '../../lib/entity-composables'
import { useAuth } from '../../lib/useAuth'
import { bucketByStatus, countOpen, formatAssignments, type TestRequestLike } from '../../lib/test-request-lifecycle'

const trApi = useTestRequest()
const { user } = useAuth()
const loading = ref(true)
const allRequests = ref<TestRequestLike[]>([])

const labId = computed(() => {
  const u = user.value as { labId?: string } | null
  return u?.labId ?? 'sample-lab-a'
})

const buckets = computed(() => bucketByStatus(allRequests.value, labId.value))
const totalOpen = computed(() => countOpen(buckets.value))

async function load() {
  loading.value = true
  allRequests.value = trApi.list() as TestRequestLike[]
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div class="lab-inbox">
    <header class="header">
      <span class="kind">Lab workspace</span>
      <h1>Incoming work</h1>
      <p class="subtitle">
        Test requests assigned to <code>{{ labId }}</code> ·
        {{ totalOpen }} open {{ totalOpen === 1 ? 'item' : 'items' }}
      </p>
    </header>

    <p v-if="loading" class="loading">Loading…</p>

    <template v-else>
      <p v-if="totalOpen === 0 && buckets.completed.length === 0" class="empty">
        No test requests assigned to this lab yet.
      </p>

      <section v-if="buckets.incoming.length > 0" class="bucket urgent">
        <header><h2>Awaiting your response</h2><span class="count">{{ buckets.incoming.length }}</span></header>
        <ul class="list">
          <li v-for="r in buckets.incoming" :key="r.id as string" class="card">
            <code class="num">{{ r.requestNumber ?? r.id }}</code>
            <p class="detail">{{ formatAssignments(r) }}</p>
          </li>
        </ul>
      </section>

      <section v-if="buckets.accepted.length > 0" class="bucket">
        <header><h2>Ready to start</h2><span class="count">{{ buckets.accepted.length }}</span></header>
        <ul class="list">
          <li v-for="r in buckets.accepted" :key="r.id as string" class="card">
            <code class="num">{{ r.requestNumber ?? r.id }}</code>
            <p class="detail">{{ formatAssignments(r) }}</p>
          </li>
        </ul>
      </section>

      <section v-if="buckets.inProgress.length > 0" class="bucket">
        <header><h2>In progress</h2><span class="count">{{ buckets.inProgress.length }}</span></header>
        <ul class="list">
          <li v-for="r in buckets.inProgress" :key="r.id as string" class="card">
            <code class="num">{{ r.requestNumber ?? r.id }}</code>
            <p class="detail">{{ formatAssignments(r) }}</p>
          </li>
        </ul>
      </section>

      <section v-if="buckets.completed.length > 0" class="bucket muted">
        <header><h2>Completed</h2><span class="count">{{ buckets.completed.length }}</span></header>
        <ul class="list">
          <li v-for="r in buckets.completed" :key="r.id as string" class="card">
            <code class="num">{{ r.requestNumber ?? r.id }}</code>
            <p class="detail">{{ formatAssignments(r) }}</p>
          </li>
        </ul>
      </section>
    </template>

    <nav class="back-nav">
      <a href="/app/">← Back to app home</a>
    </nav>
  </div>
</template>

<style scoped>
.lab-inbox { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; font-family: var(--font-sans); color: var(--ink); }
.header { margin-bottom: 2rem; }
.kind { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-soft); }
.header h1 { font-size: 1.75rem; margin: 0.25rem 0 0.5rem; }
.subtitle { font-size: 0.875rem; color: var(--ink-soft); margin: 0; }
.subtitle code { font-family: var(--font-mono); font-size: 0.8125rem; }
.loading, .empty { text-align: center; padding: 4rem; color: var(--ink-soft); font-style: italic; }
.bucket { margin-bottom: 1.5rem; }
.bucket.urgent { background: rgb(254 243 199 / 0.3); padding: 0.5rem 1rem 1rem; border-radius: 4px; }
.bucket header { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 0.75rem; }
.bucket h2 { font-size: 1rem; margin: 0; }
.count { font-size: 0.875rem; color: var(--ink-soft); font-family: var(--font-mono); }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.card { background: var(--paper); border: 1px solid var(--rule); padding: 0.75rem 1rem; border-radius: 4px; transition: border-color 0.15s, box-shadow 0.15s; }
.card:hover { border-color: var(--accent); box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.1); }
.num { font-family: var(--font-mono); font-size: 0.875rem; }
.detail { margin: 0.25rem 0 0; font-size: 0.75rem; color: var(--ink-soft); font-family: var(--font-mono); }
.back-nav { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--rule); }
.back-nav a { font-size: 0.875rem; color: var(--accent); text-decoration: none; }
.back-nav a:hover { text-decoration: underline; }
</style>
