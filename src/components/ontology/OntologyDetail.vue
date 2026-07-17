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

// All descendants (transitive closure of children)
const allDescendants = computed(() => {
  if (!entity.value) return []
  const start = entity.value.qname
  const result: Entity[] = []
  const queue: string[] = [start]
  const seen = new Set<string>([start])
  while (queue.length) {
    const qn = queue.shift()!
    for (const e of allEntities) {
      if (e.parent === qn && knownPrefixes.has(e.ontology) && !seen.has(e.qname)) {
        seen.add(e.qname)
        result.push(e)
        queue.push(e.qname)
      }
    }
  }
  return result
})

// Ancestor chain (root → immediate parent)
const ancestors = computed(() => {
  if (!entity.value) return []
  const chain: Entity[] = []
  let cur: Entity | undefined = entity.value
  const seen = new Set<string>()
  while (cur?.parent && !seen.has(cur.qname)) {
    seen.add(cur.qname)
    const parent = findByQname(cur.parent)
    if (!parent) break
    chain.unshift(parent)
    cur = parent
  }
  return chain
})

// For a CLASS: properties where this class is in the domain
const propertiesOfThisClass = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  const qn = entity.value.qname
  return allEntities.filter(
    (e) =>
      (e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty') &&
      e.domain?.includes(qn) &&
      knownPrefixes.has(e.ontology)
  )
})

// Properties inherited from ancestor classes
const inheritedProperties = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  const ancestorQnames = ancestors.value.map((a) => a.qname)
  return allEntities.filter(
    (e) => {
      if (e.type !== 'objectProperty' && e.type !== 'datatypeProperty' && e.type !== 'annotationProperty') return false
      if (!knownPrefixes.has(e.ontology)) return false
      // Domain includes some ancestor AND not already in propertiesOfThisClass
      const inSelf = e.domain?.includes(entity.value!.qname)
      if (inSelf) return false
      return e.domain?.some((d) => ancestorQnames.includes(d))
    }
  )
})

// For a CLASS: individuals that are instanceOf this class (or any descendant)
const instancesOfClass = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  const targetQnames = new Set<string>([entity.value.qname, ...allDescendants.value.map((e) => e.qname)])
  return allEntities.filter(
    (e) => e.type === 'individual' &&
      knownPrefixes.has(e.ontology) &&
      e.instanceOf?.some((t) => targetQnames.has(t))
  )
})

