// ─────────────────────────────────────────────────────────────────────
// proof-map.ts — the claim→evidence map (TODO.promotion/08). ONE
// manifest for every promotion page: the claims the page makes and the
// proof anchors that back them, walked mechanically by the gates:
//
//   per-push (src/proof-map.test.ts): every promotion page is mapped;
//   every `site` anchor resolves to a route whose SOURCE carries the
//   probe; every `source` anchor's file carries the probe; every
//   `smart` anchor's file in the SSOT checkout carries the probe when
//   SMART_REPO is declared (skip-loud otherwise, the freshness-gate
//   posture — never a false green).
//
//   nightly (scripts/check-proof-map.ts --live): every `live` anchor is
//   fetched; the HTTP status must be in `expect` (default [200]) and a
//   2xx body must carry `probe` when one is declared. Where a content
//   probe is not feasible (a login-gated console, a client-rendered
//   app) the anchor says `skip:` with the reason — an honest skip,
//   printed in the report, never a silent pass.
//
// The anchor kinds:
//   site    a route of this site; the probe reads the route's source
//           (the page renders what its source carries).
//   source  a file in this repo (a data file a page renders from — the
//           probe pins the row the page quotes).
//   smart   a file in the smart repo (the SSOT): DEMO_FLOWS, the data
//           trees, the program record. Checked when SMART_REPO is
//           declared.
//   live    a URL on a running surface. Resolution is also lychee's
//           job per-push; the nightly adds the semantic layer (the
//           anchor still SHOWS what the page claims).
//
// A page stating a model fact (a clause id, a count) is NOT done by
// this map alone: the fact itself rides the model-content allowlist
// (src/data/model-content-allowlist.ts) — this map proves the CLAIM's
// evidence, that file pins the FACT.
// ─────────────────────────────────────────────────────────────────────

export type ProofAnchor =
  | { readonly kind: 'site'; readonly route: string; readonly probe: string }
  | { readonly kind: 'source'; readonly path: string; readonly probe: string }
  | { readonly kind: 'smart'; readonly path: string; readonly probe: string }
  | {
      readonly kind: 'live'
      readonly url: string
      /** A string a 2xx body must carry. Omit (with `skip`) where a
       *  content probe is not feasible. */
      readonly probe?: string
      /** Accepted HTTP statuses (default [200]) — an honest status the
       *  surface is documented to answer (the demo's 409 reseal window). */
      readonly expect?: readonly number[]
      /** Why no content probe is feasible. Printed, never silent. */
      readonly skip?: string
    }

export interface ProofClaim {
  /** Stable id: <page-slug>-<claim-slug>. */
  readonly id: string
  /** What the page claims, one line, close to the page's own words. */
  readonly says: string
  readonly anchors: readonly ProofAnchor[]
}

export interface ProofPage {
  /** The live route (e.g. /demo/application). */
  readonly route: string
  /** The repo-relative source the route renders from. */
  readonly source: string
  /** The screenshot-freshness declaration, present exactly when the
   *  page carries dated captures (the per-push leg proves both
   *  directions). `ttlDays` is the page's declared freshness budget,
   *  flagged by the nightly past it; `regenerate` is the command that
   *  re-captures the page's shots. */
  readonly shots?: {
    readonly ttlDays: number
    readonly regenerate: string
  }
  readonly claims: readonly ProofClaim[]
}

const DEMO = 'https://demo.oimlsmart.org'
const GATED = 'login-gated console; the demo-liveness playwright leg exercises it signed-in (nightly)'
const APP_SHELL = 'client-rendered app surface; resolution is asserted, the content probe is the demo-liveness leg (nightly)'

