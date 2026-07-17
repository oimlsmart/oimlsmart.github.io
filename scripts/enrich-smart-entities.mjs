#!/usr/bin/env node
// One-shot: enrich smart: entities in src/data/ontology-data.ts using
// metadata parsed from ontologies/smart.ttl.
//
// The original data file classified smart: classes as "external" stubs
// (because there was no SMART core TTL at generation time). Now that we
// ship smart.ttl, we reclassify them to ontology="smart" and copy in the
// real label/description/parent from the TTL.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const ttlPath = resolve(root, 'ontologies/smart.ttl')
const dataPath = resolve(root, 'src/data/ontology-data.ts')

const ttl = readFileSync(ttlPath, 'utf-8')

// Parse Turtle blocks of the form:
//   smart:Foo rdf:type owl:Class ;
//     rdfs:subClassOf smart:Bar ;
//     rdfs:label "Label"@en ;
//     skos:definition "Description."@en .
const blocks = ttl.split(/\n(?=\s*smart:[A-Za-z]+)/)
const entities = []
for (const block of blocks) {
  const subjectMatch = block.match(/^(smart:[A-Za-z][A-Za-z0-9_]*)\s+rdf:type\s+owl:Class/)
  if (!subjectMatch) continue
  const qname = subjectMatch[1]
  const label = block.match(/rdfs:label\s+"([^"]+)"(?:@en)?/)?.[1] || ''
  const desc = block.match(/skos:definition\s+"([^"]+)"(?:@en)?/)?.[1] || ''
  const parent = block.match(/rdfs:subClassOf\s+(smart:[A-Za-z][A-Za-z0-9_]*)/)?.[1] || ''
  entities.push({ qname, label, desc, parent })
}

console.log(`[enrich-smart] Parsed ${entities.length} smart: classes from ${ttlPath}`)

let src = readFileSync(dataPath, 'utf-8')
let updated = 0

for (const ent of entities) {
  // Find the entity block in the data file matching this qname, then update
  // ontology, label, description, and (if present) parent.
  // The block is a JSON object literal; we do a targeted regex replacement.

  const qnameNeedle = `"qname": "${ent.qname}"`
  const blockStart = src.indexOf(qnameNeedle)
  if (blockStart === -1) {
    console.warn(`  ${ent.qname}: not found in data file, skipping`)
    continue
  }

  // Find the enclosing object { ... } by scanning backwards for { and forwards for }.
  let objStart = src.lastIndexOf('{', blockStart)
  let depth = 1
  let i = objStart + 1
  while (i < src.length && depth > 0) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') depth--
    i++
  }
  const objEnd = i // one past the closing }
  const block = src.slice(objStart, objEnd)

  // Apply updates via regex within the block.
  let updatedBlock = block
    .replace(/"ontology":\s*"[^"]*"/, `"ontology": "smart"`)
    .replace(/"type":\s*"[^"]*"/, `"type": "class"`)
    .replace(/"label":\s*"[^"]*"/, `"label": ${JSON.stringify(ent.label)}`)
    .replace(/"description":\s*"[^"]*"/, `"description": ${JSON.stringify(ent.desc)}`)

  // If TTL specifies a parent and the data block doesn't have one, insert it
  // before the closing brace.
  if (ent.parent && !/"parent":\s*"/.test(updatedBlock)) {
    updatedBlock = updatedBlock.replace(/\n\s*\}$/, `,\n    "parent": "${ent.parent}"\n  }`)
  } else if (ent.parent) {
    updatedBlock = updatedBlock.replace(/"parent":\s*"[^"]*"/, `"parent": "${ent.parent}"`)
  }

  if (updatedBlock !== block) {
    src = src.slice(0, objStart) + updatedBlock + src.slice(objEnd)
    updated++
    console.log(`  ${ent.qname}: updated`)
  }
}

writeFileSync(dataPath, src)
console.log(`[enrich-smart] Updated ${updated} entities in ${dataPath}`)
