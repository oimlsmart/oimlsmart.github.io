// ─────────────────────────────────────────────────────────────────────
// tour-slides.ts — the ONE source for the CIML tour (TODO.promotion/07):
// the deck at /tour renders from these definitions and the presenter
// notes at /tour/notes read the same list, so the two surfaces can never
// drift apart. Every demo moment names the exact live console/step (the
// link vocabulary the demo-flow walkthroughs established in wave 06) and
// the dated fallback capture for the no-network room. Claims link to
// proofs; futures carry the SMART+ chip.
// ─────────────────────────────────────────────────────────────────────

/** The capture date of the walkthrough fallback screenshots the tour
 *  reuses (scripts/capture-walkthroughs.ts, wave 06). */
export const TOUR_CAPTURED = '2026-09-01'

/** The date of the recorded rehearsal walks (two full passes, logged on
 *  the notes page). Filled by the rehearsal leg of the wave. */
export const TOUR_REHEARSED = '2026-09-01'

export interface TourLink {
  readonly href: string
  readonly label: string
  readonly desc?: string
}

export interface TourLiveStep {
  /** The exact live URL of the demo moment (the walkthrough vocabulary). */
  readonly href: string
  /** The demo account the moment is performed with ("no account" for the
   *  public surfaces). */
  readonly account: string
  /** The console path the account works in. */
  readonly console: string
  /** One line: what to do live when the network allows. */
  readonly action: string
  /** The fallback capture under /img/walkthroughs/<page>/<stem>-*.png. */
  readonly shot: {
    readonly page: string
    readonly stem: string
    readonly dark: boolean
    readonly alt: string
  }
  /** The walkthrough page that narrates the whole flow. */
  readonly walkthrough: TourLink
}

export interface TourSlideDef {
  /** The deep-link id: /tour#s07 addresses this slide directly. */
  readonly id: string
  /** The eyebrow line over the title. */
  readonly kicker: string
  readonly title: string
  /** The honesty chip: SMART is live today, SMART+ is the labeled vision. */
  readonly chip?: 'SMART' | 'SMART+'
  /** The slide's one-line message. */
  readonly lede: string
  /** The body beats (plain copy; links ride the link row). */
  readonly bullets?: readonly string[]
  /** The link row: every claim's proof, one click away. */
  readonly links?: readonly TourLink[]
  /** The demo moment (flow slides): the live step + the dated fallback. */
  readonly live?: TourLiveStep
  /** The one diagram, where the slide carries one. */
  readonly diagram?: 'estate-map'
  /** The presenter note: the talk track, what to click, the fallback. */
  readonly note: string
  /** The fast-forward beat (TODO.demo-ops/07, the audience fast-forward):
   *  the flow slides' waiting states carry the demo instance's Advance
   *  control, which drives the OTHER role's real act through the platform
   *  when the story would stall on it. The presenter line names the beat
   *  in the control's own words; the notes page renders it per slide and
   *  per cut. Demo instances only — a production instance never renders
   *  the control. */
  readonly fastForward?: string
  /** The at-time in the 5-minute cut, when the slide rides it. */
  readonly fiveMin?: string
  /** The at-time in the 20-minute cut. */
  readonly twentyMin: string
}

