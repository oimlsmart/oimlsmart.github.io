#!/usr/bin/env node
/**
 * sync-diagrams.mjs — the shared diagram pipeline (TODO.integration/26).
 *
 * ONE home for the shared SVG set: the `oimlsmart/smart` repository
 * (docs/architecture/diagrams/ + analysis/diagrams/). This site
 * CONSUMES, never redraws: the script copies the current set into
 * public/diagrams/shared/ (prefix-stable), and the drift spec
 * (src/diagram-sync.test.ts) proves the copies ≡ the sources.
 *
 * Usage: node scripts/sync-diagrams.mjs [--check]
 *   (default) copy the set; --check = verify byte-identity, no writes.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SMART = process.env.SMART_REPO ?? resolve(ROOT, '..', 'oimlsmart', 'smart');
const SOURCES = [
  join(SMART, 'docs', 'architecture', 'diagrams'),
  join(SMART, 'analysis', 'diagrams'),
];
const TARGET = join(ROOT, 'public', 'diagrams', 'shared');
const CHECK = process.argv.includes('--check');

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

function collect() {
  const out = new Map();
  for (const dir of SOURCES) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(f => f.endsWith('.svg')).sort()) {
      out.set(f, readFileSync(join(dir, f)));
    }
  }
  return out;
}

const sources = collect();
if (sources.size === 0) {
  console.error(`sync-diagrams: no sources found under ${SMART} (set SMART_REPO)`);
  process.exit(1);
}

if (CHECK) {
  let drift = 0;
  for (const [name, buf] of sources) {
    const target = join(TARGET, name);
    if (!existsSync(target)) {
      console.error(`drift: ${name} missing from the site`);
      drift++;
      continue;
    }
    if (sha(readFileSync(target)) !== sha(buf)) {
      console.error(`drift: ${name} differs from the source`);
      drift++;
    }
  }
  for (const f of existsSync(TARGET) ? readdirSync(TARGET).filter(f => f.endsWith('.svg')) : []) {
    if (!sources.has(f)) {
      console.error(`drift: ${f} exists only on the site (not a shared source)`);
      drift++;
    }
  }
  if (drift > 0) {
    console.error(`sync-diagrams: ${drift} drifted file(s)`);
    process.exit(1);
  }
  console.log(`sync-diagrams: ${sources.size} shared diagram(s) ≡ the sources`);
} else {
  mkdirSync(TARGET, { recursive: true });
  for (const [name, buf] of sources) {
    writeFileSync(join(TARGET, name), buf);
  }
  console.log(`sync-diagrams: copied ${sources.size} shared diagram(s) → public/diagrams/shared/`);
}