// For any entity: where used (back-references)
const whereUsed = computed(() => {
  if (!entity.value) return []
  const qn = entity.value.qname
  const results: Array<{ entity: Entity; context: string }> = []
  for (const e of allEntities) {
    if (e.qname === qn || !knownPrefixes.has(e.ontology)) continue
    if (e.parent === qn) results.push({ entity: e, context: 'subClassOf' })
    if (e.domain?.includes(qn)) results.push({ entity: e, context: 'domain' })
    if (e.range?.includes(qn)) results.push({ entity: e, context: 'range' })
    if (e.scheme === qn) results.push({ entity: e, context: 'inScheme' })
    if (e.instanceOf?.includes(qn)) results.push({ entity: e, context: 'type' })
  }
  return results
})

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
  <div v-if="entity" class="max-w-[48rem] mx-auto px-6 pb-8 bp-grid">
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

    <!-- Properties of this class (Ontospy-style) -->
    <section v-if="propertiesOfThisClass.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 04</span>
        <span>Properties of this class</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord">{{ propertiesOfThisClass.length }} direct</span>
      </h2>
      <div class="overflow-x-auto rounded-md border border-rule">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-paper border-b border-rule">
              <th class="text-left px-3 py-1.5 font-semibold text-ink-muted">Property</th>
              <th class="text-left px-3 py-1.5 font-semibold text-ink-muted">Type</th>
              <th class="text-left px-3 py-1.5 font-semibold text-ink-muted">Range</th>
              <th class="text-left px-3 py-1.5 font-semibold text-ink-muted">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in propertiesOfThisClass" :key="p.qname" class="border-b border-rule last:border-0">
              <td class="px-3 py-1.5"><a :href="`/ontology/${p.slug}`" class="text-accent hover:underline font-medium font-mono">{{ p.qname }}</a></td>
              <td class="px-3 py-1.5">
                <span class="bp-chip">{{ typeMeta[p.type]?.label || p.type }}</span>
              </td>
              <td class="px-3 py-1.5 text-ink-muted font-mono text-[10px]">
                <template v-if="p.range?.length">
                  <a v-for="r, i in p.range" :key="r" :href="linkTo(r) || '#'" class="text-ink-soft hover:text-accent">{{ r }}<span v-if="i < p.range.length - 1">, </span></a>
                </template>
                <span v-else>—</span>
              </td>
              <td class="px-3 py-1.5 text-ink-muted truncate max-w-xs">{{ p.description || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Inherited properties -->
    <section v-if="inheritedProperties.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 05</span>
        <span>Inherited properties</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord">{{ inheritedProperties.length }} from {{ ancestors.length }} ancestor{{ ancestors.length > 1 ? 's' : '' }}</span>
      </h2>
      <p class="text-xs text-ink-muted mb-3">Properties whose domain is an ancestor class — instances of <code class="font-mono text-accent">{{ entity.qname }}</code> inherit these.</p>
      <div class="flex flex-wrap gap-1.5">
        <a v-for="p in inheritedProperties" :key="p.qname" :href="`/ontology/${p.slug}`"
           class="bp-chip bp-card-hover hover:border-accent hover:text-accent inline-flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full bg-ink-muted"></span>
          {{ p.qname }}
        </a>
      </div>
    </section>

    <!-- All descendants -->
    <section v-if="allDescendants.length > children.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 06</span>
        <span>All descendants</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord">{{ allDescendants.length }} transitive</span>
      </h2>
      <div class="flex flex-wrap gap-1.5">
        <a v-for="d in allDescendants" :key="d.qname" :href="`/ontology/${d.slug}`"
           class="bp-chip bp-card-hover hover:border-accent hover:text-accent">{{ d.qname }}</a>
      </div>
    </section>

    <!-- Instances -->
    <section v-if="instancesOfClass.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 07</span>
        <span>Instances</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord">{{ instancesOfClass.length }} individuals</span>
      </h2>
      <div class="flex flex-wrap gap-1.5">
        <a v-for="inst in instancesOfClass" :key="inst.qname" :href="`/ontology/${inst.slug}`"
           class="bp-chip bp-card-hover hover:border-accent hover:text-accent inline-flex items-center gap-1.5">
          <span class="w-1 h-1 rounded-full bg-amber-500"></span>
          {{ inst.label }}
        </a>
      </div>
    </section>

    <!-- Where used (back-references) -->
    <section v-if="whereUsed.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 08</span>
        <span>Where used</span>
        <span class="bp-section-anchor__line"></span>
        <span class="bp-coord">{{ whereUsed.length }} references</span>
      </h2>
      <ul class="space-y-1 text-xs">
        <li v-for="wu in whereUsed.slice(0, 16)" :key="`${wu.entity.qname}-${wu.context}`">
          <a :href="`/ontology/${wu.entity.slug}`" class="text-accent hover:underline font-mono">{{ wu.entity.qname }}</a>
          <span class="text-ink-muted ml-2">via {{ wu.context }}</span>
        </li>
      </ul>
      <p v-if="whereUsed.length > 16" class="text-[10px] text-ink-muted mt-2">+ {{ whereUsed.length - 16 }} more</p>
    </section>

    <!-- See also -->
    <section v-if="relatedBySeeAlso.length" class="mb-6 bp-reveal bp-crosshair bg-paper-soft border border-rule rounded-md p-5">
      <h2 class="bp-section-anchor mb-3">
        <span class="bp-section-anchor__num">§ 09</span>
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
          <div class="bp-uri">
            <code>{{ currentNamespace.uri }}</code>
            <button @click="copyToClipboard(currentNamespace.uri, 'ns-uri')" class="bp-uri__copy" :aria-label="copied === 'ns-uri' ? 'Copied' : 'Copy namespace URI'">
              <span v-if="copied === 'ns-uri'">✓</span>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
            </button>
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
      <div class="bp-uri">
        <code>{{ entity.uri }}</code>
        <button @click="copyToClipboard(entity.uri, 'uri')" class="bp-uri__copy" :aria-label="copied === 'uri' ? 'Copied' : 'Copy URI'">
          <span v-if="copied === 'uri'">✓</span>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
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
