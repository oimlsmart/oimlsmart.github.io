// Pure logic for parsing Turtle TTL files into a classified entity model.
// Ported from mn/isq-smart/browser/build/ontology-extract.ts and adapted
// for OIML namespaces: smart, oiml, oiml-r60, oiml-pubtype.

import type { Store } from 'n3'

/** Minimal RDF term interface matching n3/lib/Term.js */
export interface RdfTerm {
  termType: 'NamedNode' | 'Literal' | 'BlankNode' | 'Variable' | 'DefaultGraph'
  value: string
}

/** Minimal RDF quad interface matching n3/lib/Quad.js */
export interface RdfQuad {
  subject: RdfTerm
  predicate: RdfTerm
  object: RdfTerm
  graph: RdfTerm
}

/** Subset of n3 Store API used by classification logic */
export interface RdfStore {
  getQuads(
    subject: string | RdfTerm | null,
    predicate: string | null,
    object: string | null,
    graph: string | null,
  ): RdfQuad[]
  getObjects(
    subject: string | RdfTerm,
    predicate: string,
    graph: string | null,
  ): RdfTerm[]
}

export interface ShapeConstraint {
  path: string
  minCount?: number
  maxCount?: number
  datatype?: string
  nodeKind?: string
  classValue?: string
  hasValue?: string
  uniqueLang?: boolean
}

export type EntityType =
  | 'ontology'
  | 'class'
  | 'objectProperty'
  | 'datatypeProperty'
  | 'annotationProperty'
  | 'shape'
  | 'concept'
  | 'conceptScheme'
  | 'individual'
  | 'external'

export type OntologyPrefix = 'smart' | 'oiml' | 'oiml-r60' | 'oiml-pubtype' | 'external'

export interface OntologyBuildEntity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  type: EntityType | string
  ontology: OntologyPrefix | string
  scopeNote?: string
  example?: string
  altLabel?: string
  seeAlso?: string[]
  version?: string
  imports?: string[]
  parent?: string
  domain?: string[]
  range?: string[]
  functional?: boolean
  targetClass?: string
  targetSubjectsOf?: string
  targetObjectsOf?: string
  constraints?: ShapeConstraint[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  identifier?: string
  isPartOf?: string[]
  reference?: string
  properties?: Record<string, string[]>
}

export interface TypeMeta {
  label: string
  color: string
  colorDot: string
}

export interface ImportChainEntry {
  imports: string[]
  description: string
  version?: string
}