export const PROOF_MAP: readonly ProofPage[] = [
  // ── The Audiences section ─────────────────────────────────────────
  {
    route: '/audiences',
    source: 'src/pages/audiences/index.astro',
    claims: [
      {
        id: 'audiences-seven-pages',
        says: 'seven audiences, each with a concrete page answering what changes and what you can try now',
        anchors: [
          { kind: 'site', route: '/about/audiences/member-states', probe: 'For Member States' },
          { kind: 'site', route: '/about/audiences/laboratories', probe: 'For Test Laboratories' },
          { kind: 'site', route: '/about/audiences/one-pagers', probe: 'leave-behind' },
        ],
      },
      {
        id: 'audiences-try-now',
        says: 'every audience page ends at a live entry point (the demo, the register, the AI)',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/login`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/about/audiences',
    source: 'src/content/pages/about/audiences/index.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'audiences-index-overview',
        says: 'the seven audience answers with the live entry points (the demo login, the verify page, the AI)',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/login`, skip: APP_SHELL },
          { kind: 'live', url: `${DEMO}/app/verify/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/member-states',
    source: 'src/content/pages/about/audiences/member-states.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'member-states-verify',
        says: 'verify any certificate your regime relies on, in seconds, reading the BIML-registered copy (B 18:2025 §14.8)',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/verify/`, skip: APP_SHELL },
          { kind: 'smart', path: 'data/oiml-b018-e25/document.presentation.xml', probe: 'registered and published on the OIML-CS pages' },
        ],
      },
      {
        id: 'member-states-entitlement',
        says: 'the self-host entitlement attaches to the Member State, with streaming updates',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: "'streaming'" },
          { kind: 'site', route: '/services/who-can-run-what', probe: 'Who can run what' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/corresponding-members',
    source: 'src/content/pages/about/audiences/corresponding-members.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'corresponding-members-parity',
        says: 'the same information and the same evidence as Member States, every hosted service with nothing to run',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'corresponding-member' },
          { kind: 'site', route: '/services/who-can-run-what', probe: 'Who can run what' },
        ],
      },
      {
        id: 'corresponding-members-register',
        says: 'the public register is browsable without an account',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/register/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/issuing-authorities',
    source: 'src/content/pages/about/audiences/issuing-authorities.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'issuing-authorities-workflow',
        says: 'the OIML-CS as a digital workflow: applications, samples, dispatch, evaluation, certificates',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/ia/`, skip: GATED },
          { kind: 'smart', path: 'DEMO_FLOWS/02-ia-intake.md', probe: 'ia_officer' },
        ],
      },
      {
        id: 'issuing-authorities-samples',
        says: 'type evaluation needs physical samples (PD-05 §3.2.5) and the decision acts stay closed until they are received',
        anchors: [
          { kind: 'smart', path: 'data/oiml-cs-pd-05/document.presentation.xml', probe: 'number of samples of the type that are required' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/laboratories',
    source: 'src/content/pages/about/audiences/laboratories.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'laboratories-workbench',
        says: 'the workbench walks the procedure step by step, evidence captured at the moment of work',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/lab/`, skip: GATED },
          { kind: 'smart', path: 'DEMO_FLOWS/03-tl-work.md', probe: 'tl_operator' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/manufacturers',
    source: 'src/content/pages/about/audiences/manufacturers.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts --drive' },
    claims: [
      {
        id: 'manufacturers-apply-once',
        says: 'apply once against the Recommendation’s model, follow the evaluation live, receive a certificate anyone can verify',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/portal/applications/new`, skip: GATED },
          { kind: 'site', route: '/demo/application', probe: 'model-derived' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/instrument-users',
    source: 'src/content/pages/about/audiences/instrument-users.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-audiences.ts' },
    claims: [
      {
        id: 'instrument-users-verify',
        says: 'verify any certificate yourself, in seconds, without an account',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/verify/`, skip: APP_SHELL },
          { kind: 'live', url: `${DEMO}/app/register/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/educators',
    source: 'src/content/pages/about/audiences/educators.mdx',
    claims: [
      {
        id: 'educators-classroom',
        says: 'the classroom: a layered curriculum where you certify a simulated load cell before touching a real instrument',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/recs/docs/oiml-rec/13-running-the-demo', probe: 'Running the Demo' },
          { kind: 'live', url: 'https://primmel.github.io/primmel-smart-docs/learn/', probe: 'curriculum' },
        ],
      },
    ],
  },
  // ── The one-pagers (the CIML leave-behind) ────────────────────────
  {
    route: '/about/audiences/one-pagers',
    source: 'src/content/pages/about/audiences/one-pagers/index.mdx',
    claims: [
      {
        id: 'one-pagers-seven-sheets',
        says: 'each of the seven audience pages condensed to a single printable sheet',
        anchors: [
          { kind: 'site', route: '/about/audiences/one-pagers/member-states', probe: 'one page' },
          { kind: 'site', route: '/tour', probe: 'The CIML tour' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/member-states',
    source: 'src/content/pages/about/audiences/one-pagers/member-states.mdx',
    claims: [
      {
        id: 'one-pager-member-states',
        says: 'the member-state sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'member-state' },
          { kind: 'site', route: '/about/audiences/member-states', probe: 'For Member States' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/corresponding-members',
    source: 'src/content/pages/about/audiences/one-pagers/corresponding-members.mdx',
    claims: [
      {
        id: 'one-pager-corresponding-members',
        says: 'the corresponding-member sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'corresponding-member' },
          { kind: 'site', route: '/about/audiences/corresponding-members', probe: 'For Corresponding Members' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/issuing-authorities',
    source: 'src/content/pages/about/audiences/one-pagers/issuing-authorities.mdx',
    claims: [
      {
        id: 'one-pager-issuing-authorities',
        says: 'the IA sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'ia-tl' },
          { kind: 'site', route: '/about/audiences/issuing-authorities', probe: 'For Issuing Authorities' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/laboratories',
    source: 'src/content/pages/about/audiences/one-pagers/laboratories.mdx',
    claims: [
      {
        id: 'one-pager-laboratories',
        says: 'the laboratory sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'ia-tl' },
          { kind: 'site', route: '/about/audiences/laboratories', probe: 'For Test Laboratories' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/manufacturers',
    source: 'src/content/pages/about/audiences/one-pagers/manufacturers.mdx',
    claims: [
      {
        id: 'one-pager-manufacturers',
        says: 'the manufacturer sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'applicant-public' },
          { kind: 'site', route: '/about/audiences/manufacturers', probe: 'For Manufacturers' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/instrument-users',
    source: 'src/content/pages/about/audiences/one-pagers/instrument-users.mdx',
    claims: [
      {
        id: 'one-pager-instrument-users',
        says: 'the instrument-user sheet quotes the entitlement row, never paraphrases it',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'utilizer-associate' },
          { kind: 'site', route: '/about/audiences/instrument-users', probe: 'For Instrument Users' },
        ],
      },
    ],
  },
  {
    route: '/about/audiences/one-pagers/educators',
    source: 'src/content/pages/about/audiences/one-pagers/educators.mdx',
    claims: [
      {
        id: 'one-pager-educators',
        says: 'the educators sheet condenses the audience page and its classroom entry',
        anchors: [
          { kind: 'site', route: '/about/audiences/educators', probe: 'For Educators' },
        ],
      },
    ],
  },
  // ── The Technologies section ──────────────────────────────────────
  {
    route: '/technologies',
    source: 'src/pages/technologies/index.astro',
    claims: [
      {
        id: 'technologies-eight-pages',
        says: 'the eight technology pages, each answering what-it-is, who-it-is-for, how-it-works, try-it',
        anchors: [
          { kind: 'site', route: '/technologies/cnml', probe: 'What you can do today' },
          { kind: 'site', route: '/technologies/primmel', probe: 'What you can do today' },
        ],
      },
    ],
  },
  {
    route: '/technologies/cnml',
    source: 'src/content/pages/technologies/cnml.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only cnml' },
    claims: [
      {
        id: 'cnml-verify-offline',
        says: 'a CNML certificate is verifiable by anyone, account-free, offline (the nine-check pipeline in the browser)',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/cnml/verify', probe: 'offline' },
        ],
      },
      {
        id: 'cnml-vc-export',
        says: 'the demo certificate exports as a W3C Verifiable Credential (vc+jwt, ES256)',
        anchors: [
          {
            kind: 'live',
            url: `${DEMO}/api/certificates/crt-acme-lc/vc`,
            expect: [200, 409],
            skip: 'the demo reseeds nightly and the endpoint honestly answers 409 until the signing gate re-seals the worked certificate (the page says so); 200 carries the vc+jwt',
          },
        ],
      },
    ],
  },
  {
    route: '/technologies/dataspace-interop',
    source: 'src/content/pages/technologies/dataspace-interop.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only dataspace-interop' },
    claims: [
      {
        id: 'dataspace-standards-map',
        says: 'the estate speaks the neighboring standards: the Dataspace Protocol, ODRL 2.2, the IDS Reference Architecture Model',
        anchors: [
          { kind: 'live', url: 'https://www.w3.org/TR/odrl-model/', probe: 'ODRL' },
          {
            kind: 'live',
            url: 'https://docs.internationaldataspaces.org/ids-knowledgebase/ids-ram-4/',
            skip: 'a JS-redirect shell into the IDS knowledgebase; resolution is asserted, the content is the knowledgebase’s own',
          },
        ],
      },
    ],
  },
  {
    route: '/technologies/identity-federation',
    source: 'src/content/pages/technologies/identity-federation.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only identity-federation' },
    claims: [
      {
        id: 'identity-one-account',
        says: 'one account across the estate: the identity service is the single OpenID Provider, discoverable anonymously',
        anchors: [
          { kind: 'live', url: 'https://id.oimlsmart.org/.well-known/openid-configuration', probe: 'issuer' },
        ],
      },
      {
        id: 'identity-self-host',
        says: 'members may run their own provider from the same software',
        anchors: [
          { kind: 'live', url: 'https://github.com/oimlsmart/identity/blob/main/docs/deployment/identity-self-host.md', probe: 'identity-self-host' },
        ],
      },
    ],
  },
  {
    route: '/technologies/primmel',
    source: 'src/content/pages/technologies/primmel.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only primmel' },
    claims: [
      {
        id: 'primmel-conformance-suite',
        says: 'the public conformance suite pairs a versioned clause map with a corpus of valid and invalid documents',
        anchors: [
          { kind: 'live', url: 'https://github.com/primmel/primmel-ts/tree/v1/conformance', probe: 'conformance' },
        ],
      },
      {
        id: 'primmel-studio-viewer',
        says: 'any package renders in the browser, no install',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/studio/view/', probe: 'Studio' },
        ],
      },
    ],
  },
  {
    route: '/technologies/smart-recommendations',
    source: 'src/content/pages/technologies/smart-recommendations.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only smart-recommendations' },
    claims: [
      {
        id: 'smart-recommendations-provenance',
        says: 'every content element carries its source clause (urn:oiml:pub:r:60-1:2021, clause 5.2)',
        anchors: [
          { kind: 'smart', path: 'data/r60/sources-prd/r60-1.prd.yaml', probe: 'clause: "5.2"' },
          {
            kind: 'live',
            url: 'https://www.oimlsmart.org/recs/',
            skip: 'the references render inline in the recs client app; the fetch proves the surface answers, the display is the app\u2019s job',
          },
        ],
      },
      {
        id: 'smart-recommendations-live-render',
        says: 'the Recommendations render live as data (the recs minisite)',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/recs/', probe: 'SMART Recommendations' },
        ],
      },
    ],
  },
  {
    route: '/technologies/smart-twin',
    source: 'src/content/pages/technologies/smart-twin.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only smart-twin' },
    claims: [
      {
        id: 'smart-twin-console',
        says: 'the standard declares the served interface and the compliance engine judges the served evidence continuously',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/twin`, skip: GATED },
          { kind: 'live', url: `${DEMO}/app/twin-lab`, skip: GATED },
        ],
      },
    ],
  },
  {
    route: '/technologies/sst',
    source: 'src/content/pages/technologies/sst.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only sst' },
    claims: [
      {
        id: 'sst-bench',
        says: 'simulated SMART Twins with realistic physics behind the governed twin interface',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/sst/', probe: 'simulation' },
          { kind: 'live', url: 'https://github.com/primmel/sst', probe: 'primmel/sst' },
        ],
      },
    ],
  },
  {
    route: '/technologies/trust-registry',
    source: 'src/content/pages/technologies/trust-registry.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-technologies.ts --only trust-registry' },
    claims: [
      {
        id: 'trust-registry-anonymous-resolution',
        says: 'each organization’s signing keys and standing resolve in one anonymous request, and unknown organizations are refused honestly',
        anchors: [
          { kind: 'live', url: 'https://id.oimlsmart.org/op/keys/ms-de.json', probe: '"org_id":"ms-de"' },
          {
            kind: 'live',
            url: 'https://id.oimlsmart.org/op/keys/EX1.json',
            expect: [404],
            probe: 'not on the organization registry',
            skip: 'the honest refusal IS the proof here: production never seeds the demo organizations and the 404 body says so (lychee.toml carries the same exclusion)',
          },
          { kind: 'live', url: `${DEMO}/.well-known/did.json`, probe: 'verificationMethod' },
        ],
      },
    ],
  },
  // ── The Use Cases section ─────────────────────────────────────────
  {
    route: '/use-cases',
    source: 'src/pages/use-cases/index.astro',
    claims: [
      {
        id: 'use-cases-six-stories',
        says: 'the canonical stories in plain language: the end-to-end arc, the deployment matrix, the member-state view, the ANR flow, the SST training, the twin story',
        anchors: [
          { kind: 'site', route: '/use-cases/type-evaluation-end-to-end', probe: 'Type evaluation' },
          { kind: 'site', route: '/use-cases/deployment-modes', probe: 'deployment' },
        ],
      },
    ],
  },
  {
    route: '/use-cases/type-evaluation-end-to-end',
    source: 'src/content/pages/use-cases/type-evaluation-end-to-end.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts' },
    claims: [
      {
        id: 'type-evaluation-arc',
        says: 'the canonical OIML-CS arc as one continuous story, every step tryable on the demo',
        anchors: [
          { kind: 'site', route: '/demo/application', probe: 'the manufacturer applies' },
          { kind: 'live', url: `${DEMO}/app/ia/applications/app-acme-lc`, skip: GATED },
        ],
      },
    ],
  },
  {
    route: '/use-cases/deployment-modes',
    source: 'src/content/pages/use-cases/deployment-modes.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts --only=hub-login,nmi-instance,tl-instance' },
    claims: [
      {
        id: 'deployment-modes-four-postures',
        says: 'one codebase, four postures: the CS-operated platform, IA-only, TL-only, the combined instance',
        anchors: [
          { kind: 'live', url: 'https://nmi.oimlsmart.org/', probe: 'OIML' },
          { kind: 'live', url: 'https://tl.oimlsmart.org/', probe: 'OIML' },
        ],
      },
    ],
  },
  {
    route: '/use-cases/member-state-view',
    source: 'src/content/pages/use-cases/member-state-view.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts' },
    claims: [
      {
        id: 'member-state-view-registry',
        says: 'a member state’s officers follow their designations and their authority’s issued work, every certificate answering to the registry',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/cs/participants`, skip: GATED },
          { kind: 'live', url: `${DEMO}/app/register/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/use-cases/additional-national-requirements',
    source: 'src/content/pages/use-cases/additional-national-requirements.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts --only=anr,wizard-anr-step' },
    claims: [
      {
        id: 'anr-moderation',
        says: 'the Utilizer declares ANRs, moderation keeps only APPROVED live, and the certificate covers the declared set',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/cs/anr/`, skip: GATED },
          { kind: 'smart', path: 'data/r60/anr/DE/anr.yaml', probe: 'MessEG' },
        ],
      },
    ],
  },
  {
    route: '/use-cases/training-on-the-sst',
    source: 'src/content/pages/use-cases/training-on-the-sst.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts --only=sim-bench,sst-site' },
    claims: [
      {
        id: 'training-sst-rehearsal',
        says: 'a laboratory rehearses the full test program on the simulated instrument before touching hardware',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/sim`, skip: GATED },
          { kind: 'live', url: 'https://www.oimlsmart.org/sst/', probe: 'simulation' },
        ],
      },
    ],
  },
  {
    route: '/use-cases/continuous-compliance',
    source: 'src/content/pages/use-cases/continuous-compliance.mdx',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-usecases.ts --only=twin,certificate-lifecycle' },
    claims: [
      {
        id: 'continuous-compliance-twin',
        says: 'the SMART+ story: the live twin monitored against the Recommendation’s promises, roadmap-anchored throughout',
        anchors: [
          { kind: 'site', route: '/technologies/smart-twin', probe: 'SMART+' },
          { kind: 'live', url: `${DEMO}/app/standards/r60/certificates/crt-acme-lc`, skip: GATED },
        ],
      },
    ],
  },
  // ── The Services section ──────────────────────────────────────────
  {
    route: '/services',
    source: 'src/pages/services/index.astro',
    claims: [
      {
        id: 'services-directory',
        says: 'the services directory: each service with its live proof and its entitlement answer',
        anchors: [
          { kind: 'site', route: '/services/who-can-run-what', probe: 'Who can run what' },
          { kind: 'site', route: '/services/status', probe: 'status' },
        ],
      },
    ],
  },
  {
    route: '/services/who-can-run-what',
    source: 'src/pages/services/who-can-run-what.astro',
    claims: [
      {
        id: 'entitlement-matrix-one-source',
        says: 'the authoritative use-vs-self-host matrix by member category, quoted by every page, never paraphrased',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'ENTITLEMENT_MATRIX' },
        ],
      },
      {
        id: 'entitlement-matrix-ms-vs-cm',
        says: 'Member States hold the self-host entitlement with streaming updates; Corresponding Members use every hosted service with nothing to run',
        anchors: [
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: "'streaming'" },
          { kind: 'source', path: 'src/data/entitlement-matrix.ts', probe: 'the hosted path never requires' },
        ],
      },
    ],
  },
  {
    route: '/services/ai',
    source: 'src/pages/services/ai.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=ai' },
    claims: [
      {
        id: 'services-ai-cited-answers',
        says: 'answers cite the exact publication, edition, and clause; off-corpus questions get a plain refusal',
        anchors: [
          { kind: 'live', url: 'https://ai.oimlsmart.org/', probe: 'Ask' },
        ],
      },
    ],
  },
  {
    route: '/services/demo',
    source: 'src/pages/services/demo.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=demo' },
    claims: [
      {
        id: 'services-demo-instance',
        says: 'the demo instance: the fictional cast, the nightly reset, the five flows walkable',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/login`, skip: APP_SHELL },
          { kind: 'site', route: '/demo', probe: 'walkthrough' },
        ],
      },
    ],
  },
  {
    route: '/services/identity',
    source: 'src/pages/services/identity.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=identity' },
    claims: [
      {
        id: 'services-identity-service',
        says: 'the identity service: the estate’s accounts, the join flow, the member directory',
        anchors: [
          { kind: 'live', url: 'https://id.oimlsmart.org/', probe: 'Sign in' },
          { kind: 'live', url: 'https://id.oimlsmart.org/op/join', probe: 'OIML' },
        ],
      },
    ],
  },
  {
    route: '/services/platform',
    source: 'src/pages/services/platform.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=platform' },
    claims: [
      {
        id: 'services-platform-instances',
        says: 'the platform and its instances: the CS-operated demo, the member postures from the same codebase',
        anchors: [
          { kind: 'live', url: `${DEMO}/`, skip: APP_SHELL },
          { kind: 'site', route: '/platform', probe: 'The OIML SMART Platform' },
        ],
      },
    ],
  },
  {
    route: '/services/status',
    source: 'src/pages/services/status.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=status' },
    claims: [
      {
        id: 'services-status-board',
        says: 'the status service publishes the estate’s live state',
        anchors: [
          { kind: 'live', url: 'https://status.oimlsmart.org/', probe: 'OIML' },
        ],
      },
    ],
  },
  {
    route: '/services/studio-viewer',
    source: 'src/pages/services/studio-viewer.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=studio' },
    claims: [
      {
        id: 'services-studio-viewer',
        says: 'the studio viewer renders any Primmel package in the browser',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/studio/view/', probe: 'Studio' },
        ],
      },
    ],
  },
  {
    route: '/services/vocab',
    source: 'src/pages/services/vocab.astro',
    shots: { ttlDays: 60, regenerate: 'npx tsx scripts/capture-services.ts --only=vocab' },
    claims: [
      {
        id: 'services-vocab-service',
        says: 'the vocabulary service serves the metrology vocabulary as data',
        anchors: [
          { kind: 'live', url: 'https://www.oimlsmart.org/vocab/', probe: 'Vocab' },
        ],
      },
    ],
  },
  // ── The demo-flow walkthroughs ────────────────────────────────────
  {
    route: '/demo',
    source: 'src/pages/demo/index.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=login,guided' },
    claims: [
      {
        id: 'demo-index-six-flows',
        says: 'the guided walkthroughs: the full certification arc, narrated step by step with dated captures and live links',
        anchors: [
          { kind: 'site', route: '/demo/application', probe: 'the manufacturer applies' },
          { kind: 'site', route: '/demo/audit-findings', probe: 'audit' },
        ],
      },
      {
        id: 'demo-index-guided-demo',
        says: 'the demo’s own guided tour starts from the login page',
        anchors: [
          { kind: 'live', url: `${DEMO}/app/login`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/demo/application',
    source: 'src/pages/demo/application.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=application,wizard,portal --drive' },
    claims: [
      {
        id: 'application-model-derived-step',
        says: 'the wizard’s instrument step is authored by the R 60 model (the R 60-3 §4.5 declaration), never designed by a programmer',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/01-application.md', probe: 'Select Recommendation' },
          { kind: 'smart', path: 'data/r60/sources-prd/r60-3.prd.yaml', probe: 'clause: "4.5"' },
          { kind: 'live', url: `${DEMO}/app/portal/applications/new`, skip: GATED },
        ],
      },
    ],
  },
  {
    route: '/demo/ia-intake',
    source: 'src/pages/demo/ia-intake.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=ia-intake' },
    claims: [
      {
        id: 'ia-intake-due-process',
        says: 'rejection requires the reason (PD-05 §3.2.2) and acceptance waits for the physical samples (PD-05 §3.2.5)',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/02-ia-intake.md', probe: 'ia_officer' },
          { kind: 'smart', path: 'data/oiml-cs-pd-05/document.presentation.xml', probe: 'other clearly identified reasons' },
          { kind: 'live', url: `${DEMO}/app/ia`, skip: GATED },
        ],
      },
    ],
  },
  {
    route: '/demo/tl-work',
    source: 'src/pages/demo/tl-work.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=tl,login' },
    claims: [
      {
        id: 'tl-work-model-driven-run',
        says: 'the run’s step wizard walks the declared procedure from the model, each acceptance criterion read from it',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/03-tl-work.md', probe: 'tl_operator' },
          { kind: 'live', url: `${DEMO}/app/lab/`, skip: GATED },
        ],
      },
    ],
  },
  {
    route: '/demo/ia-evaluation',
    source: 'src/pages/demo/ia-evaluation.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=ia-evaluation' },
    claims: [
      {
        id: 'ia-evaluation-to-register',
        says: 'evaluation to certificate to BIML registration (PD-05 §5.1) to the public register, readable by anyone (B 18:2025 §14.8)',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/04-ia-evaluation.md', probe: 'certification_officer' },
          { kind: 'smart', path: 'data/oiml-cs-pd-05/document.presentation.xml', probe: 'send a copy of each OIML certificate it issues to the BIML' },
          { kind: 'live', url: `${DEMO}/app/register/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/demo/applicant-journey',
    source: 'src/pages/demo/applicant-journey.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=applicant-journey' },
    claims: [
      {
        id: 'applicant-journey-loop-closed',
        says: 'the applicant follows the evaluation live and the certificate verifies publicly at the end',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/05-applicant-journey.md', probe: 'the applicant' },
          { kind: 'live', url: `${DEMO}/app/portal/`, skip: GATED },
          { kind: 'live', url: `${DEMO}/app/verify/`, skip: APP_SHELL },
        ],
      },
    ],
  },
  {
    route: '/demo/audit-findings',
    source: 'src/pages/demo/audit-findings.astro',
    shots: { ttlDays: 30, regenerate: 'npx tsx scripts/capture-walkthroughs.ts --only=guided-demo' },
    claims: [
      {
        id: 'audit-findings-honest-gaps',
        says: 'the audit’s per-step verdicts and the gap cluster the build answers, named honestly',
        anchors: [
          { kind: 'smart', path: 'DEMO_FLOWS/06-audit-findings.md', probe: 'gap cluster' },
        ],
      },
    ],
  },
  // ── The CIML tour ─────────────────────────────────────────────────
  {
    route: '/tour',
    source: 'src/pages/tour/index.astro',
    shots: {
      ttlDays: 30,
      regenerate: 'npx tsx scripts/capture-walkthroughs.ts (the tour’s fallbacks are the walkthrough captures), then bump TOUR_CAPTURED in src/data/tour-slides.ts',
    },
    claims: [
      {
        id: 'tour-live-steps',
        says: 'every demo moment names the exact live console and step, with the dated fallback capture for the no-network room',
        anchors: [
          { kind: 'source', path: 'src/data/tour-slides.ts', probe: 'TOUR_SLIDES' },
          { kind: 'live', url: `${DEMO}/app/login`, skip: APP_SHELL },
        ],
      },
      {
        id: 'tour-deep-links',
        says: 'every slide has a stable address (/tour#s07 addresses the seventh slide directly)',
        anchors: [
          { kind: 'source', path: 'src/data/tour-slides.ts', probe: "'s07'" },
        ],
      },
    ],
  },
  {
    route: '/tour/notes',
    source: 'src/pages/tour/notes.astro',
    claims: [
      {
        id: 'tour-notes-cuts',
        says: 'the presenter notes carry the two cuts (5 and 20 minutes) with the per-slide talk track and the rehearsal record',
        anchors: [
          { kind: 'source', path: 'src/data/tour-slides.ts', probe: 'TOUR_REHEARSED' },
          { kind: 'site', route: '/tour', probe: 'The CIML tour' },
        ],
      },
    ],
  },
]
