// ── Ontology Domain Module ───────────────────────────────────────────
// The deep module for the ontology subsystem. Consolidates types,
// filtering, grouping, visual palette, and type ordering that were
// previously triple-duplicated across OntologyBrowser.vue,
// OntologyDetail.vue, and OntologyLayout.astro.
//
// Consumers import from here — never touch the raw arrays in
// ontology-data.ts directly.

import {
  ontologyEntities,
  ontologyNamespaces,
  ontologyTypeMeta,
} from './ontology-data'

// Re-export so consumers don't need to import from the raw data file.
export { ontologyTypeMeta }

// ── Types ────────────────────────────────────────────────────────────

export interface OntologyEntity {
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
  reference?: string
  properties?: Record<string, string[]>
  version?: string
  imports?: string[]
}

export interface NamespaceEntry {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

// ── Computed views ───────────────────────────────────────────────────

export const namespaces = ontologyNamespaces as readonly NamespaceEntry[]

export const knownPrefixes = new Set(namespaces.map((n) => n.prefix))

export const allEntities = ontologyEntities as readonly OntologyEntity[]

export const visibleEntities = allEntities.filter((e) =>
  knownPrefixes.has(e.ontology)
)

const _entityByQname = new Map(visibleEntities.map((e) => [e.qname, e]))
export function entityByQname(qname: string): OntologyEntity | undefined {
  return _entityByQname.get(qname)
}

const _entityBySlug = new Map(visibleEntities.map((e) => [e.slug, e]))
export function entityBySlug(slug: string): OntologyEntity | undefined {
  return _entityBySlug.get(slug)
}

export function linkTo(qname: string): string {
  const e = entityByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

// ── Visual palette ───────────────────────────────────────────────────

export interface NamespacePalette {
  chip: string
  chipActive: string
  dot: string
  border: string
  accent: string
  bar: string
}

const paletteByColorName: Record<string, NamespacePalette> = {
  brand: {
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    chipActive: 'bg-brand-600 text-white border-brand-600',
    dot: 'bg-brand-500',
    border: 'border-l-brand-400',
    accent: 'text-brand-700 dark:text-brand-300',
    bar: 'from-brand-500/15',
  },
  teal: {
    chip: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    chipActive: 'bg-teal-600 text-white border-teal-600',
    dot: 'bg-teal-500',
    border: 'border-l-teal-400',
    accent: 'text-teal-700 dark:text-teal-300',
    bar: 'from-teal-500/15',
  },
  amber: {
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    chipActive: 'bg-amber-600 text-white border-amber-600',
    dot: 'bg-amber-500',
    border: 'border-l-amber-400',
    accent: 'text-amber-700 dark:text-amber-300',
    bar: 'from-amber-500/15',
  },
  slate: {
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    chipActive: 'bg-slate-700 text-white border-slate-700',
    dot: 'bg-slate-400',
    border: 'border-l-slate-300',
    accent: 'text-slate-700 dark:text-slate-300',
    bar: 'from-slate-500/15',
  },
}

// Dot-only maps keyed by ontology prefix (for sidebar/list usage).
export const nsDot: Record<string, string> = {
  smart: paletteByColorName.teal.dot,
  oiml: paletteByColorName.brand.dot,
  'oiml-pubtype': paletteByColorName.amber.dot,
  external: paletteByColorName.slate.dot,
}

export const nsAccent: Record<string, string> = {
  smart: paletteByColorName.teal.accent,
  oiml: paletteByColorName.brand.accent,
  'oiml-pubtype': paletteByColorName.amber.accent,
}

export function paletteForNamespace(prefix: string): NamespacePalette {
  const ns = namespaces.find((n) => n.prefix === prefix)
  return paletteByColorName[ns?.color || 'slate'] || paletteByColorName.slate
}

// ── Type ordering & helpers ──────────────────────────────────────────

export const TYPE_ORDER = [
  'class',
  'objectProperty',
  'datatypeProperty',
  'annotationProperty',
  'shape',
  'conceptScheme',
  'concept',
  'individual',
  'ontology',
] as const

const PROPERTY_TYPES = new Set(['objectProperty', 'datatypeProperty', 'annotationProperty'])

export function isPropertyType(type: string): boolean {
  return PROPERTY_TYPES.has(type)
}

export function typeLabel(type: string): string {
  return (ontologyTypeMeta as Record<string, { label: string }>)[type]?.label || type
}

export function typeColorClass(type: string): string {
  return (ontologyTypeMeta as Record<string, { color: string }>)[type]?.color || 'bg-slate-100 text-slate-600'
}

export function shortLabel(title: string): string {
  return title.replace('Ontology', '').replace('Taxonomy', '').trim()
}

export function localName(qname: string, fallback?: string): string {
  const local = qname.split(':').slice(1).join(':')
  return local || fallback || qname
}