export interface OntologyNamespace {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

const OWL = 'http://www.w3.org/2002/07/owl#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const SKOS = 'http://www.w3.org/2004/02/skos/core#'
const SH = 'http://www.w3.org/ns/shacl#'
const SMART = 'https://w3id.org/standards/smart/ontologies/core/'
const OIML = 'https://w3id.org/standards/oiml/ontologies/core/'
const OIML_R60 = 'https://w3id.org/standards/oiml/r60/ontologies/core/'
const OIML_PUBTYPE = 'https://w3id.org/standards/oiml/taxonomies/publication-type/'

export const NAMESPACE_PRIORITY = ['smart', 'oiml', 'oiml-r60', 'oiml-pubtype'] as const

export function extractPrefixes(ttlContents: string[]): Record<string, string> {
  const allPrefixes: Record<string, string> = {}
  const prefixRegex = /@prefix\s+([a-zA-Z0-9_.-]*):\s*<([^>]+)>\s*\./g

  for (const content of ttlContents) {
    let m: RegExpExecArray | null
    const rx = new RegExp(prefixRegex.source, 'g')
    while ((m = rx.exec(content)) !== null) {
      const prefix = m[1]
      const uri = m[2]
      allPrefixes[prefix] = uri
    }
  }

  return allPrefixes
}

export function createCompactor(allPrefixes: Record<string, string>): (uri: string) => string {
  const prefixEntries = Object.entries(allPrefixes).sort((a, b) => b[1].length - a[1].length)
  return function compact(uri: string): string {
    if (uri.startsWith('<') && uri.endsWith('>')) uri = uri.slice(1, -1)
    for (const [prefix, ns] of prefixEntries) {
      if (uri.startsWith(ns)) {
        const local = uri.slice(ns.length)
        return `${prefix}:${local}`
      }
    }
    return uri
  }
}

export function slugFromQname(qname: string): string {
  return qname.replace(/:/g, '-')
}

function classifyByUri(subjectUri: string): OntologyPrefix {
  if (subjectUri.startsWith(OIML_R60)) return 'oiml-r60'
  if (subjectUri.startsWith(OIML_PUBTYPE)) return 'oiml-pubtype'
  if (subjectUri.startsWith(OIML)) return 'oiml'
  if (subjectUri.startsWith(SMART)) return 'smart'
  return 'external'
}

function lit(value: RdfTerm | string | null | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : value.value || ''
}

export function classifyEntities(
  store: RdfStore,
  allPrefixes: Record<string, string>,
): OntologyBuildEntity[] {
  const compact = createCompactor(allPrefixes)
  const entities: OntologyBuildEntity[] = []

  function getObjects(subject: string | RdfTerm, predicateUri: string): string[] {
    return store.getObjects(subject, predicateUri, null).map((o) => o.value)
  }

  function getFirst(subject: string | RdfTerm, predicateUri: string): string {
    const objs = getObjects(subject, predicateUri)
    return objs.length ? lit(objs[0]) : ''
  }

  const subjects = new Map<string, Set<{ predicate: string; object: RdfTerm }>>()
  for (const q of store.getQuads(null, null, null, null)) {
    const s = q.subject.value
    if (!subjects.has(s)) subjects.set(s, new Set())
    subjects.get(s)!.add({ predicate: q.predicate.value, object: q.object })
  }

  for (const [subjectUri] of subjects) {
    const types = getObjects(subjectUri, RDF + 'type')
    const qname = compact(subjectUri)
    if (subjectUri.startsWith('_:')) continue
    if (!qname.includes(':')) continue

    const ontology = classifyByUri(subjectUri)

    const label =
      getFirst(subjectUri, RDFS + 'label') ||
      getFirst(subjectUri, SKOS + 'prefLabel') ||
      getFirst(subjectUri, 'http://purl.org/dc/terms/title') ||
      qname.split(':').pop() ||
      ''
    const description = getFirst(subjectUri, SKOS + 'definition')
    const scopeNote = getFirst(subjectUri, SKOS + 'scopeNote')
    const example = getFirst(subjectUri, SKOS + 'example')
    const altLabel = getFirst(subjectUri, SKOS + 'altLabel')
    const seeAlso = getObjects(subjectUri, RDFS + 'seeAlso')

    const baseEntity: OntologyBuildEntity = {
      uri: subjectUri,
      qname,
      slug: slugFromQname(qname),
      label,
      description,
      scopeNote: scopeNote || undefined,
      example: example || undefined,
      altLabel: altLabel || undefined,
      seeAlso: seeAlso.length ? seeAlso : undefined,
      ontology,
    }

    if (types.includes(OWL + 'Ontology')) {
      baseEntity.type = 'ontology'
      baseEntity.version = getFirst(subjectUri, OWL + 'versionInfo')
      baseEntity.imports = getObjects(subjectUri, OWL + 'imports').map(compact)
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'Class')) {
      baseEntity.type = 'class'
      const parents = getObjects(subjectUri, RDFS + 'subClassOf')
      if (parents.length) baseEntity.parent = compact(parents[0])
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'ObjectProperty')) {
      baseEntity.type = 'objectProperty'
      baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter((q) => q.includes(':'))
      baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact).filter((q) => q.includes(':'))
      baseEntity.functional = types.includes(OWL + 'FunctionalProperty')
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'DatatypeProperty')) {
      baseEntity.type = 'datatypeProperty'
      baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter((q) => q.includes(':'))
      baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact)
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'AnnotationProperty')) {
      baseEntity.type = 'annotationProperty'
      entities.push(baseEntity)
    } else if (types.includes(SH + 'NodeShape') || types.includes(SH + 'PropertyShape')) {
      baseEntity.type = 'shape'
      const tc = getObjects(subjectUri, SH + 'targetClass')
      if (tc.length) baseEntity.targetClass = compact(tc[0])
      const tso = getObjects(subjectUri, SH + 'targetSubjectsOf')
      if (tso.length) baseEntity.targetSubjectsOf = compact(tso[0])
      const too = getObjects(subjectUri, SH + 'targetObjectsOf')
      if (too.length) baseEntity.targetObjectsOf = compact(too[0])

      const propertyQuads = store.getQuads(subjectUri, SH + 'property', null, null)
      const constraints: ShapeConstraint[] = []
      for (const pq of propertyQuads) {
        const bnTerm = pq.object
        const pathTerms = store.getObjects(bnTerm, SH + 'path', null)
        if (!pathTerms.length) continue
        const pathTerm = pathTerms[0]
        let path: string
        const listItems = store.getQuads(pathTerm, RDF + 'first', null, null)
        if (listItems.length) {
          const items: string[] = []
          let listNode: RdfTerm | null = pathTerm
          let safety = 20
          while (safety-- > 0 && listNode) {
            const firsts = store.getObjects(listNode, RDF + 'first', null)
            if (firsts.length) items.push(compact(firsts[0].value))
            const rests = store.getObjects(listNode, RDF + 'rest', null)
            if (rests.length && rests[0].value !== RDF + 'nil') {
              listNode = rests[0]
            } else {
              break
            }
          }
          path = items.join(' / ')
        } else {
          path = compact(pathTerm.value)
        }
        if (!path.includes(':') && !path.includes('/')) continue
        const c: ShapeConstraint = { path }
        const minC = getFirst(bnTerm, SH + 'minCount')
        if (minC) c.minCount = parseInt(minC)
        const maxC = getFirst(bnTerm, SH + 'maxCount')
        if (maxC) c.maxCount = parseInt(maxC)
        const dt = getFirst(bnTerm, SH + 'datatype')
        if (dt) c.datatype = compact(dt)
        const nk = getFirst(bnTerm, SH + 'nodeKind')
        if (nk) c.nodeKind = compact(nk)
        const cls = getFirst(bnTerm, SH + 'class')
        if (cls) c.classValue = compact(cls)
        const hv = getFirst(bnTerm, SH + 'hasValue')
        if (hv) c.hasValue = compact(hv)
        const ul = getFirst(bnTerm, SH + 'uniqueLang')
        if (ul === 'true') c.uniqueLang = true
        constraints.push(c)
      }
      baseEntity.constraints = constraints.length ? constraints : undefined
      entities.push(baseEntity)
    } else if (types.includes(SKOS + 'ConceptScheme')) {
      baseEntity.type = 'conceptScheme'
      baseEntity.topConcepts = getObjects(subjectUri, SKOS + 'hasTopConcept').map(compact)
      entities.push(baseEntity)
    } else if (types.includes(SKOS + 'Concept')) {
      baseEntity.type = 'concept'
      const schemes = getObjects(subjectUri, SKOS + 'inScheme').map(compact)
      if (schemes.length) baseEntity.scheme = schemes[0]
      baseEntity.instanceOf = types
        .filter((t) => isKnownOntologyType(t))
        .map(compact)
        .filter((q) => q !== 'skos:Concept')
      entities.push(baseEntity)
    } else {
      const knownTypes = types.filter((t) => isKnownOntologyType(t)).map(compact)
      if (
        knownTypes.length &&
        !qname.startsWith('rdf:') &&
        !qname.startsWith('owl:') &&
        !qname.startsWith('rdfs:') &&
        !qname.startsWith('xsd:') &&
        !qname.startsWith('skos:') &&
        !qname.startsWith('dcterms:')
      ) {
        baseEntity.type = 'individual'
        baseEntity.instanceOf = knownTypes
        const title = getFirst(subjectUri, 'http://purl.org/dc/terms/title')
        if (title) baseEntity.label = title
        const identifier = getFirst(subjectUri, 'http://purl.org/dc/terms/identifier')
        if (identifier) baseEntity.identifier = identifier
        const isPartOf = getObjects(subjectUri, 'http://purl.org/dc/terms/isPartOf')
        if (isPartOf.length) baseEntity.isPartOf = isPartOf.map(compact).filter((q) => q.includes(':'))

        const referencePredicates = ['http://purl.org/dc/terms/source']
        for (const rp of referencePredicates) {
          const refs = getObjects(subjectUri, rp)
          if (refs.length) {
            baseEntity.reference = refs[0]
            break
          }
        }

        const customProps: Record<string, string[]> = {}
        const knownPredicates = new Set([
          RDF + 'type',
          RDFS + 'label',
          RDFS + 'comment',
          SKOS + 'prefLabel',
          SKOS + 'definition',
          SKOS + 'altLabel',
          SKOS + 'scopeNote',
          SKOS + 'example',
          SKOS + 'inScheme',
          RDFS + 'seeAlso',
          'http://purl.org/dc/terms/title',
          'http://purl.org/dc/terms/identifier',
          'http://purl.org/dc/terms/isPartOf',
          'http://purl.org/dc/terms/source',
        ])
        const propQuads = store.getQuads(subjectUri, null, null, null)
        for (const pq of propQuads) {
          if (knownPredicates.has(pq.predicate.value)) continue
          const pQname = compact(pq.predicate.value)
          if (!pQname.includes(':')) continue
          if (!customProps[pQname]) customProps[pQname] = []
          const objQname = pq.object.termType === 'NamedNode'
            ? compact(pq.object.value)
            : pq.object.value
          if (!customProps[pQname].includes(objQname)) {
            customProps[pQname].push(objQname)
          }
        }
        if (Object.keys(customProps).length) baseEntity.properties = customProps

        entities.push(baseEntity)
      }
    }
  }

  return entities
}

