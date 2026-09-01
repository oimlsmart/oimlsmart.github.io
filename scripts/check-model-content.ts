#!/usr/bin/env tsx
// ─────────────────────────────────────────────────────────────────────
// check-model-content — the www adaptation of the smart repo's
// derive-never-invent tripwire (AGENTS.d/16 there; TODO.promotion/08
// here). A promotion page stating a model fact (a clause id, a count, a
// requirement's semantics) either derives it from the SSOT at build
// time or carries a dated entry in src/data/model-content-allowlist.ts
// — and that entry only lists the fact while the entry's own pins hold:
// the SSOT probes are re-checked whenever SMART_REPO is declared (the
// gates.yml posture: declared ⇒ verified, undeclared ⇒ a loud skip,
// never a false green), the `live` pins are exercised by the nightly
// demo-liveness leg.
//
// The flagged shapes (each needs an allowlist entry naming the exact
// file + literal):
//   (m1) a section mark with a number          §14.8
//   (m2) an English "clause N" reference        clause 5.2
//   (m3) an OIML publication URN                urn:oiml:pub:r:60-1:2021
//   (m4) a bare document + clause-number pair   R 60-2 2.10/2.11
//   (m5) a digit count of model nouns           180 requirements
//
// Admitted blind spots, said honestly: spelled-out counts ("nine
// checks") and requirement semantics retold in pure prose are prose,
// not literals — the doctrine applies, the tripwire cannot see them.
//
//   npx tsx scripts/check-model-content.ts     # the gate (exit 1 on violations)
// ─────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import {
  MODEL_CONTENT_ALLOWLIST,
  MODEL_CONTENT_CEILING,
  type ModelContentVerify,
} from '../src/data/model-content-allowlist'
import { REPO, SMART, smartRepoStatus } from './promotion-lib'

/** The promotion surfaces the rule covers (waves 01–07). The ladder
 *  pages (/platform, /architecture, the recommendations/library
 *  collections) are NOT in scope today — they predate the rule; naming
 *  the boundary here is the honest scope statement, and widening the
 *  scope is a follow-up wave, not a silent one. */
const SCOPE = [
  'src/pages/audiences',
  'src/pages/demo',
  'src/pages/services',
  'src/pages/technologies',
  'src/pages/tour',
  'src/pages/use-cases',
  'src/content/pages/technologies',
  'src/content/pages/use-cases',
  'src/content/pages/about/audiences',
  'src/data/tour-slides.ts',
]

const PATTERNS: ReadonlyArray<{ readonly rule: string; readonly re: RegExp }> = [
  { rule: 'section-ref', re: /§\s*\d+(?:\.\d+)*/g },
  { rule: 'clause-ref', re: /clause\s+\d+(?:\.\d+)*/g },
  { rule: 'publication-urn', re: /urn:oiml:pub:[a-z]+:[\w:.-]+/g },
  { rule: 'bare-doc-clause', re: /\bR\s?\d+(?:-\d+)?(?::\d{4})?\s+\d+(?:\.\d+)+(?:\s*\/\s*\d+(?:\.\d+)*)*/g },
  {
    rule: 'model-count',
    re: /\b\d+\s+(?:requirement classes?|requirements|conformance classes?|test forms?|schemas?)\b/g,
  },
]

export interface ModelContentViolation {
  readonly file: string
  readonly rule: string
  readonly literal: string
  readonly problem: string
}

function scopeFiles(): string[] {
  const out: string[] = []
  const walkDir = (abs: string) => {
    for (const e of readdirSync(abs)) {
      const p = join(abs, e)
      if (statSync(p).isDirectory()) walkDir(p)
      else if (/\.(astro|mdx|md|ts)$/.test(e)) out.push(p)
    }
  }
  for (const rel of SCOPE) {
    const abs = join(REPO, rel)
    if (!existsSync(abs)) continue
    if (statSync(abs).isDirectory()) walkDir(abs)
    else out.push(abs)
  }
  return out.sort()
}

/** The flagged literals of one file, as file-relative literal strings
 *  (whitespace collapsed, so a count wrapped across a prose line break
 *  is still one literal). */
