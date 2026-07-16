<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  ontologyEntities,
  ontologyNamespaces,
  ontologyTypeMeta,
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

interface NamespaceEntry {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>
const allEntities = ontologyEntities as readonly Entity[]
const namespaces = ontologyNamespaces as readonly NamespaceEntry[]
const knownPrefixes = new Set(namespaces.map((n) => n.prefix))
const visibleEntities = computed(() => allEntities.filter((e) => knownPrefixes.has(e.ontology)))

const search = ref('')
const filterType = ref<string>('')
const filterNamespace = ref<string>('')
const activeSlug = ref<string>('')
const searchInputRef = ref<HTMLInputElement | null>(null)

// 3-accent palette — see TODO.onto/09
const namespaceColors: Record<string, { chip: string; chipActive: string; dot: string; border: string; headerAccent: string; bar: string }> = {
  brand: {
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    chipActive: 'bg-brand-600 text-white border-brand-600',
    dot: 'bg-brand-500',
    border: 'border-l-brand-400',
    headerAccent: 'text-brand-700 dark:text-brand-300',
    bar: 'from-brand-500/10 to-brand-500/0',
  },
  teal: {
    chip: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    chipActive: 'bg-teal-600 text-white border-teal-600',
    dot: 'bg-teal-500',
    border: 'border-l-teal-400',
    headerAccent: 'text-teal-700 dark:text-teal-300',
    bar: 'from-teal-500/10 to-teal-500/0',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    chipActive: 'bg-amber-600 text-white border-amber-600',
    dot: 'bg-amber-500',
    border: 'border-l-amber-400',
    headerAccent: 'text-amber-700 dark:text-amber-300',
    bar: 'from-amber-500/10 to-amber-500/0',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    chipActive: 'bg-slate-700 text-white border-slate-700',
    dot: 'bg-slate-400',
    border: 'border-l-slate-300',
    headerAccent: 'text-slate-700 dark:text-slate-300',
    bar: 'from-slate-500/10 to-slate-500/0',
  },
}

function nsColor(prefix: string) {
  const ns = namespaces.find((n) => n.prefix === prefix)
  return namespaceColors[ns?.color || 'slate'] || namespaceColors.slate
}

function shortLabel(title: string): string {
  return title.replace('Ontology', '').replace('Taxonomy', '').trim()
}

const typeOptions = computed(() => {
  const types = new Map<string, number>()
  for (const e of visibleEntities.value) {
    if (!typeMeta[e.type]) continue
    types.set(e.type, (types.get(e.type) || 0) + 1)
  }
  return [...types.entries()]
    .map(([type, count]) => ({ type, label: typeMeta[type]?.label || type, count }))
    .sort((a, b) => a.label.localeCompare(b.label))
})

const filtered = computed(() => {
  let list = visibleEntities.value
  if (filterNamespace.value) {
    list = list.filter((e) => e.ontology === filterNamespace.value || e.qname.startsWith(filterNamespace.value + ':'))
  }
  if (filterType.value) {
    list = list.filter((e) => e.type === filterType.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((e) =>
      e.label.toLowerCase().includes(q) ||
      e.qname.toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
    )
  }
  return list
})

const namespaceGroups = computed(() => {
  const groups: Array<{ ns: NamespaceEntry; entities: Entity[]; total: number }> = []
  for (const ns of namespaces) {
    const all = visibleEntities.value.filter((e) => e.ontology === ns.prefix || e.qname.startsWith(ns.prefix + ':'))
    const entities = filtered.value.filter((e) => e.ontology === ns.prefix || e.qname.startsWith(ns.prefix + ':'))
    if (entities.length > 0) groups.push({ ns, entities, total: all.length })
  }
  return groups
})

const totalVisible = computed(() => visibleEntities.value.length)
const visibleCount = computed(() => filtered.value.length)
const hasFilters = computed(() => !!(search.value || filterType.value || filterNamespace.value))

function resetFilters() {
  search.value = ''
  filterType.value = ''
  filterNamespace.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  // "/" focuses search
  if (e.key === '/' && document.activeElement !== searchInputRef.value) {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
  // ESC clears
  if (e.key === 'Escape' && document.activeElement === searchInputRef.value) {
    search.value = ''
    searchInputRef.value?.blur()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Mark active entity from URL
  const m = window.location.pathname.match(/\/ontology\/([^/]+)\/?$/)
  if (m) activeSlug.value = m[1]
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="max-w-[64rem] mx-auto px-6 py-10 bp-grid">
    <!-- ═══ HERO — calibration sheet header ═══ -->
    <div class="bp-crosshair relative bg-paper-soft border border-rule rounded-md p-6 mb-6">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <span class="bp-pulse" aria-hidden="true"></span>
          <span class="bp-coord">§ Semantic Layer</span>
          <span class="bp-coord opacity-50">·</span>
          <span class="bp-coord">{{ totalVisible }} entities indexed</span>
        </div>
        <span class="bp-tally">
          <span class="bp-tally__current">{{ String(visibleCount).padStart(3, '0') }}</span>
          <span class="bp-tally__sep">/</span>
          <span>{{ String(totalVisible).padStart(3, '0') }}</span>
        </span>
      </div>
      <h1 class="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.98] tracking-[-0.035em] mb-3 bp-reveal">
        Ontology <em class="italic font-normal text-accent">Browser</em>
      </h1>
      <p class="text-sm text-ink-soft leading-relaxed max-w-2xl mb-5">
        Machine-readable models for OIML Recommendations across
        <span class="font-medium text-teal-700 dark:text-teal-300">IEC-ISO SMART Core</span>,
        <span class="font-medium text-brand-700 dark:text-brand-300">OIML Core</span>, and
        <span class="font-medium text-amber-700 dark:text-amber-300">Publication Types</span>.
      </p>

      <!-- Search row -->
      <div class="flex flex-wrap gap-2 items-center mb-3">
        <div class="relative flex-1 min-w-[12rem]">
          <input
            ref="searchInputRef"
            v-model="search"
            type="search"
            placeholder="Search entities by name, qname, or definition…   ( press / )"
            class="w-full pl-9 pr-3 py-2 text-sm border border-rule rounded bg-paper text-ink focus:outline-none focus:border-accent bp-focus-ring"
            autocomplete="off"
            aria-label="Search ontology entities"
          />
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <kbd v-if="!search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 border border-rule rounded bg-paper text-ink-muted">/</kbd>
          <button v-else @click="search = ''" aria-label="Clear search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-accent">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <select
          v-model="filterType"
          class="px-3 py-2 text-sm border border-rule rounded bg-paper text-ink focus:outline-none focus:border-accent bp-focus-ring"
          aria-label="Filter by entity type"
        >
          <option value="">All types</option>
          <option v-for="t in typeOptions" :key="t.type" :value="t.type">{{ t.label }} ({{ t.count }})</option>
        </select>
      </div>

      <!-- Namespace filter chips -->
      <div class="flex flex-wrap gap-1.5 items-center">
        <button
          @click="filterNamespace = ''"
          :class="[
            'text-xs px-2.5 py-1 rounded-full border transition-all bp-focus-ring',
            filterNamespace === ''
              ? 'bg-ink text-paper border-ink'
              : 'bg-paper text-ink-soft border-rule hover:border-ink'
          ]"
        >All ({{ totalVisible }})</button>
        <button
          v-for="group in namespaceGroups"
          :key="group.ns.prefix"
          @click="filterNamespace = filterNamespace === group.ns.prefix ? '' : group.ns.prefix"
          :class="[
            'text-xs px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1.5 bp-focus-ring',
            filterNamespace === group.ns.prefix ? nsColor(group.ns.prefix).chipActive : nsColor(group.ns.prefix).chip
          ]"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="nsColor(group.ns.prefix).dot"></span>
          {{ shortLabel(group.ns.title) }}
          <span class="opacity-70">({{ group.entities.length }})</span>
        </button>
        <button v-if="hasFilters" @click="resetFilters" class="text-xs text-accent hover:underline ml-2">
          Reset ✕
        </button>
      </div>
    </div>

    <!-- Namespace groups -->
    <article
      v-for="(group, gi) in namespaceGroups"
      :key="group.ns.prefix"
      class="mb-10 bp-reveal"
      :style="`--reveal-delay: ${gi * 80}ms`"
    >
      <!-- Group header -->
      <header class="relative mb-4 pb-3 border-b border-rule">
        <div :class="`absolute -left-6 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b ${nsColor(group.ns.prefix).bar}`" aria-hidden="true"></div>
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <span class="w-2.5 h-2.5 rounded-full" :class="nsColor(group.ns.prefix).dot"></span>
          <h2 :class="['font-serif text-xl font-semibold', nsColor(group.ns.prefix).headerAccent]">
            {{ group.ns.title }}
          </h2>
          <code class="text-xs text-ink-muted font-mono">{{ group.ns.prefix }}:</code>
          <span class="bp-coord">v{{ group.ns.version }}</span>
          <span class="ml-auto bp-tally">
            <span class="bp-tally__current">{{ String(group.entities.length).padStart(3, '0') }}</span>
            <span class="bp-tally__sep">/</span>
            <span>{{ String(group.total).padStart(3, '0') }}</span>
          </span>
        </div>
        <p class="text-xs text-ink-muted leading-relaxed">{{ group.ns.description }}</p>
        <code class="text-[10px] text-ink-muted font-mono mt-1 block break-all opacity-70">{{ group.ns.uri }}</code>
      </header>

      <!-- Entity list -->
      <div class="flex flex-col gap-1 border-l-2 ml-1 pl-3" :class="nsColor(group.ns.prefix).border">
        <a
          v-for="(entity, ei) in group.entities"
          :key="entity.slug"
          :href="`/ontology/${entity.slug}`"
          :class="[
            'group relative flex items-start gap-3 p-3 border rounded transition-all bp-card-hover bp-crosshair no-decoration text-inherit',
            activeSlug === entity.slug
              ? 'border-accent bg-accent-soft'
              : 'border-rule bg-paper-soft hover:border-accent'
          ]"
        >
          <!-- Index numeration -->
          <span class="bp-coord pt-1 w-8 shrink-0 tabular-nums opacity-50 group-hover:opacity-100 transition-opacity">
            {{ String(ei + 1).padStart(3, '0') }}
          </span>
          <span
            class="shrink-0 text-[0.625rem] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
            :class="typeMeta[entity.type]?.color || 'bg-slate-100 text-slate-600'"
          >{{ typeMeta[entity.type]?.label || entity.type }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium group-hover:text-accent transition-colors">{{ entity.label }}</span>
              <code class="text-xs text-ink-muted font-mono">{{ entity.qname }}</code>
            </div>
            <p v-if="entity.description" class="text-xs text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">{{ entity.description }}</p>
          </div>
          <svg class="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>

    <div v-if="namespaceGroups.length === 0" class="text-center py-20 bp-grid">
      <div class="bp-crosshair inline-block p-8 bg-paper-soft border border-rule rounded">
        <p class="text-ink-muted italic">No entities match the current filters.</p>
        <button @click="resetFilters" class="text-accent text-sm mt-3 hover:underline">Reset filters</button>
      </div>
    </div>
  </div>
</template>