function isKnownOntologyType(typeUri: string): boolean {
  return (
    typeUri.startsWith(OIML) ||
    typeUri.startsWith(OIML_R60) ||
    typeUri.startsWith(OIML_PUBTYPE) ||
    typeUri.startsWith(SMART)
  )
}

export function collectReferencedQnames(entities: OntologyBuildEntity[]): Set<string> {
  const referenced = new Set<string>()

  for (const e of entities) {
    if (e.parent) referenced.add(e.parent)
    for (const d of e.domain || []) referenced.add(d)
    for (const r of e.range || []) referenced.add(r)
    if (e.targetClass) referenced.add(e.targetClass)
    if (e.targetSubjectsOf) referenced.add(e.targetSubjectsOf)
    if (e.targetObjectsOf) referenced.add(e.targetObjectsOf)
    if (e.scheme) referenced.add(e.scheme)
    for (const t of e.instanceOf || []) referenced.add(t)
    for (const c of e.constraints || []) {
      if (c.path) referenced.add(c.path)
      if (c.datatype) referenced.add(c.datatype)
      if (c.classValue) referenced.add(c.classValue)
      if (c.nodeKind) referenced.add(c.nodeKind)
      if (c.hasValue) referenced.add(c.hasValue)
    }
    for (const ps of Object.values(e.properties || {})) {
      for (const p of ps) {
        if (p.includes(':')) referenced.add(p)
      }
    }
  }

  return referenced
}

