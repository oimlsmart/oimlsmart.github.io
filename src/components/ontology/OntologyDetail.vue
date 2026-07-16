<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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

interface NamespaceEntry {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

const props = defineProps<{ slug: string }>()
const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>
const allEntities = ontologyEntities as readonly Entity[]
const namespaces = ontologyNamespaces as readonly NamespaceEntry[]
const knownPrefixes = new Set(namespaces.map((n) => n.prefix))

const copied = ref<string | null>(null)

const entity = computed<Entity | undefined>(() =>
  allEntities.find((e) => e.slug === props.slug && knownPrefixes.has(e.ontology))
)

const currentNamespace = computed(() => {
  if (!entity.value) return undefined
  return namespaces.find((n) => n.prefix === entity.value!.ontology)
})

const namespaceColors: Record<string, { chip: string; dot: string; accent: string; bar: string }> = {
  brand: {
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    dot: 'bg-brand-500',
    accent: 'text-brand-700 dark:text-brand-300',
    bar: 'from-brand-500/15 to-brand-500/0',
  },
  teal: {
    chip: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    dot: 'bg-teal-500',
    accent: 'text-teal-700 dark:text-teal-300',
    bar: 'from-teal-500/15 to-teal-500/0',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    dot: 'bg-amber-500',
    accent: 'text-amber-700 dark:text-amber-300',
    bar: 'from-amber-500/15 to-amber-500/0',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    accent: 'text-slate-700 dark:text-slate-300',
    bar: 'from-slate-500/15 to-slate-500/0',
  },
}

const nsColor = computed(() => {
  const colorName = currentNamespace.value?.color || 'slate'
  return namespaceColors[colorName] || namespaceColors.slate
})

function findByQname(qname: string): Entity | undefined {
  return allEntities.find((e) => e.qname === qname)
}

function linkTo(qname: string): string {
  const e = findByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

const parentEntity = computed(() =>
  entity.value?.parent ? findByQname(entity.value.parent) : undefined
)

const children = computed(() =>
  entity.value ? allEntities.filter((e) => e.parent === entity.value!.qname && knownPrefixes.has(e.ontology)) : []
)

const siblings = computed(() => {
  if (!entity.value?.parent) return []
  return allEntities.filter(
    (e) => e.parent === entity.value!.parent && e.qname !== entity.value!.qname && knownPrefixes.has(e.ontology)
  ).slice(0, 8)
})

const relatedBySeeAlso = computed(() =>
  entity.value?.seeAlso?.map((q) => findByQname(q)).filter((e): e is Entity => Boolean(e)) || []
)

async function copyToClipboard(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => {
      if (copied.value === key) copied.value = null
    }, 1800)
  } catch {
    // ignore
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div v-if="entity" class="max-w-[48rem] mx-auto px-6 py-8 bp-grid">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm flex-wrap">
      <a href="/ontology/" class="bp-link-draw">← Ontology Browser</a>
      <span v-if="currentNamespace" class="text-ink-muted opacity-50">/</span>
      <span v-if="currentNamespace" :class="nsColor.accent" class="font-medium flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full" :class="nsColor.dot"></span>
        {{ currentNamespace.title }}
      </span>
    </nav>

    <!-- Header card -->
    <header class="bp-crosshair relative bg-paper-soft border border-rule rounded-md p-6 mb-6 overflow-hidden">
      <div :class="`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${nsColor.bar}`" aria-hidden="true"></div>
      <div class="flex items-start gap-2 mb-2 flex-wrap pt-1">
        <span
          class="shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
          :class="typeMeta[entity.type]?.color || 'bg-slate-100 text-slate-600'"
        >{{ typeMeta[entity.type]?.label || entity.type }}</span>
        <span
          v-if="currentNamespace"
          :class="['shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1', nsColor.chip]"
        >
          <span class="w-1 h-1 rounded-full" :class="nsColor.dot"></span>
          {{ entity.ontology }}
        </span>
        <span class="ml-auto bp-coord">§ entity</span>
      </div>
      <h1 class="font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.02em] mb-2">
        {{ entity.label }}
      </h1>
      <div class="flex items-center gap-3 flex-wrap">
        <code class="text-sm text-ink-muted font-mono">{{ entity.qname }}</code>
        <span v-if="entity.altLabel" class="bp-chip">alt: {{ entity.altLabel }}</span>
      </div>
    </header>

    <!-- Definition -->
    <section v-if="entity.description" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-2">
        <span class="bp-section-anchor__num">§ 01</span>
        <span>Definition</span>
      </h2>
      <p class="text-[0.9375rem] text-ink-soft leading-relaxed">{{ entity.description }}</p>
    </section>

    <!-- Scope note -->
    <section v-if="entity.scopeNote" class="mb-6 bp-reveal bp-annotation">
      <span class="bp-annotation__label">Scope Note</span>
      {{ entity.scopeNote }}
    </section>

    <!-- Properties -->
    <section v-if="entity.domain || entity.range" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 02</span>
        <span>Property Characteristics</span>
      </h2>
      <div class="grid grid-cols-2 gap-4">
        <div v-if="entity.domain">
          <h3 class="bp-coord mb-2">Domain</h3>
          <div class="flex flex-wrap gap-2">
            <a v-for="d in entity.domain" :key="d" :href="linkTo(d)" class="bp-link-draw font-mono text-sm">
              <code>{{ d }}</code>
            </a>
          </div>
        </div>
        <div v-if="entity.range">
          <h3 class="bp-coord mb-2">Range</h3>
          <div class="flex flex-wrap gap-2">
            <a v-for="r in entity.range" :key="r" :href="linkTo(r)" class="bp-link-draw font-mono text-sm">
              <code>{{ r }}</code>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Hierarchy -->
    <section v-if="parentEntity || children.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 03</span>
        <span>Hierarchy</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord" v-if="children.length">{{ children.length }} direct subordinates</span>
      </h2>
      <div v-if="parentEntity" class="mb-3 pb-3 border-b border-rule">
        <span class="bp-coord block mb-1">Parent</span>
        <a :href="`/ontology/${parentEntity.slug}`" class="bp-card-hover inline-flex items-center gap-2 px-3 py-2 border border-rule rounded bg-paper group">
          <span class="text-accent">↑</span>
          <span class="font-medium text-sm group-hover:text-accent transition-colors">{{ parentEntity.label }}</span>
          <code class="text-xs text-ink-muted font-mono">{{ parentEntity.qname }}</code>
        </a>
      </div>
      <div v-if="children.length">
        <span class="bp-coord block mb-2">Direct subordinates</span>
        <ul class="space-y-1 ml-1">
          <li v-for="child in children" :key="child.slug">
            <a :href="`/ontology/${child.slug}`" class="bp-card-hover group inline-flex items-center gap-2 px-3 py-1.5 border border-rule rounded bg-paper w-full">
              <span class="text-ink-muted">└</span>
              <span class="text-sm font-medium group-hover:text-accent transition-colors">{{ child.label }}</span>
              <code class="text-xs text-ink-muted font-mono ml-auto">{{ child.qname }}</code>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <!-- Siblings -->
    <section v-if="siblings.length" class="mb-6 bp-reveal">
      <span class="bp-coord block mb-2">Sibling entities ({{ siblings.length }}+)</span>
      <div class="flex flex-wrap gap-1.5">
        <a v-for="sib in siblings" :key="sib.slug" :href="`/ontology/${sib.slug}`"
          class="bp-chip bp-card-hover hover:border-accent hover:text-accent">
          {{ sib.qname }}
        </a>
      </div>
    </section>

    <!-- See also -->
    <section v-if="relatedBySeeAlso.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 04</span>
        <span>See Also</span>
      </h2>
      <div class="grid grid-cols-1 gap-2">
        <a v-for="rel in relatedBySeeAlso" :key="rel.slug" :href="`/ontology/${rel.slug}`"
           class="bp-card-hover inline-flex items-center gap-3 px-3 py-2 border border-rule rounded text-sm text-ink-soft hover:border-accent hover:text-accent group">
          <span
            class="shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            :class="typeMeta[rel.type]?.color"
          >{{ typeMeta[rel.type]?.label }}</span>
          <span class="font-medium group-hover:text-accent transition-colors flex-1">{{ rel.label }}</span>
          <code class="text-xs text-ink-muted font-mono">{{ rel.qname }}</code>
          <span class="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">→</span>
        </a>
      </div>
    </section>

    <!-- Namespace card -->
    <section v-if="currentNamespace" class="mt-8 pt-6 border-t-2 border-dashed border-rule bp-reveal">
      <div class="flex items-start gap-3">
        <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="nsColor.dot"></span>
        <div class="flex-1 min-w-0">
          <span class="bp-coord block mb-1">Member of</span>
          <div :class="nsColor.accent" class="font-serif text-lg font-semibold mb-1">{{ currentNamespace.title }}</div>
          <div class="bp-uri" :data-copy="currentNamespace.uri">
            <code>{{ currentNamespace.uri }}</code>
          </div>
          <p class="text-xs text-ink-muted mt-2">v{{ currentNamespace.version }}</p>
        </div>
      </div>
    </section>

    <!-- URI -->
    <section class="mt-6 pt-4 border-t border-rule">
      <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 class="bp-coord">URI</h2>
        <button @click="copyToClipboard(entity.uri, 'uri')" class="bp-chip hover:border-accent hover:text-accent bp-card-hover" :aria-label="copied === 'uri' ? 'Copied' : 'Copy URI'">
          <span v-if="copied === 'uri'">✓ Copied</span>
          <span v-else>Copy</span>
        </button>
      </div>
      <div class="bp-uri" :data-copy="entity.uri">
        <code>{{ entity.uri }}</code>
      </div>
    </section>
  </div>

  <div v-else class="max-w-[48rem] mx-auto px-6 py-20 text-center bp-grid">
    <div class="bp-crosshair inline-block p-10 bg-paper-soft border border-rule rounded-md">
      <p class="font-serif text-2xl italic text-ink-muted mb-2">Entity not found.</p>
      <p class="text-sm text-ink-muted mb-4">No public entity with slug <code class="font-mono">{{ slug }}</code>.</p>
      <a href="/ontology/" class="btn btn-ghost bp-magnetic bp-focus-ring">← Back to Browser</a>
    </div>
  </div>
</template>
