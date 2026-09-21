#!/usr/bin/env node
/**
 * The cross-host leg of the freshness sentinel: every host in the
 * canonical host registry must answer HTTP 200. The registry (the
 * footer's "The sites" set, src/data/host-registry.ts) is imported
 * rather than re-typed, so the probe list moves with the footer and a
 * host added there is probed here with no second list to drift. The
 * registry is a pure data module (erasable TypeScript only), so this
 * script runs under plain node's type stripping with no dependencies
 * installed.
 *
 * The leg exits 0 when every registered host answers 200, and exits 1
 * listing the hosts that did not.
 */

import { HOST_REGISTRY } from '../src/data/host-registry.ts'

const TIMEOUT_MS = 30_000
const failures = []

for (const host of HOST_REGISTRY) {
  try {
    const response = await fetch(host.url, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) })
    console.log(`${response.status}  ${host.url}  (${host.key})`)
    if (response.status !== 200) failures.push(`${host.url} answered HTTP ${response.status}`)
  } catch (error) {
    console.log(`ERR  ${host.url}  (${host.key})`)
    failures.push(`${host.url} did not answer: ${error.message || error}`)
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`::error::canonical host down: ${failure}`)
  process.exit(1)
}
console.log(`all ${HOST_REGISTRY.length} canonical hosts answer 200`)