const BUILT_IN_META: Record<string, { type: string; description: string }> = {
  'rdf:type': { type: 'annotationProperty', description: 'The type of the subject resource.' },
  'rdf:value': { type: 'datatypeProperty', description: 'The value of the subject resource.' },
  'rdf:langString': { type: 'class', description: 'The class of RDF language-tagged string literals.' },
  'dcterms:title': { type: 'annotationProperty', description: 'A name given to the resource.' },
  'dcterms:description': { type: 'annotationProperty', description: 'An account of the resource.' },
  'dcterms:identifier': { type: 'annotationProperty', description: 'An unambiguous reference to the resource.' },
  'dcterms:isPartOf': { type: 'objectProperty', description: 'A related resource in which the described resource is included.' },
  'dcterms:hasVersion': { type: 'objectProperty', description: 'A related resource that is a version of the described resource.' },
  'dcterms:source': { type: 'annotationProperty', description: 'A related resource from which the described resource is derived.' },
  'dcterms:issued': { type: 'annotationProperty', description: 'Date of formal issuance of the resource.' },
  'dcterms:replaces': { type: 'objectProperty', description: 'A related resource that is supplanted by the described resource.' },
  'skos:prefLabel': { type: 'annotationProperty', description: 'The preferred lexical label for a resource.' },
  'skos:altLabel': { type: 'annotationProperty', description: 'An alternative lexical label for a resource.' },
  'skos:definition': { type: 'annotationProperty', description: 'A complete explanation of the intended meaning of a concept.' },
  'skos:notation': { type: 'annotationProperty', description: 'A string of characters used to uniquely identify a concept.' },
  'skos:note': { type: 'annotationProperty', description: 'A general note about a concept.' },
  'skos:scopeNote': { type: 'annotationProperty', description: 'A note that helps to clarify the meaning of a concept.' },
  'skos:broader': { type: 'objectProperty', description: 'Relates a concept to a broader concept.' },
  'skos:narrower': { type: 'objectProperty', description: 'Relates a concept to a narrower concept.' },
  'skos:inScheme': { type: 'objectProperty', description: 'Relates a resource to a concept scheme.' },
  'skos:hasTopConcept': { type: 'objectProperty', description: 'Relates a concept scheme to its top concepts.' },
  'skos:topConceptOf': { type: 'objectProperty', description: 'Relates a concept to a scheme in which it is a top concept.' },
  'xsd:string': { type: 'class', description: 'The class of XML Schema string values.' },
  'xsd:integer': { type: 'class', description: 'The class of XML Schema integer values.' },
  'xsd:decimal': { type: 'class', description: 'The class of XML Schema decimal values.' },
  'xsd:date': { type: 'class', description: 'The class of XML Schema date values.' },
  'xsd:boolean': { type: 'class', description: 'The class of XML Schema boolean values.' },
  'sh:IRI': { type: 'class', description: 'A SHACL node kind indicating the value must be an IRI.' },
  'sh:BlankNodeOrIRI': { type: 'class', description: 'A SHACL node kind indicating the value must be a blank node or IRI.' },
  'sh:Literal': { type: 'class', description: 'A SHACL node kind indicating the value must be a literal.' },
}