export function flaggedLiterals(absPath: string): Array<{ rule: string; literal: string }> {
  const text = readFileSync(absPath, 'utf-8').replace(/\s+/g, ' ')
  const out: Array<{ rule: string; literal: string }> = []
  const seen = new Set<string>()
  for (const { rule, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const literal = m[0].replace(/\s+/g, ' ').trim()
      const key = `${rule}${literal}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ rule, literal })
    }
  }
  return out
}

/** A presentation-XML clause pin: the doc's fmt-titles carry the
 *  autonum numbers (spaced glyphs, e.g. "1 4 . 8"); the clause's body
 *  must carry the text. */
export function checkClausePin(absPath: string, clause: string, text: string): string | null {
  if (!existsSync(absPath)) return `file not found: ${absPath}`
  const xml = readFileSync(absPath, 'utf-8')
  const titles = [...xml.matchAll(/<fmt-title[^>]*>[\s\S]*?<\/fmt-title>/g)]
  for (let i = 0; i < titles.length; i++) {
    const num = titles[i][0].replace(/<[^>]+>/g, '').replace(/\s+/g, '')
    if (num !== clause) continue
    const end = titles[i + 1]?.index ?? titles[i].index! + 4000
    const body = xml
      .slice(titles[i].index!, Math.min(end, titles[i].index! + 8000))
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
    if (!body.includes(text)) {
      return `clause ${clause} found but its body does not carry ${JSON.stringify(text)}`
    }
    return null
  }
  return `clause ${clause} not found in ${absPath}`
}

export function checkModelContent(): { violations: ModelContentViolation[]; smartVerified: number; smartSkipped: number } {
  const violations: ModelContentViolation[] = []
  const smart = smartRepoStatus()

  // Entry hygiene: shape, the ceiling, stale entries (the self-cleaning
  // rule — an entry whose literal left the page must leave the list).
  if (MODEL_CONTENT_ALLOWLIST.length > MODEL_CONTENT_CEILING) {
    violations.push({
      file: 'src/data/model-content-allowlist.ts',
      rule: 'ceiling',
      literal: `${MODEL_CONTENT_ALLOWLIST.length} > ${MODEL_CONTENT_CEILING}`,
      problem:
        'the allowlist grew past its ceiling — the list only shrinks; derive the fact or bump the ceiling deliberately in the same commit',
    })
  }
  const entryKeys = new Set<string>()
  for (const e of MODEL_CONTENT_ALLOWLIST) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.added) || !e.fact || e.verify.length === 0) {
      violations.push({
        file: e.file,
        rule: 'entry-shape',
        literal: e.literal,
        problem: 'every entry carries a date (YYYY-MM-DD), the fact, and at least one verification pin',
      })
    }
    const key = `${e.file}${e.literal}`
    if (entryKeys.has(key)) {
      violations.push({ file: e.file, rule: 'entry-dupe', literal: e.literal, problem: 'duplicate (file, literal) entry' })
    }
    entryKeys.add(key)
    const abs = join(REPO, e.file)
    if (!existsSync(abs)) {
      violations.push({ file: e.file, rule: 'entry-stale', literal: e.literal, problem: 'the file is gone; the entry leaves with it' })
      continue
    }
    const stillThere = flaggedLiterals(abs).some((f) => f.literal === e.literal)
    if (!stillThere) {
      violations.push({
        file: e.file,
        rule: 'entry-stale',
        literal: e.literal,
        problem: 'the literal is no longer on the page; the entry must leave the list (it only shrinks)',
      })
    }
  }

  // The tripwire: every flagged literal on a promotion surface needs its
  // entry.
  for (const abs of scopeFiles()) {
    const rel = abs.slice(REPO.length + 1)
    for (const { rule, literal } of flaggedLiterals(abs)) {
      if (entryKeys.has(`${rel}${literal}`)) continue
      violations.push({
        file: rel,
        rule,
        literal,
        problem:
          'a model fact stated without derivation or a dated allowlist entry (src/data/model-content-allowlist.ts — the list only shrinks)',
      })
    }
  }

  // The SSOT pins, when the smart repo is declared.
  let smartVerified = 0
  let smartSkipped = 0
  for (const e of MODEL_CONTENT_ALLOWLIST) {
    for (const v of e.verify) {
      if (v.kind !== 'ssot' && v.kind !== 'ssot-clause') continue
      if (!smart.available) {
        smartSkipped++
        continue
      }
      smartVerified++
      const abs = join(SMART, v.path)
      let problem: string | null
      if (v.kind === 'ssot') {
        problem =
          existsSync(abs) && readFileSync(abs, 'utf-8').includes(v.needle)
            ? null
            : `the SSOT pin failed: ${v.path} does not carry ${JSON.stringify(v.needle)}`
      } else {
        problem = checkClausePin(abs, v.clause, v.text)
      }
      if (problem) {
        violations.push({ file: e.file, rule: `verify-${v.kind}`, literal: e.literal, problem })
      }
    }
  }
  return { violations, smartVerified, smartSkipped }
}

const isMain = process.argv[1] && process.argv[1].endsWith('check-model-content.ts')
if (isMain) {
  const { violations, smartVerified, smartSkipped } = checkModelContent()
  if (smartSkipped > 0) {
    console.warn(
      `model-content gate: SMART_REPO undeclared — ${smartSkipped} SSOT pins SKIP (set SMART_REPO or check out oimlsmart/smart beside this repo; never a false green)`,
    )
  }
  if (violations.length === 0) {
    console.log(
      `model-content gate: clean (${MODEL_CONTENT_ALLOWLIST.length}/${MODEL_CONTENT_CEILING} allowlisted facts, ${smartVerified} SSOT pins verified${smartSkipped ? `, ${smartSkipped} skipped` : ''})`,
    )
  } else {
    console.error('model-content gate: the promotion surfaces derive their model facts or carry dated pins. Violations:')
    for (const v of violations) console.error(`  ${v.file}  [${v.rule}] ${v.literal} — ${v.problem}`)
    process.exit(1)
  }
}
