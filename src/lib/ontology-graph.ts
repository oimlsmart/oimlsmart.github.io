// ── Ontology Graph Traversal ─────────────────────────────────────────
// Pure functions for walking the ontology entity graph. Extracted from
// OntologyDetail.vue's inline computed properties so they can be tested
// with fixture data independently of Vue.

import type { OntologyEntity } from '../data/ontology-domain'
import { knownPrefixes } from '../data/ontology-domain'

export interface WhereUsedEntry {
  entity: OntologyEntity
  context: 'subClassOf' | 'domain' | 'range' | 'inScheme' | 'type'
}

function isVisible(e: OntologyEntity): boolean {
  return knownPrefixes.has(e.ontology)
}

/** Walk parent chain upward, root-first. */
export function ancestors(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  const chain: OntologyEntity[] = []
  const seen = new Set<string>()
  let cur: OntologyEntity | undefined = entity
  while (cur?.parent && !seen.has(cur.qname)) {
    seen.add(cur.qname)
    const parent = all.find((e) => e.qname === cur!.parent)
    if (!parent) break
    chain.unshift(parent)
    cur = parent
  }
  return chain
}

/** BFS transitive closure of children. */
export function descendants(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  const result: OntologyEntity[] = []
  const queue: string[] = [entity.qname]
  const seen = new Set<string>([entity.qname])
  while (queue.length) {
    const qn = queue.shift()!
    for (const e of all) {
      if (e.parent === qn && isVisible(e) && !seen.has(e.qname)) {
        seen.add(e.qname)
        result.push(e)
        queue.push(e.qname)
      }
    }
  }
  return result
}

/** Direct children (one level). */
export function children(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  return all.filter((e) => e.parent === entity.qname && isVisible(e))
}

/** Siblings sharing the same parent (excludes self, capped at 8). */
export function siblings(entity: OntologyEntity, all: readonly OntologyEntity[], limit = 8): OntologyEntity[] {
  if (!entity.parent) return []
  return all
    .filter((e) => e.parent === entity.parent && e.qname !== entity.qname && isVisible(e))
    .slice(0, limit)
}

/** Properties whose domain includes this class. */
export function propertiesOfClass(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  if (entity.type !== 'class') return []
  const qn = entity.qname
  return all.filter(
    (e) =>
      (e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty') &&
      e.domain?.includes(qn) &&
      isVisible(e)
  )
}

/** Properties whose domain includes an ancestor but NOT this class itself. */
export function inheritedProperties(
  entity: OntologyEntity,
  all: readonly OntologyEntity[]
): OntologyEntity[] {
  if (entity.type !== 'class') return []
  const ancestorQnames = ancestors(entity, all).map((a) => a.qname)
  const ownDomain = new Set(propertiesOfClass(entity, all).map((p) => p.qname))
  return all.filter((e) => {
    if (e.type !== 'objectProperty' && e.type !== 'datatypeProperty' && e.type !== 'annotationProperty') return false
    if (!isVisible(e)) return false
    if (ownDomain.has(e.qname)) return false
    return e.domain?.some((d) => ancestorQnames.includes(d))
  })
}

/** Individuals whose instanceOf includes this class or any descendant. */
export function instancesOf(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  if (entity.type !== 'class') return []
  const targetQnames = new Set<string>([entity.qname, ...descendants(entity, all).map((e) => e.qname)])
  return all.filter(
    (e) => e.type === 'individual' && isVisible(e) && e.instanceOf?.some((t) => targetQnames.has(t))
  )
}

/** Back-references: who points at this entity? */
export function whereUsed(entity: OntologyEntity, all: readonly OntologyEntity[]): WhereUsedEntry[] {
  const qn = entity.qname
  const results: WhereUsedEntry[] = []
  for (const e of all) {
    if (e.qname === qn || !isVisible(e)) continue
    if (e.parent === qn) results.push({ entity: e, context: 'subClassOf' })
    if (e.domain?.includes(qn)) results.push({ entity: e, context: 'domain' })
    if (e.range?.includes(qn)) results.push({ entity: e, context: 'range' })
    if (e.scheme === qn) results.push({ entity: e, context: 'inScheme' })
    if (e.instanceOf?.includes(qn)) results.push({ entity: e, context: 'type' })
  }
  return results
}

/** Resolve seeAlso qnames to Entity objects. */
export function relatedBySeeAlso(entity: OntologyEntity, all: readonly OntologyEntity[]): OntologyEntity[] {
  return (entity.seeAlso || [])
    .map((q) => all.find((e) => e.qname === q))
    .filter((e): e is OntologyEntity => Boolean(e) && isVisible(e!))
}