export function generateExternalStubs(
  referencedQnames: Set<string>,
  definedQnames: Set<string>,
  allPrefixes: Record<string, string>,
): OntologyBuildEntity[] {
  const stubs: OntologyBuildEntity[] = []

  for (const qname of referencedQnames) {
    if (definedQnames.has(qname)) continue
    if (!qname.includes(':')) continue

    const prefix = qname.split(':')[0]
    if (['rdf', 'rdfs', 'owl', 'xsd', 'sh', 'skos', 'dcterms'].includes(prefix)) {
      const meta = BUILT_IN_META[qname]
      if (!meta) continue
      const localName = qname.split(':').pop() || ''
      const nsUri = allPrefixes[prefix]
      stubs.push({
        uri: nsUri ? nsUri + localName : '',
        qname,
        slug: slugFromQname(qname),
        label: localName,
        description: meta.description,
        ontology: 'external',
        type: meta.type,
      })
      continue
    }

    const localName = qname.split(':').pop() || ''
    const local = qname.split(':').slice(1).join(':')
    const nsUri = allPrefixes[prefix]
    const fullUri = nsUri ? nsUri + local : ''

    stubs.push({
      uri: fullUri,
      qname,
      slug: slugFromQname(qname),
      label: localName,
      description: '',
      ontology: 'external',
      type: 'external',
    })
  }

  return stubs
}

