#!/usr/bin/env node
// One-shot script: filter oiml-r60 entries from a generated ontology .ts data file.
// Usage: node scripts/filter-ontology-r60.mjs <path-to-file>
//
// Removes:
//   - entities where ontology === 'oiml-r60'
//   - external stubs whose qname starts with 'oiml-r60:'
//   - the 'oiml-r60' prefix from ontologyPrefixes
//   - the 'oiml-r60:' entry from ontologyImportChain
//   - the 'oiml-r60' namespace from ontologyNamespaces

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node scripts/filter-ontology-r60.mjs <path>')
  process.exit(1)
}

const fullPath = resolve(process.cwd(), file)
const src = readFileSync(fullPath, 'utf-8')

function extractBlock(text, name) {
  const startMarker = `export const ${name} = `
  const startIdx = text.indexOf(startMarker)
  if (startIdx === -1) return null
  const valueStart = startIdx + startMarker.length
  const firstChar = text[valueStart]
  const open = firstChar
  const close = firstChar === '[' ? ']' : '}'
  let depth = 0
  let inString = false
  let escape = false
  let endIdx = -1
  for (let i = valueStart; i < text.length; i++) {
    const c = text[i]
    if (escape) { escape = false; continue }
    if (c === '\\') { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) { endIdx = i; break }
    }
  }
  if (endIdx === -1) return null
  return {
    start: startIdx,
    valueStart,
    end: endIdx,
    raw: text.slice(valueStart, endIdx + 1),
  }
}

function parseLoose(json) {
  // The file may use `as const` or trailing commas; strip them
  const cleaned = json.replace(/\s+as\s+const\s*$/, '').replace(/,(\s*[}\]])/g, '$1')
  return JSON.parse(cleaned)
}

const HIDDEN = 'oiml-r60'

let modified = src
let stats = { entities: 0, prefixes: 0, imports: 0, namespaces: 0 }

const entitiesBlock = extractBlock(modified, 'ontologyEntities')
if (entitiesBlock) {
  const arr = parseLoose(entitiesBlock.raw)
  const before = arr.length
  const filtered = arr.filter((e) => {
    if (e.ontology === HIDDEN) return false
    if (typeof e.qname === 'string' && e.qname.startsWith(`${HIDDEN}:`)) return false
    return true
  })
  stats.entities = before - filtered.length
  const replacement = JSON.stringify(filtered, null, 2)
  modified = modified.slice(0, entitiesBlock.valueStart) + replacement + modified.slice(entitiesBlock.end + 1)
}

const prefixesBlock = extractBlock(modified, 'ontologyPrefixes')
if (prefixesBlock) {
  const arr = parseLoose(prefixesBlock.raw)
  const before = arr.length
  const filtered = arr.filter((p) => p.prefix !== HIDDEN)
  stats.prefixes = before - filtered.length
  const replacement = JSON.stringify(filtered)
  modified = modified.slice(0, prefixesBlock.valueStart) + replacement + modified.slice(prefixesBlock.end + 1)
}

const importBlock = extractBlock(modified, 'ontologyImportChain')
if (importBlock) {
  const obj = parseLoose(importBlock.raw)
  const key = `${HIDDEN}:`
  if (obj[key]) {
    delete obj[key]
    stats.imports = 1
  }
  // Also scrub oiml-r60 references from any remaining import arrays
  for (const k of Object.keys(obj)) {
    if (Array.isArray(obj[k]?.imports)) {
      obj[k].imports = obj[k].imports.filter((i) => i !== key && i !== HIDDEN)
    }
  }
  const replacement = JSON.stringify(obj)
  modified = modified.slice(0, importBlock.valueStart) + replacement + modified.slice(importBlock.end + 1)
}

const nsBlock = extractBlock(modified, 'ontologyNamespaces')
if (nsBlock) {
  const arr = parseLoose(nsBlock.raw)
  const before = arr.length
  const filtered = arr.filter((n) => n.prefix !== HIDDEN)
  stats.namespaces = before - filtered.length
  const replacement = JSON.stringify(arr.filter((n) => n.prefix !== HIDDEN), null, 2)
  modified = modified.slice(0, nsBlock.valueStart) + replacement + modified.slice(nsBlock.end + 1)
}

writeFileSync(fullPath, modified)
console.log(`[filter-r60] ${file}`)
console.log(`  removed ${stats.entities} entities, ${stats.prefixes} prefixes, ${stats.imports} imports, ${stats.namespaces} namespaces`)
