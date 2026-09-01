# AGENTS.md — the OIML SMART public site

Guidance for agent sessions working in this repository. The general
repo guide (what the site is, the build, the collections, the routing)
is `CLAUDE.md` — read it first. This file carries the standing
doctrine an agent must not relearn by mistake.

## The promotion doctrine (TODO.promotion/08): honesty is mechanical

The promotion surfaces — `/audiences`, `/technologies`, `/use-cases`,
`/services`, the `/demo/*` walkthroughs, the `/tour` deck and its notes,
`/about/audiences/**` (incl. the one-pagers) — make claims about running
systems. Every such claim is one click from its proof, and the proof is
CHECKED, not promised. An honesty failure fails the build the same way
a code failure does.

### The claim→evidence map (`src/data/proof-map.ts`)

ONE typed manifest (the house data-file convention, like
`platform-facts.ts` — never a parallel YAML) lists every promotion
page, and per page its claims with their proof anchors:

- `site` — a route of this site; the probe string must be carried by
  the route's own source.
- `source` — a file in this repo (a data file a page renders from; the
  probe pins the row the page quotes, e.g. the entitlement matrix's
  named cells).
- `smart` — a file in the smart repo (the SSOT: DEMO_FLOWS, the data
  trees). Checked when `SMART_REPO` is declared — the gates.yml
  posture: declared ⇒ verified; undeclared ⇒ a loud skip, never a
  false green.
- `live` — a URL on a running surface. Lychee proves resolution
  per-push; the nightly adds the semantic layer: the anchor still
  SHOWS what the page claims (the probe rides the fetched body; an
  honest non-200 like the trust registry's documented 404 refusal is
  declared in `expect`). Where a content probe is not feasible — a
  login-gated console, a client-rendered app — the anchor carries
  `skip:` with the reason, printed in the report, never a silent pass.

The per-push leg (`src/proof-map.test.ts`, ridden by `npm test`) proves
the map complete (a new promotion page without an entry fails the
build), the offline anchors carried, and the published captures on
disk. The nightly leg (`.github/workflows/freshness.yml`) walks the
live anchors: `npx tsx scripts/check-proof-map.ts --live`.

### How to regenerate a screenshot

Screenshots are scripted audit artifacts, never hand-snapped: each
capture script performs the act the page claims and asserts the surface
before capturing. Every dated page declares its freshness budget and its
regeneration command in its proof-map entry (`shots.ttlDays` /
`shots.regenerate`); the nightly fails a page whose oldest capture is
past its TTL and prints the command.

- Walkthrough captures (`/demo/*`, the tour's fallbacks):
  `npx tsx scripts/capture-walkthroughs.ts` — `--drive` for the
  state-changing arc, `--only=<name-substring,…>` for a subset,
  `--rebuild-manifest` to re-register after an interrupted run. The
  manifest (`public/img/walkthroughs/manifest.json`) records the act,
  the URL, the timestamp, and the regeneration command next to the
  captures.
- The section pages:
  `npx tsx scripts/capture-technologies.ts [--only <page>]`,
  `capture-audiences.ts [--only=…] [--drive]`,
  `capture-usecases.ts [--only=…]`, `capture-services.ts [--only=…]`.
- After re-capturing, bump the page's `captured` date (the mdx
  frontmatter / the page's `const captured`; the tour rides
  `TOUR_CAPTURED` in `src/data/tour-slides.ts`) — the pages' dates are
  the single home the freshness leg reads.

TTLs declared today: the walkthroughs + the tour 30 days (they narrate
the live demo's behavior); the section pages 60 days.

### The model-content rule (`src/data/model-content-allowlist.ts`)

The smart repo's derive-never-invent doctrine (its AGENTS.d/16), adapted
to a public site: a promotion page stating a model fact — a clause id,
a count of requirements or forms, a requirement's semantics — either
derives it from the SSOT at build time or carries a dated allowlist
entry. The tripwire (`scripts/check-model-content.ts`, ridden by
`src/model-content.test.ts` in `npm test`) flags the literal shapes and
fails on any without an entry; the entry's pins are re-verified against
the smart repo's trees whenever `SMART_REPO` is declared (the clause
pins read the publications' presentation XMLs by their autonum
numbering), and the `live` pins are exercised signed-in by the nightly
demo smoke. The list ONLY SHRINKS: the ceiling pin
(`MODEL_CONTENT_CEILING`) makes growth a deliberate commit, and a stale
entry (its literal no longer on the page) fails the gate. Scope boundary
said honestly: the rule covers the promotion surfaces; the ladder pages
(`/platform`, `/architecture`, `/recommendations`, `/library`) predate
it and are a named follow-up, not silently exempt.

### The demo-link liveness smoke (`e2e/demo-liveness.spec.ts`)

The walkthrough/tour deep links into demo.oimlsmart.org are exercised
by a playwright leg with its OWN config (`playwright.demo.config.ts` —
the default config never matches it, so the per-push e2e suite stays
hermetic). Declared cadence: NIGHTLY (the freshness workflow), because
the demo reseeds nightly and the tour must never silently break on that
reset. The legs: the public surfaces anonymously (the login grid, the
register, the verify page), every published deep link answering 200 at
the HTTP layer (the demo 404s unknown app routes — a moved route is a
broken tour), the cheap signed-in console smokes, and the model-content
allowlist's `live` pins asserted on their surfaces.

Run it locally:

```bash
npx playwright test -c playwright.demo.config.ts        # the live demo
DEMO_BASE=http://localhost:3000 npx playwright test -c playwright.demo.config.ts
```

### The cadences, one table

| Leg | Cadence | Command |
|---|---|---|
| proof-map structure + offline anchors | per-push (`npm test`) | automatic |
| model-content tripwire + SSOT pins | per-push (`npm test`; pins need `SMART_REPO`) | `npx tsx scripts/check-model-content.ts` |
| shot declarations + published captures | per-push (`npm test`) | automatic |
| live anchor content probes | nightly | `npx tsx scripts/check-proof-map.ts --live` |
| screenshot staleness vs TTL | nightly | `npx tsx scripts/check-shot-freshness.ts` |
| demo-link liveness smoke | nightly | `npx playwright test -c playwright.demo.config.ts` |
