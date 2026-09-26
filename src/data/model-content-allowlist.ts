// ─────────────────────────────────────────────────────────────────────
// model-content-allowlist.ts — the dated allowlist for the
// model-content rule (TODO.promotion/08), adapted from the smart
// repo's AGENTS.d/16 tripwire (browser/model-content-allowlist.yaml)
// to the www repo's surfaces.
//
// THE RULE: a promotion page stating a model fact (a clause id, a
// count, a requirement's semantics) either derives it from the SSOT at
// build time or carries a dated entry here. The tripwire
// (scripts/check-model-content.ts, ridden by src/model-content.test.ts)
// flags every model-fact-shaped literal on the promotion surfaces; an
// entry exempts exactly one (file, literal) pair, so a second literal
// on an exempted file still fails the gate.
//
// THE LIST ONLY SHRINKS: entries leave when the page derives the fact
// (the derive path) or drops it; adding an entry means bumping
// MODEL_CONTENT_CEILING in the same commit — a deliberate, reviewable
// act. The tripwire also fails on a STALE entry (its literal no longer
// on the page), so the list self-cleans toward zero.
//
// Every entry names its verification:
//   ssot        the needle is carried by a file in the smart repo
//               (checked when SMART_REPO is declared; skip-loud else)
//   ssot-clause the clause number + text are carried by a publication's
//               presentation tree in the smart repo (B 18, PD-05 — the
//               docs whose model is the presentation XML)
//   live        the fact is a live surface's own rendering, exercised
//               signed-in by the demo-liveness leg (nightly)
//   note        no mechanical pin exists today; the dated reason why
// ─────────────────────────────────────────────────────────────────────

export type ModelContentVerify =
  | { readonly kind: 'ssot'; readonly path: string; readonly needle: string }
  | { readonly kind: 'ssot-clause'; readonly path: string; readonly clause: string; readonly text: string }
  | { readonly kind: 'live'; readonly url: string; readonly account: string; readonly probe: string }
  | { readonly kind: 'note'; readonly why: string }

export interface ModelContentEntry {
  /** Repo-relative file the literal was flagged on. */
  readonly file: string
  /** The exact literal the tripwire flagged (one entry per pair). */
  readonly literal: string
  /** The model fact the page states, one line. */
  readonly fact: string
  /** The date the entry was recorded (YYYY-MM-DD). */
  readonly added: string
  /** Every pin must hold. */
  readonly verify: readonly ModelContentVerify[]
}

/** The only-shrinks pin: entries.length must stay at or below this.
 *  Bump it only in the commit that adds the entry, with the reason in
 *  the commit message. */
export const MODEL_CONTENT_CEILING = 26

const B018 = 'reference-docs/corpus/oiml-b018-e25/document.presentation.xml'
const PD05 = 'reference-docs/corpus/oiml-cs-pd-05/document.presentation.xml'
const R60_1 = 'browser/src/data/generated/standards-oiml-r60-data.ts'
const R60_2 = 'browser/src/data/generated/standards-oiml-r60-data.ts'
const R60_3 = 'browser/src/data/generated/standards-oiml-r60-data.ts'
const R60_2_ADOC = 'sources/r060/2/sections/02-type-evaluation.adoc'

/** B 18:2025's registered-copy clause: the 2025 edition carries it as
 *  14.8 (section 15 is the OIML-CS's finances). */
const B018_REGISTER = {
  kind: 'ssot-clause',
  path: B018,
  clause: '14.8',
  text: 'The only valid version of an OIML certificate',
} as const

/** The demo's R 60 requirements surface renders "14 classes containing
 *  180 requirements"; the demo-liveness leg asserts it nightly, signed
 *  in as the Utilizer officer (the Viewer persona was dropped
 *  2026-09-23 — certificates are public, and the Utilizer covers
 *  authenticated non-public reads; /app/standards/* stays open to
 *  every authenticated role). */
const R60_COUNTS = {
  kind: 'live',
  url: 'https://demo.oimlsmart.org/app/standards/r60/requirements',
  account: 'Utilizer Officer (NL)',
  probe: '14 classes containing 180 requirements',
} as const

const ADDED = '2026-09-01'