export const TOUR_SLIDES: readonly TourSlideDef[] = [
  {
    id: 's01',
    kicker: 'The CIML tour',
    title: 'The Digital OIML, live',
    lede: 'The OIML SMART estate as a guided tour: every claim one click from a running proof, every demo moment playable live or read from a dated capture.',
    bullets: [
      'Nineteen slides, two cuts: the 5-minute committee slot and the 20-minute working visit. The presenter notes carry both, with the recorded rehearsal timings.',
      'Navigate with the arrow keys, the on-screen buttons, or a clicker. Every slide has a stable address: /tour#s07 goes straight to the seventh slide.',
      'The honesty rules: everything on the demo instance is simulated (a fictional cast, a nightly reset), and every future is labeled SMART+.',
    ],
    links: [
      { href: '/tour/notes', label: 'The presenter notes', desc: 'the two cuts, the per-slide talk track, the rehearsal record' },
      { href: '/about/audiences/one-pagers/', label: 'The leave-behind', desc: 'seven per-audience one-pagers, printable' },
      { href: 'https://demo.oimlsmart.org/app/login', label: 'The live demo', desc: 'one-click demo accounts, no registration' },
    ],
    note: 'Frame it in one breath: the OIML-CS certification chain, running as software, with the committee\'s text still the source. Say the honesty rules up front: the demo is simulated, the futures are labeled, and every claim on every slide links its proof. If the room has no network, every demo moment below shows its dated capture instead.',
    fiveMin: '0:00',
    twentyMin: '0:00',
  },
  {
    id: 's02',
    kicker: 'The problem, said kindly',
    title: 'Certification runs on documents, and it works',
    lede: 'Today\'s chain is careful people re-keying careful documents at every hand-off. The medium is lossy; the people are not the problem.',
    bullets: [
      'The Recommendation is a PDF. Every tool that touches it, the application form, the test bench, the report template, re-encodes it by hand, and every re-encoding drifts a little from the text.',
      'The application is a scanned form and an email; the test report is a PDF re-typed at the authority; the certificate is a signed PDF, verified by a phone call to the issuer.',
      'None of this is broken. It is the best the portable document could do. The cost is paid quietly: in transcription, in drift, in waiting, and in evidence nobody can query.',
    ],
    links: [
      { href: '/use-cases/type-evaluation-end-to-end', label: 'The end-to-end story', desc: 'the same arc, told as one continuous use case' },
    ],
    note: 'Say it kindly and mean it: the current system works, and the people in it are careful. The problem is structural: every hand-off re-keys information, and every re-keying is a chance to drift. No blame in this slide; the room should recognize their day, not feel criticized.',
    fiveMin: '0:30',
    twentyMin: '1:00',
  },
  {
    id: 's03',
    kicker: 'The estate, one picture',
    title: 'The estate map',
    lede: 'One model at the center, everything else derived: the page you read, the form you fill, the verdict computed, the certificate signed, the register that answers.',
    diagram: 'estate-map',
    links: [
      { href: '/architecture', label: 'The component map', desc: 'the repositories, the SSOT flow, the live gate numbers' },
      { href: '/services/', label: 'The services directory', desc: 'each service with its live proof' },
    ],
    note: 'Thirty seconds on the whole picture: the Recommendation model is the single source at the center; the platform derives the workflow surfaces from it; the services (identity, vocab, AI, status) stand beside it; member instances run the same codebase in their own postures; the public surfaces (register, verification) answer without an account. Do not read the diagram box by box; the derivation arrows are the message.',
    fiveMin: '1:15',
    twentyMin: '2:30',
  },
  {
    id: 's04',
    kicker: 'Flow 01 · the application',
    title: 'The form is the Recommendation',
    lede: 'The manufacturer applies in a wizard whose instrument form the R 60 model itself authors. Change the Recommendation and the form changes.',
    chip: 'SMART',
    bullets: [
      'The first pick is the Recommendation, explicitly, with its edition; everything downstream derives from it.',
      'The instrument step renders the declaration R 60-3 §4.5 asks for, with the model\'s own guidance on every field.',
      'The authority is picked from scoped cards; only authorities that can take R 60 are shown.',
    ],
    live: {
      href: 'https://demo.oimlsmart.org/app/portal/applications/new',
      account: 'Applicant',
      console: '/app/portal/applications/new',
      action: 'Sign in as the Applicant, open the new-application wizard, pick R 60, and watch the instrument step render from the model.',
      shot: {
        page: 'application',
        stem: 'wizard-instrument',
        dark: true,
        alt: 'The wizard\'s instrument step: the LC-500 family picked and a model placed in scope, on the form the R 60 model authors.',
      },
      walkthrough: { href: '/demo/application', label: 'Walkthrough 01', desc: 'the application, six steps narrated' },
    },
    note: 'The tour\'s first live moment. Click into the wizard as the Applicant and dwell on the instrument step: the form was not designed by a programmer, the R 60 model authors it, clause and all. No network: the dated capture shows exactly that step. The full narration is walkthrough 01.',
    fastForward: 'The submit lands the story on the authority\'s desk, and the application\'s page never stalls there: its waiting card\'s Advance control drives the authority\'s real act — "the Issuing Authority reviews the application and requests the samples" — the audit trail naming you, the presenter, with the role advanced.',
    fiveMin: '2:00',
    twentyMin: '3:30',
  },
  {
    id: 's05',
    kicker: 'Flow 02 · the authority\'s intake',
    title: 'The honest reject-or-accept',
    lede: 'The application lands in the authority\'s review queue, oldest first. The accept opens the evaluation project: the shared dataspace the three parties work in.',
    chip: 'SMART',
    bullets: [
      'The review queue shows every waiting application with its age on the row; nothing waits silently.',
      'The reject is honest: a reason, recorded, returned to the applicant. The accept opens the evaluation project.',
      'Samples, custody, and the dispatch to the laboratory ride the same project; the laboratory sees exactly what the authority sent.',
    ],
    live: {
      href: 'https://demo.oimlsmart.org/app/ia',
      account: 'Issuing Authority',
      console: '/app/ia',
      action: 'Sign in as the Issuing Authority and open the review queue; the waiting application is flow 01\'s submit, seen from the other side.',
      shot: {
        page: 'ia-intake',
        stem: 'review-queue',
        dark: false,
        alt: 'The IA console\'s review queue holding the waiting application, oldest first, with its Recommendation, applicant, and age.',
      },
      walkthrough: { href: '/demo/ia-intake', label: 'Walkthrough 02', desc: 'the intake, eight steps narrated' },
    },
    note: 'The same submit from the other side of the desk. Live: the Issuing Authority account, the review queue, and if the room wants it, the reject-with-reason (the instance resets nightly, so perform it freely). The evaluation project is the word to land: the shared dataspace, not an email thread.',
    fastForward: 'Once the samples are requested, the review waits on the applicant\'s shipment; the review page\'s Advance control drives it — "the applicant ships the requested samples" — and the authority\'s story continues from the same screen.',
    twentyMin: '5:00',
  },
  {
    id: 's06',
    kicker: 'Flow 03 · the laboratory\'s work',
    title: 'Evidence captured at the bench',
    lede: 'The laboratory accepts the assignment, joins the project dataspace, and runs the tests the model declares: the procedure walked step by step, the report generated, never transcribed.',
    chip: 'SMART',
    bullets: [
      'The dispatched request lands in the laboratory\'s inbox; accepting it joins the evaluation project.',
      'The test-run wizard walks the declared procedure; every step\'s purpose and clause read from the model.',
      'The report composer knows completeness: what is missing is named, never silently absent.',
    ],
    live: {
      href: 'https://demo.oimlsmart.org/app/lab',
      account: 'Test Laboratory',
      console: '/app/lab',
      action: 'Sign in as the Test Laboratory, open the accepted request, and step the model-driven test run at the bench.',
      shot: {
        page: 'tl-work',
        stem: 'run-wizard',
        dark: false,
        alt: 'The model-driven test run: the step wizard walks the declared procedure, the header tooltip reads the test\'s purpose and clause from the model.',
      },
      walkthrough: { href: '/demo/tl-work', label: 'Walkthrough 03', desc: 'the laboratory\'s work, six steps narrated' },
    },
    note: 'The metrologist\'s slide. Live: the laboratory console, the model-driven run; the point is that the bench software reads the same model the Recommendation authors, so two laboratories cannot run two different R 60s. The report is generated from the captured evidence, which ends transcription at the hand-off.',
    fastForward: 'If the samples still sit with the authority, the request page\'s Advance control drives the custody move — "the Issuing Authority dispatches the samples to the laboratory" — and the run starts. For the authority-watching lane, the project page carries the counterpart: "the laboratory completes the work and returns its test report".',
    twentyMin: '6:30',
  },
  {
    id: 's07',
    kicker: 'Flow 04 · the evaluation and the certificate',
    title: 'The verdict computed, the certificate signed',
    lede: 'The authority validates the reports against the model, runs the review period, issues the signed certificate, and the BIML registers it: the register anyone can read.',
    chip: 'SMART',
    bullets: [
      'The evaluation reads the test reports as data; the verdict chain computes from the model, and the decision stays the authority\'s.',
      'The certificate issues as signed, time-stamped, schema-validated data (CNML), and registers with the BIML.',
      'The public register is the validity reference: the registered copy is what verification answers from.',
    ],
    live: {
      href: 'https://demo.oimlsmart.org/app/register',
      account: 'no account',
      console: '/app/register',
      action: 'Open the public register (no sign-in): the BIML-registered certificates, browsable by anyone.',
      shot: {
        page: 'ia-evaluation',
        stem: 'public-register',
        dark: true,
        alt: 'The public Certificate Register: the ACTIVE worked-example certificate readable by anyone, no sign-in.',
      },
      walkthrough: { href: '/demo/ia-evaluation', label: 'Walkthrough 04', desc: 'the evaluation and the certificate, eight steps narrated' },
    },
    note: 'Two acts, two truths: the platform computes the verdict from the model, and the authority decides; the certificate is data, signed, and the register is public. Live: open the register with no account at all. Governance-sensitive rooms: this slide is where you say the legal acts never moved.',
    fastForward: 'A stalled review period closes live from the participants\' side: the project\'s Advance control resolves the open threads and takes the authority\'s decision — "the Issuing Authority resolves the review threads and accepts the test report" (the evaluation report\'s own beat reads the same way).',
    fiveMin: '3:00',
    twentyMin: '8:00',
  },
  {
    id: 's08',
    kicker: 'Flow 05 · the applicant\'s journey',
    title: 'Anyone can verify, in seconds',
    lede: 'The manufacturer follows every stage, downloads the certificate, and anyone (a customer, a market inspector, another authority) verifies it against the public register. No account, no phone call.',
    chip: 'SMART',
    bullets: [
      'The applicant is notified at every stage; the application\'s page is the journey\'s spine.',
      'Verification reads the BIML-registered copy plus the live revocation and suspension lists.',
      'Try it: R60/2021-A-EX1-26.01 answers ACTIVE on the demo today.',
    ],
    live: {
      href: 'https://demo.oimlsmart.org/app/verify',
      account: 'no account',
      console: '/app/verify',
      action: 'Open the verify page (no sign-in) and enter R60/2021-A-EX1-26.01: the verdict, the registration, the revocation and suspension checks.',
      shot: {
        page: 'applicant-journey',
        stem: 'verify-number',
        dark: true,
        alt: 'The public verify page: the certificate number checked against the BIML-registered copy, ACTIVE, not revoked, not suspended.',
      },
      walkthrough: { href: '/demo/applicant-journey', label: 'Walkthrough 05', desc: 'the applicant\'s journey, five steps narrated' },
    },
    note: 'The payoff slide, and the 5-minute cut\'s second live moment. Verification is the surface every constituency shares: the manufacturer\'s customer, the inspector, the member state. Live: the verify page, the demo certificate number, the ACTIVE verdict. If you show only two live moments all day, make them s04 and this one.',
    fastForward: 'The journey\'s spine never waits on the authority in a demo: the application page\'s Advance control drives the receipt and the acceptance — "the Issuing Authority receives the samples and accepts — the Evaluation Project opens".',
    fiveMin: '3:45',
    twentyMin: '9:30',
  },
  {
    id: 's09',
    kicker: 'The technologies · 1 of 7',
    title: 'SMART Recommendations and Primmel',
    lede: 'The Recommendation as a structured, executable model, authored in an open modelling language: one source for the page, the form, the tests, the verdicts, with provenance down to the clause.',
    chip: 'SMART',
    bullets: [
      'R 60 today: 180 requirements in 14 classes, 62 test procedures, the report forms, all counted from the model, never hand-typed.',
      'Primmel is the open language the models are authored in: subjects, requirements, processes, packages, developed by Ribose and adopted by OIML SMART as its reference user.',
      'Four Recommendations ride the pilot: R 60, R 91, R 129, R 144.',
    ],
    links: [
      { href: '/technologies/smart-recommendations', label: 'SMART Recommendations', desc: 'the technology page' },
      { href: '/technologies/primmel', label: 'Primmel', desc: 'the language page' },
    ],
    note: 'The foundation claim: the model is not a copy of the Recommendation, it is derived with clause-level provenance and the text stays the gate. The numbers on this slide come from the model itself. Two section pages carry the depth; link them, do not summarize past them.',
    twentyMin: '11:00',
  },
  {
    id: 's10',
    kicker: 'The technologies · 2 of 7',
    title: 'The SMART Twin',
    lede: 'The vision: the Recommendation model as the running instrument\'s digital twin, the standard declaring the served interface, the compliance engine judging the served evidence continuously.',
    chip: 'SMART+',
    bullets: [
      'Labeled honestly: this is the SMART+ vision, anchored to the roadmap, not a shipped surface.',
      'The twin serves the instrument\'s governed aspects; compliance becomes monitorable between assessments, not only at them.',
      'The simulation below (the SST) is how the estate rehearses that future today.',
    ],
    links: [
      { href: '/technologies/smart-twin', label: 'The SMART Twin', desc: 'the technology page, with the roadmap anchors' },
    ],
    note: 'The future, labeled as the future. One minute, no more: the twin is where continuous compliance comes from, and the slide says plainly that it is SMART+. Committee members should never be able to say the tour blurred vision into present.',
    twentyMin: '12:30',
  },
  {
    id: 's11',
    kicker: 'The technologies · 3 of 7',
    title: 'The SST simulation',
    lede: 'Simulated SMART Twins with realistic physics behind the governed twin interface: the full certification workflow rehearsed and taught without hardware.',
    chip: 'SMART',
    bullets: [
      'The classroom runs on it: certify a simulated load cell end to end before touching a real instrument.',
      'The demo\'s instrument itself is simulated; the software around it is the production codebase.',
      'Its production role (twins serving live evidence into certification) rides the SMART+ roadmap.',
    ],
    links: [
      { href: '/technologies/sst', label: 'The SST simulation', desc: 'the technology page' },
      { href: '/use-cases/training-on-the-sst', label: 'Training on the SST', desc: 'the use-case story' },
    ],
    note: 'The bridge between present and future: the simulation is live and carries the classroom and the demo, while its production role is roadmap. Say both halves exactly that way.',
    twentyMin: '13:30',
  },
  {
    id: 's12',
    kicker: 'The technologies · 4 of 7',
    title: 'CNML: the certificate as signed data',
    lede: 'The Certificat Numérique de Métrologie Légale: signed, time-stamped, schema-validated, verifiable by anyone, account-free, offline, built on CalConnect\'s Signatif framework.',
    chip: 'SMART',
    bullets: [
      'The certificate keeps its paper meaning; as data it carries its own proof.',
      'Verification never has to phone home: the trust registry resolves who may sign what.',
      'The same certificate serves neighboring ecosystems: a W3C Verifiable Credential, an SD-JWT, a DPP conformity attestation, an AAS submodel.',
    ],
    links: [
      { href: '/technologies/cnml', label: 'CNML', desc: 'the technology page' },
      { href: '/docs/cnml/', label: 'The CNML volume', desc: 'the format documentation' },
    ],
    note: 'One message: the certificate stops being a picture of a decision and becomes the decision, signed. The export formats answer the interop question before it is asked; s15 opens that map fully.',
    twentyMin: '14:30',
  },
  {
    id: 's13',
    kicker: 'The technologies · 5 of 7',
    title: 'The identity federation',
    lede: 'One account across the estate: a single OpenID Provider, every platform instance a relying party, and members may run their own provider from the same software.',
    chip: 'SMART',
    bullets: [
      'Accounts issue per organization, approved by the organization\'s own administrator; the join flow knows the real OIML member directory.',
      'Federation is the sovereignty answer: a member state\'s own identity provider, same software, its own custody.',
    ],
    links: [
      { href: '/technologies/identity-federation', label: 'The identity federation', desc: 'the technology page' },
      { href: '/services/identity', label: 'The identity service', desc: 'the live service, with captures' },
    ],
    note: 'Short and practical: one account, per-organization approval, and the federation posture for members who must keep identity in their own custody. The live service page carries the performed evidence.',
    twentyMin: '15:30',
  },
  {
    id: 's14',
    kicker: 'The technologies · 6 of 7',
    title: 'The trust registry',
    lede: 'The public registry of who may sign what: each organization\'s signing keys and its standing, resolvable in one anonymous request.',
    chip: 'SMART',
    bullets: [
      'A verifier never has to trust a deployment; it resolves the signer against the registry.',
      'The demo proves the negative honestly: production refuses the demo organizations, and the 404 is the answer being demonstrated.',
    ],
    links: [
      { href: '/technologies/trust-registry', label: 'The trust registry', desc: 'the technology page' },
    ],
    note: 'The quiet slide that makes verification work: keys and standing, public, anonymous to resolve. The negative proof is worth saying aloud; it is the estate\'s honesty doctrine in miniature.',
    twentyMin: '16:00',
  },
  {
    id: 's15',
    kicker: 'The technologies · 7 of 7',
    title: 'Dataspace and interop: the standards map',
    lede: 'The estate speaks the neighboring standards rather than replacing them. Every interop artifact is a projection outward from the authoritative model, never a competing source.',
    chip: 'SMART',
    bullets: [
      'The federation planes map onto the dataspace vocabulary: the Dataspace Protocol (ISO/IEC 20151), ODRL 2.2, the IDS Reference Architecture Model.',
      'The models export, generated never authored: ReqIF requirement rows (the DIN DKE SPEC 99200 profile), RDF/OWL with SHACL shapes (the IEC-ISO Core Ontology projection), OpenCDD back-references.',
      'The certificate serves the neighboring ecosystems today: W3C Verifiable Credential, SD-JWT, DPP conformity attestation, AAS submodel.',
    ],
    links: [
      { href: '/technologies/dataspace-interop', label: 'Dataspace and interoperability', desc: 'the technology page, with the planes table and the export doctrine' },
    ],
    note: 'The interop position in one slide, for the members who arrive worried about a walled garden: the map is public and boring on purpose. Name the standards slowly; they are the answer. The page carries the plane-by-plane table and the fidelity bookkeeping of every export.',
    twentyMin: '16:30',
  },
  {
    id: 's16',
    kicker: 'Deployment',
    title: 'One codebase, four postures',
    lede: 'The CS-operated hub, an IA-only instance, a TL-only instance, the combined IA+TL instance: the deployment profile decides, and a member starts at the size that fits.',
    chip: 'SMART',
    bullets: [
      'The demo is the hub posture: every role on one deployment.',
      'Two member instances run in the pilot today: tl.oimlsmart.org (TL-only, the start-small posture) and nmi.oimlsmart.org (IA+TL, the institute shape).',
      'Member instances submit signed evaluation chains to the CS platform; the register validates and imports them, idempotently.',
      'Start small, grow: the same codebase grows from a laboratory\'s instance to a member state\'s.',
    ],
    links: [
      { href: '/use-cases/deployment-modes', label: 'The deployment-mode matrix', desc: 'what each posture runs, who signs in, what federates where' },
      { href: 'https://tl.oimlsmart.org/', label: 'tl.oimlsmart.org', desc: 'the live TL-only pilot' },
      { href: 'https://nmi.oimlsmart.org/', label: 'nmi.oimlsmart.org', desc: 'the live IA+TL pilot' },
    ],
    note: 'The sovereignty and cost answers land here: custody never has to move, and the minimal posture is one service-class deployment. The two pilots are live; the links are on the slide for the room to try later. The matrix page is the quotable reference.',
    twentyMin: '17:30',
  },
  {
    id: 's17',
    kicker: 'Governance',
    title: 'The committee decides; the text stays',
    lede: 'The adopted text is the source. The model derives from it with clause-level provenance, computes verdicts, and records who decided what. The legal acts stay exactly where the law puts them.',
    bullets: [
      'The Recommendation\'s text remains the gate: new editions join the modelled set through the authoring programme, under the committee\'s adoption.',
      'The platform never decides: designation, acceptance, issuance, withdrawal remain the authorities\' acts, with better evidence.',
      'Nothing dies: PDFs keep their meaning, the register coexists with today\'s, and records mode lets paper-based work enter the record honestly marked.',
      'The liability surface is the existing one; the platform widens nothing.',
    ],
    links: [
      { href: '/about/what-is-smart', label: 'What is OIML SMART?', desc: 'the programme, plainly' },
      { href: '/technologies/smart-recommendations', label: 'The provenance doctrine', desc: 'clause-level, from the text' },
    ],
    note: 'The governance posture, said plainly and without haste: the committee adopts text, the model derives, the platform computes and records, the authorities decide. Gradualness is a design property, not a promise. This slide and s19 are the two the committee should remember.',
    fiveMin: '4:15',
    twentyMin: '18:00',
  },
  {
    id: 's18',
    kicker: 'The adoption path',
    title: 'Start where you are; grow when ready',
    lede: 'Reading costs nothing, participating costs an account, self-hosting is one deployment under your category\'s entitlement. Nothing is retired until your regime is satisfied.',
    chip: 'SMART',
    bullets: [
      'Read: the audience pages, the use cases, the walkthroughs; the public surfaces need no account.',
      'Reproduce: the demo\'s guided tour walks the whole chain in 24 steps; the instance resets nightly.',
      'Pilot: one Recommendation, one authority, one laboratory, the TL-only posture running in the pilot today.',
      'Self-host: the entitlement matrix quotes who may use what and who may run what, per member category.',
    ],
    links: [
      { href: '/services/who-can-run-what', label: 'Who can run what', desc: 'the entitlement matrix, the single source' },
      { href: '/demo/', label: 'The demo, walked', desc: 'the six walkthroughs' },
    ],
    note: 'Adoption as a ramp, not a jump: read, reproduce, pilot, self-host, each step optional and reversible. The entitlement matrix is the single source every page quotes; do not paraphrase it from memory, open it if asked.',
    twentyMin: '18:30',
  },
  {
    id: 's19',
    kicker: 'The ask',
    title: 'Two asks of the committee',
    lede: 'Pilot members, and honest feedback. Everything you saw is running today; the doors are open.',
    bullets: [
      'Pilot members: one Recommendation, one issuing authority, one laboratory. The pilot postures are running; the onboarding starts with a conversation.',
      'Feedback: info@oimlsmart.org. Guided walkthroughs for committees and working visits are the commonest request.',
      'The leave-behind: seven per-audience one-pagers, one printable page each, for the members who were not in the room.',
      'The demo stays up: demo.oimlsmart.org, one-click accounts, the guided demo built in.',
    ],
    links: [
      { href: '/about/audiences/one-pagers/', label: 'The seven one-pagers', desc: 'the leave-behind, printable' },
      { href: 'https://demo.oimlsmart.org/', label: 'demo.oimlsmart.org', desc: 'the live instance' },
      { href: 'mailto:info@oimlsmart.org', label: 'info@oimlsmart.org', desc: 'the feedback channel' },
    ],
    note: 'Close on the two asks, slowly: pilot members (name the shape: one Recommendation, one authority, one laboratory) and feedback (the address is on the slide). Point at the one-pagers for the members who were not in the room. Then stop talking and take questions.',
    fiveMin: '4:45',
    twentyMin: '19:00',
  },
]

/** The 5-minute cut: the slide ids in ride order (the committee slot). */
export const FIVE_MINUTE_CUT = ['s01', 's02', 's03', 's04', 's07', 's08', 's17', 's19'] as const
