<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ontologyEntities,
  ontologyNamespaces,
  ontologyTypeMeta,
  ontologyPrefixes,
  ontologyImportChain,
} from '../../data/ontology-data'

interface Entity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  scopeNote?: string
  altLabel?: string
  seeAlso?: string[]
  parent?: string
  domain?: string[]
  range?: string[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
}

const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>
const allEntities = ontologyEntities as readonly Entity[]
const search = ref('')
const filterType = ref<string>('')

const typeOptions = computed(() => {
  const types = new Map<string, string>()
  for (const e of allEntities) {
    if (typeMeta[e.type]) {
      types.set(e.type, typeMeta[e.type].label)
    }
  }
  return [...types.entries()].sort((a, b) => a[1].localeCompare(b[1]))
})

const filtered = computed(() => {
  let list = allEntities
  if (filterType.value) {
    list = list.filter(e => e.type === filterType.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(e =>
      e.label.toLowerCase().includes(q) ||
      e.qname.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    )
  }
  return list
})

const namespaceGroups = computed(() => {
  const groups = new Map<string, { prefix: string; title: string; description: string; entities: Entity[] }>()
  for (const ns of ontologyNamespaces) {
    const entities = filtered.value.filter(e => e.ontology === ns.prefix || e.qname.startsWith(ns.prefix + ':'))
    if (entities.length > 0) {
      groups.set(ns.prefix, {
        prefix: ns.prefix,
        title: ns.title,
        description: ns.description,
        entities,
      })
    }
  }
  return [...groups.values()]
})
</script>

<template>
  <div class="max-w-[48rem] mx-auto px-6 py-8">
    <h1 class="font-serif text-2xl font-semibold mb-2">Ontology Browser</h1>
    <p class="text-sm text-ink-soft mb-6">Browse the OIML semantic ontology — classes, properties, individuals, and concept schemes that define the machine-readable model for OIML Recommendations.</p>

    <!-- Search + filter -->
    <div class="flex gap-3 mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search entities..."
        class="flex-1 px-3 py-2 text-sm border border-rule rounded bg-paper-soft text-ink focus:outline-none focus:border-accent"
      />
      <select
        v-model="filterType"
        class="px-3 py-2 text-sm border border-rule rounded bg-paper-soft text-ink focus:outline-none focus:border-accent"
      >
        <option value="">All types</option>
        <option v-for="[value, label] in typeOptions" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>

    <!-- Namespace groups -->
    <div v-for="group in namespaceGroups" :key="group.prefix" class="mb-8">
      <div class="mb-3">
        <h2 class="font-serif text-lg font-semibold">{{ group.title }}</h2>
        <p class="text-xs text-ink-muted mt-1">{{ group.description }}</p>
        <code class="text-xs text-ink-muted font-mono">{{ group.prefix }}:</code>
        <span class="text-xs text-ink-muted ml-2">{{ group.entities.length }} entities</span>
      </div>

      <!-- Entity list -->
      <div class="flex flex-col gap-1">
        <a
          v-for="entity in group.entities"
          :key="entity.slug"
          :href="`/ontology/${entity.slug}`"
          class="flex items-start gap-3 p-3 border border-rule rounded no-decoration hover:border-accent transition-colors text-inherit"
        >
          <span
            class="shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            :class="typeMeta[entity.type]?.color || 'bg-slate-100 text-slate-600'"
          >{{ typeMeta[entity.type]?.label || entity.type }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ entity.label }}</span>
              <code class="text-xs text-ink-muted font-mono">{{ entity.qname }}</code>
            </div>
            <p v-if="entity.description" class="text-xs text-ink-muted mt-0.5 line-clamp-2">{{ entity.description }}</p>
          </div>
        </a>
      </div>
    </div>

    <p v-if="filtered.length === 0" class="text-center py-12 text-ink-muted italic">No entities found.</p>
  </div>
</template>