export const MODEL_CONTENT_ALLOWLIST: readonly ModelContentEntry[] = [
  {
    file: 'src/content/pages/about/audiences/corresponding-members.mdx',
    literal: '§14.8',
    fact: 'certificate validity reads the BIML-registered copy (B 18:2025 §14.8)',
    added: ADDED,
    verify: [B018_REGISTER],
  },
  {
    file: 'src/content/pages/about/audiences/corresponding-members.mdx',
    literal: '14 requirement classes',
    fact: 'R 60 as data: 14 requirement classes',
    added: ADDED,
    verify: [R60_COUNTS],
  },
  {
    file: 'src/content/pages/about/audiences/corresponding-members.mdx',
    literal: '180 requirements',
    fact: 'R 60 as data: 180 requirements',
    added: ADDED,
    verify: [R60_COUNTS],
  },
  {
    file: 'src/content/pages/about/audiences/instrument-users.mdx',
    literal: '§14.8',
    fact: 'the public register is the validity reference (B 18:2025 §14.8)',
    added: ADDED,
    verify: [B018_REGISTER],
  },
  {
    file: 'src/content/pages/about/audiences/issuing-authorities.mdx',
    literal: '§4.2.5',
    fact: 'type evaluation needs physical samples; the IA informs the number required (PD-05 §4.2.5)',
    added: ADDED,
    verify: [
      /* published §4.2.5; the tree's presentation XML autonums it 3.2.5 —
       * the off-by-one artifact, see the PD-05 note above the ia-intake
       * entries below */
      { kind: 'ssot-clause', path: PD05, clause: '3.2.5', text: 'number of samples of the type that are required' },
    ],
  },
  {
    file: 'src/content/pages/about/audiences/issuing-authorities.mdx',
    literal: '§4.7',
    fact: 'the sample selection for the evaluation follows R 60-3 §4.7',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_3, needle: 'urn:oiml:pub:r:60-3:2021#clause-4.7"' }],
  },
  {
    file: 'src/content/pages/about/audiences/issuing-authorities.mdx',
    literal: '§4.7.2',
    fact: 'the selection note rides R 60-3 §4.7.2',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_3, needle: 'urn:oiml:pub:r:60-3:2021#clause-4.7.2"' }],
  },
  {
    file: 'src/content/pages/about/audiences/member-states.mdx',
    literal: '§14.8',
    fact: 'verification reads the BIML-registered copy (B 18:2025 §14.8)',
    added: ADDED,
    verify: [B018_REGISTER],
  },
  {
    file: 'src/content/pages/about/audiences/member-states.mdx',
    literal: '180 requirements',
    fact: 'R 60 as data: 180 requirements (the count may wrap across a line break in the prose)',
    added: ADDED,
    verify: [R60_COUNTS],
  },
  {
    file: 'src/content/pages/about/audiences/one-pagers/member-states.mdx',
    literal: '180 requirements',
    fact: 'R 60 as data: 180 requirements',
    added: ADDED,
    verify: [R60_COUNTS],
  },
  {
    file: 'src/content/pages/technologies/smart-recommendations.mdx',
    literal: 'clause 5.2',
    fact: 'the provenance example is R 60-1:2021 clause 5.2',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_1, needle: 'urn:oiml:pub:r:60-1:2021#clause-5.2"' }],
  },
  {
    file: 'src/content/pages/technologies/smart-recommendations.mdx',
    literal: 'urn:oiml:pub:r:60-1:2021',
    fact: 'the source URN of the R 60-1:2021 provenance example',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_1, needle: 'urn:oiml:pub:r:60-1:2021' }],
  },
  {
    file: 'src/data/tour-slides.ts',
    literal: '§4.5',
    fact: 'the wizard’s instrument step renders the declaration R 60-3 §4.5 asks for',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_3, needle: 'urn:oiml:pub:r:60-3:2021#clause-4.5"' }],
  },
  {
    file: 'src/data/tour-slides.ts',
    literal: '180 requirements',
    fact: 'R 60 as data: 180 requirements',
    added: ADDED,
    verify: [R60_COUNTS],
  },
  {
    file: 'src/pages/demo/application.astro',
    literal: '§2.5',
    fact: 'the documentation checklist is the one R 60-2 §2.5 declares',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_2, needle: 'urn:oiml:pub:r:60-2:2021#clause-2.5"' }],
  },
  {
    file: 'src/pages/demo/application.astro',
    literal: '§4.5',
    fact: 'the instrument step renders the applicant declaration R 60-3 §4.5 asks for',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_3, needle: 'urn:oiml:pub:r:60-3:2021#clause-4.5"' }],
  },
  {
    file: 'src/pages/demo/ia-evaluation.astro',
    literal: '§14.8',
    fact: 'the register’s public face is readable by anyone (B 18:2025 §14.8)',
    added: ADDED,
    verify: [B018_REGISTER],
  },
  {
    file: 'src/pages/demo/ia-evaluation.astro',
    literal: '§5.1',
    fact: 'the IA sends each issued certificate to the BIML for registration (PD-05 §5.1)',
    added: ADDED,
    verify: [
      {
        kind: 'ssot-clause',
        path: PD05,
        clause: '5.1',
        text: 'send a copy of each OIML certificate it issues to the BIML',
      },
    ],
  },
  /* PD-05's published numbering (Ed 6 + Amd 1, urn:oiml:pub:cs:pd-05:2024) is
   * authoritative: the refusal grounds are §4.2.2 a–d, the written-reason
   * duty is §4.2.4, and the sample-count notice is §4.2.5. The smart tree's
   * presentation XML autonums them 3.2.2 / 3.2.4 / 3.2.5 — an off-by-one
   * artifact (the build drops the Introduction clause; doctrine: smart repo
   * analysis/pd05-ed6-cite-reconciliation.md, task E14 — never cite the
   * local XMLs' internal numbers). The pages cite the published numbers;
   * the pins below read the tree's internal ones. */
  {
    file: 'src/pages/demo/ia-intake.astro',
    literal: '§4.2.2',
    fact: 'the refusal grounds require clearly identified reasons (PD-05 §4.2.2)',
    added: ADDED,
    verify: [{ kind: 'ssot-clause', path: PD05, clause: '3.2.2', text: 'may refuse the application' }],
  },
  {
    file: 'src/pages/demo/ia-intake.astro',
    literal: '§4.2.4',
    fact: 'a refused application is answered in writing with the reason (PD-05 §4.2.4)',
    added: '2026-09-08',
    verify: [{ kind: 'ssot-clause', path: PD05, clause: '3.2.4', text: 'the reason shall be given' }],
  },
  {
    file: 'src/pages/demo/ia-intake.astro',
    literal: '§4.2.5',
    fact: 'the IA informs the applicant of the samples required for testing (PD-05 §4.2.5)',
    added: ADDED,
    verify: [
      { kind: 'ssot-clause', path: PD05, clause: '3.2.5', text: 'number of samples of the type that are required' },
    ],
  },
  {
    file: 'src/pages/demo/ia-intake.astro',
    literal: '§4.7',
    fact: 'the dispatch crosses the model’s test forms with the samples selected per R 60-3 §4.7',
    added: ADDED,
    verify: [{ kind: 'ssot', path: R60_3, needle: 'urn:oiml:pub:r:60-3:2021#clause-4.7"' }],
  },
  {
    file: 'src/pages/demo/tl-work.astro',
    literal: 'R 60-2 2.10/2.11',
    fact: 'the MDLO-first sequence is the model’s own gate (R 60-2 clauses 2.10 and 2.11)',
    added: ADDED,
    verify: [
      { kind: 'ssot', path: R60_2, needle: 'urn:oiml:pub:r:60-2:2021#clause-2.10"' },
      { kind: 'ssot', path: R60_2_ADOC, needle: '[[sec-2.11]]' },
    ],
  },
  {
    file: 'src/pages/services/demo.astro',
    literal: '§14.8',
    fact: 'the number lookup answers from the public BIML register (B 18:2025 §14.8)',
    added: ADDED,
    verify: [B018_REGISTER],
  },
  {
    file: 'src/pages/services/platform.astro',
    literal: '180 requirements',
    fact: 'R 60 as data: 180 requirements',
    added: ADDED,
    verify: [R60_COUNTS],
  },
]
