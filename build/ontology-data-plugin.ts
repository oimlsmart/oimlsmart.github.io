// Vite plugin: reads source TTL files from public/ontologies/*.ttl and
// emits a typed TypeScript module at src/data/generated/ontology.ts.
//
// Adapted from mn/isq-smart/browser/build/ontology-data-plugin.ts.

import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { Parser, Store } from 'n3'
import {
  extractPrefixes,
  createCompactor,
  classifyEntities,
  collectReferencedQnames,
  generateExternalStubs,
  buildTypeMeta,
  buildImportChain,
  buildOntologyNamespaces,
} from './ontology-extract'

export interface OntologyPluginOptions {
  ontologySrcDir: string
  generatedDir: string
  hiddenPrefixes?: readonly string[]
}

export function ontologyDataPlugin(options: OntologyPluginOptions): Plugin {
  const { ontologySrcDir: ontoDir, generatedDir: genDir, hiddenPrefixes = [] } = options
  const hiddenSet = new Set(hiddenPrefixes)

  function generateOntologyData() {
    const hiddenFiles = new Set(hiddenPrefixes.map((p) => `${p}.ttl`))
    const allTtlFiles = readdirSync(ontoDir).filter((f) => f.endsWith('.ttl')).sort()

    const visibleTtlFiles = allTtlFiles.filter((f) => !hiddenFiles.has(f))
    const hiddenTtlFiles = allTtlFiles.filter((f) => hiddenFiles.has(f))

    const store = new Store()
    const parser = new Parser()
    const ttlContents: string[] = []

    for (const file of visibleTtlFiles) {
      const fullPath = resolve(ontoDir, file)
      if (!existsSync(fullPath)) {
        console.warn(`[ontology-data] Missing TTL: ${fullPath}`)
        continue
      }
      const content = readFileSync(fullPath, 'utf-8')
      ttlContents.push(content)
      const quads = parser.parse(content)
      store.addQuads(quads)
    }

    if (hiddenTtlFiles.length > 0) {
      console.log(`[ontology-data] Hidden TTL files (parsed but not emitted): ${hiddenTtlFiles.join(', ')}`)
    }

    const allPrefixes = extractPrefixes(ttlContents)
    if (!allPrefixes['smart']) allPrefixes['smart'] = 'https://w3id.org/standards/smart/ontologies/core/'

    const compact = createCompactor(allPrefixes)

    let entities = classifyEntities(store, allPrefixes)
    entities = entities.filter((e) => !hiddenSet.has(e.ontology))
    const definedQnames = new Set(entities.map((e) => e.qname))
    const referencedQnames = collectReferencedQnames(entities)
    const stubs = generateExternalStubs(referencedQnames, definedQnames, allPrefixes)
    entities.push(...stubs)

    const prefixes = Object.entries(allPrefixes)
      .filter(([p]) => p !== '' && p !== ':')
      .map(([prefix, uri]) => ({ prefix, uri }))
    const importChain = buildImportChain(entities, compact)
    const typeMeta = buildTypeMeta(entities)
    const ontologyNamespaces = buildOntologyNamespaces(entities).filter((n) => !hiddenSet.has(n.prefix))

    if (!existsSync(genDir)) mkdirSync(genDir, { recursive: true })

    writeFileSync(
      resolve(genDir, 'ontology.ts'),
      `// Auto-generated from TTL files by build/ontology-data-plugin.ts\n`
        + `// Do not edit manually\n`
        + `// Sources: ontologies/*.ttl (visible)\n`
        + `// Hidden prefixes: ${hiddenPrefixes.join(', ') || '(none)'}\n\n`
        + `export const ontologyEntities = ${JSON.stringify(entities, null, 2)} as const\n\n`
        + `export const ontologyPrefixes = ${JSON.stringify(prefixes)} as const\n\n`
        + `export const ontologyImportChain = ${JSON.stringify(importChain)} as const\n\n`
        + `export const ontologyTypeMeta = ${JSON.stringify(typeMeta)} as const\n\n`
        + `export const ontologyNamespaces = ${JSON.stringify(ontologyNamespaces)} as const\n\n`
        + `export const ontologyHiddenPrefixes = ${JSON.stringify(hiddenPrefixes)} as const\n\n`
        + `export type OntologyEntity = typeof ontologyEntities[number]\n`,
    )

    const counts: Record<string, number> = {}
    for (const e of entities) counts[e.type] = (counts[e.type] || 0) + 1
    console.log(
      `[ontology-data] Generated ${entities.length} entities: ` +
        Object.entries(counts).map(([t, n]) => `${n} ${t}`).join(', '),
    )
  }

  return {
    name: 'ontology-data',
    configResolved(config) {
      const isBuild = config.command === 'build'
      const exists = existsSync(resolve(genDir, 'ontology.ts'))

      if (!isBuild && exists) {
        console.log('[ontology-data] Using cached generated data')
        return
      }

      console.log('[ontology-data] Generating ontology data...')
      generateOntologyData()
      console.log('[ontology-data] Done')
    },
  }
}