export function buildTypeMeta(entities: OntologyBuildEntity[]): Record<string, TypeMeta> {
  const entityTypes = [...new Set(entities.map((e) => e.type))]
  const typeMeta: Record<string, TypeMeta> = {}

  for (const t of entityTypes) {
    switch (t) {
      case 'class':
        typeMeta[t] = { label: 'Class', color: 'bg-blue-100 text-blue-800', colorDot: 'bg-blue-400' }
        break
      case 'objectProperty':
        typeMeta[t] = { label: 'Object Property', color: 'bg-green-100 text-green-800', colorDot: 'bg-green-400' }
        break
      case 'datatypeProperty':
        typeMeta[t] = { label: 'Datatype Property', color: 'bg-lime-100 text-lime-800', colorDot: 'bg-lime-400' }
        break
      case 'annotationProperty':
        typeMeta[t] = { label: 'Annotation Property', color: 'bg-amber-100 text-amber-800', colorDot: 'bg-amber-400' }
        break
      case 'shape':
        typeMeta[t] = { label: 'SHACL Shape', color: 'bg-purple-100 text-purple-800', colorDot: 'bg-purple-400' }
        break
      case 'concept':
        typeMeta[t] = { label: 'SKOS Concept', color: 'bg-teal-100 text-teal-800', colorDot: 'bg-teal-400' }
        break
      case 'conceptScheme':
        typeMeta[t] = { label: 'Concept Scheme', color: 'bg-cyan-100 text-cyan-800', colorDot: 'bg-cyan-400' }
        break
      case 'individual':
        typeMeta[t] = { label: 'Named Individual', color: 'bg-orange-100 text-orange-800', colorDot: 'bg-orange-400' }
        break
      case 'ontology':
        typeMeta[t] = { label: 'Ontology', color: 'bg-indigo-100 text-indigo-800', colorDot: 'bg-indigo-400' }
        break
      case 'external':
        typeMeta[t] = { label: 'External', color: 'bg-slate-100 text-slate-600', colorDot: 'bg-slate-400' }
        break
      default:
        typeMeta[t] = { label: t, color: 'bg-slate-100 text-slate-600', colorDot: 'bg-slate-400' }
    }
  }

  return typeMeta
}

export function buildImportChain(
  entities: OntologyBuildEntity[],
  compact: (uri: string) => string,
): Record<string, ImportChainEntry> {
  const importChain: Record<string, ImportChainEntry> = {}
  for (const e of entities) {
    if (e.type === 'ontology' && e.imports?.length) {
      importChain[compact(e.uri)] = {
        imports: e.imports.map((imp) => compact(imp)),
        description: e.description,
        version: e.version,
      }
    }
  }
  return importChain
}

export function buildOntologyNamespaces(entities: OntologyBuildEntity[]): OntologyNamespace[] {
  return [
    {
      prefix: 'smart',
      uri: SMART,
      title: 'IEC-ISO SMART Core Ontology',
      description:
        'Foundational ontology for representing machine-actionable standards content, as defined by the IEC/ISO SMART project. Provides the root Entity class and the Provision, PublicationDocument, and TermEntry models that OIML extends.',
      color: 'emerald',
      version:
        entities.find((e) => e.type === 'ontology' && e.uri === SMART)?.version || '2.0.0',
    },
    {
      prefix: 'oiml',
      uri: OIML,
      title: 'OIML Core Ontology',
      description:
        'Core ontology for OIML International Recommendations. Defines classes and properties shared across all OIML standards (R 60, R 76, R 111, etc.), including the standard structure (Requirements, Tests, Test Report, Forms) and certification lifecycle.',
      color: 'brand',
      version:
        entities.find((e) => e.type === 'ontology' && e.uri === OIML)?.version || '1.0.0',
    },
    {
      prefix: 'oiml-r60',
      uri: OIML_R60,
      title: 'OIML R 60 Domain Ontology',
      description:
        'Domain ontology for OIML R 60 (Metrological regulation for load cells). Defines R 60-specific classes (LoadCell, AccuracyClass, etc.) that inherit from OIML Core, and R 60 individuals (the standard, its parts, requirements classes, conformance classes, and test report forms).',
      color: 'teal',
      version:
        entities.find((e) => e.type === 'ontology' && e.uri === OIML_R60)?.version || '1.0.0',
    },
    {
      prefix: 'oiml-pubtype',
      uri: OIML_PUBTYPE,
      title: 'OIML Publication Type Taxonomy',
      description:
        'A SKOS concept scheme enumerating the kinds of publication documents issued by OIML: International Recommendation (R), International Document (D), Basic Publication (B), Guide (G), Vocabulary (V), Bulletin (BL), and Expert Report (E).',
      color: 'orange',
      version: '1.0.0',
    },
  ]
}

export function buildStoreFromFile(file: string, store: Store, ttlContents: string[]): void {
  // Placeholder — kept for backward compatibility. The plugin uses n3 directly.
  void file
  void store
  void ttlContents
}
