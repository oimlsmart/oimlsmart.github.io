<script setup lang="ts">
import { computed } from 'vue'
import {
  ontologyEntities,
  ontologyTypeMeta,
  ontologyNamespaces,
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
  properties?: Record<string, string[]>
  reference?: string
}

const props = defineProps<{ slug: string }>()
const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>
const allEntities = ontologyEntities as readonly Entity[]

const entity = computed<Entity | undefined>(() =>
  allEntities.find(e => e.slug === props.slug)
)

function findByQname(qname: string): Entity | undefined {
  return allEntities.find(e => e.qname === qname)
}

function linkTo(qname: string): string {
  const e = findByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

const parentEntity = computed(() =>
  entity.value?.parent ? findByQname(entity.value.parent) : undefined
)

const children = computed(() =>
  entity.value ? allEntities.filter(e => e.parent === entity.value!.qname) : []
)

const relatedBySeeAlso = computed(() =>
  entity.value?.seeAlso?.map(q => findByQname(q)).filter(Boolean) as Entity[] || []
)
</script>

<template>
  <div v-if="entity" class="max-w-[48rem] mx-auto px-6 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-6">
      <a href="/ontology/" class="text-sm text-accent hover:underline">← Ontology Browser</a>
    </nav>

    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="font-serif text-2xl font-semibold">{{ entity.label }}</h1>
        <span
          class="shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
          :class="typeMeta[entity.type]?.color || 'bg-slate-100 text-slate-600'"
        >{{ typeMeta[entity.type]?.label || entity.type }}</span>
      </div>
      <code class="text-sm text-ink-muted font-mono">{{ entity.qname }}</code>
      <p v-if="entity.altLabel" class="text-sm text-ink-muted mt-1">Alt: {{ entity.altLabel }}</p>
    </div>

    <!-- Description -->
    <div v-if="entity.description" class="mb-6">
      <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">Description</h2>
      <p class="text-sm text-ink-soft leading-relaxed">{{ entity.description }}</p>
    </div>

    <!-- Scope note -->
    <div v-if="entity.scopeNote" class="mb-6">
      <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">Scope Note</h2>
      <p class="text-sm text-ink-soft leading-relaxed">{{ entity.scopeNote }}</p>
    </div>

    <!-- Properties -->
    <div v-if="entity.domain || entity.range" class="mb-6 grid grid-cols-2 gap-4">
      <div v-if="entity.domain">
        <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">Domain</h2>
        <div class="flex flex-wrap gap-2">
          <a v-for="d in entity.domain" :key="d" :href="linkTo(d)" class="text-sm text-accent hover:underline">
            <code class="font-mono">{{ d }}</code>
          </a>
        </div>
      </div>
      <div v-if="entity.range">
        <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">Range</h2>
        <div class="flex flex-wrap gap-2">
          <a v-for="r in entity.range" :key="r" :href="linkTo(r)" class="text-sm text-accent hover:underline">
            <code class="font-mono">{{ r }}</code>
          </a>
        </div>
      </div>
    </div>

    <!-- Hierarchy -->
    <div v-if="parentEntity || children.length" class="mb-6">
      <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">Hierarchy</h2>
      <div v-if="parentEntity" class="mb-2">
        <span class="text-xs text-ink-muted">Parent: </span>
        <a :href="`/ontology/${parentEntity.slug}`" class="text-sm text-accent hover:underline">{{ parentEntity.label }}</a>
      </div>
      <div v-if="children.length">
        <span class="text-xs text-ink-muted">Subordinates ({{ children.length }}):</span>
        <ul class="mt-1 ml-4">
          <li v-for="child in children" :key="child.slug">
            <a :href="`/ontology/${child.slug}`" class="text-sm text-accent hover:underline">{{ child.label }}</a>
            <code class="text-xs text-ink-muted ml-1 font-mono">{{ child.qname }}</code>
          </li>
        </ul>
      </div>
    </div>

    <!-- See also -->
    <div v-if="relatedBySeeAlso.length" class="mb-6">
      <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">See Also</h2>
      <div class="flex flex-wrap gap-3">
        <a v-for="rel in relatedBySeeAlso" :key="rel.slug" :href="`/ontology/${rel.slug}`"
           class="inline-flex items-center gap-2 px-3 py-1.5 border border-rule rounded text-sm text-ink-soft hover:border-accent hover:text-accent transition-colors">
          {{ rel.label }}
          <span class="text-[0.5625rem] font-mono uppercase px-1 py-0.5 rounded-sm"
                :class="typeMeta[rel.type]?.color">{{ typeMeta[rel.type]?.label }}</span>
        </a>
      </div>
    </div>

    <!-- URI -->
    <div class="mt-8 pt-4 border-t border-rule">
      <h2 class="text-xs font-mono uppercase tracking-wider text-ink-muted mb-1">URI</h2>
      <code class="text-xs text-ink-muted font-mono break-all">{{ entity.uri }}</code>
    </div>
  </div>

  <div v-else class="max-w-[48rem] mx-auto px-6 py-16 text-center">
    <p class="text-ink-muted italic">Entity not found.</p>
    <a href="/ontology/" class="text-accent text-sm mt-4 inline-block">← Back to Ontology Browser</a>
  </div>
</template>
