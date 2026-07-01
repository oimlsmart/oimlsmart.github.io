<script setup lang="ts">
interface AcronymItem {
  letter: string
  word: string
  description: string
}

const acronym: AcronymItem[] = [
  { letter: 'S', word: 'Standards', description: 'International metrology recommendations as structured digital artifacts.' },
  { letter: 'M', word: 'Machine-Actionable', description: 'Embedded computation engines perform metrological calculations directly.' },
  { letter: 'A', word: 'Accessible', description: 'Instant search, cross-references, and real-time calculation in the browser.' },
  { letter: 'R', word: 'Readable', description: 'Machine-readable requirements, tests, and terminology in open formats.' },
  { letter: 'T', word: 'Transferrable', description: 'A shared ontology layer enables cross-Recommendation interoperability.' },
]

const stats = [
  { label: 'Recommendations', value: '3' },
  { label: 'Requirements', value: '180+' },
  { label: 'Conformance Tests', value: '60+' },
  { label: 'Forms', value: '40+' },
]

interface Recommendation {
  number: string
  title: string
  scope: string
  year: string
  requirements: number
  tests: number
  forms: number
}

const recommendations: Recommendation[] = [
  {
    number: 'R 60',
    title: 'Load Cells',
    scope: 'Metrological regulation for load cells used in nonautomatic weighing instruments. The pilot SMART Recommendation.',
    year: '2021',
    requirements: 42,
    tests: 18,
    forms: 12,
  },
  {
    number: 'R 129',
    title: 'Mass Road Vehicles',
    scope: 'Dynamic measuring instruments for the determination of mass of road vehicles in motion.',
    year: '2000',
    requirements: 35,
    tests: 14,
    forms: 9,
  },
  {
    number: 'R 144',
    title: 'Gas Meters',
    scope: 'Gas meters — diaphragm gas meters deployed for custody transfer and billing.',
    year: '2006',
    requirements: 28,
    tests: 11,
    forms: 8,
  },
]

interface Feature {
  num: string
  title: string
  description: string
}

const features: Feature[] = [
  { num: '01', title: 'Structured Requirements', description: 'Machine-readable requirements with explicit acceptance criteria and applicability filters.' },
  { num: '02', title: 'Conformance Testing', description: 'Structured test procedures linked to requirements via explicit dependency chains.' },
  { num: '03', title: 'Smart Forms', description: 'Calculation-powered forms that auto-compute field values based on instrument classification.' },
  { num: '04', title: 'Certification Workflow', description: 'End-to-end digital certification: application → test report → evaluation → certificate.' },
  { num: '05', title: 'Semantic Ontology', description: 'OWL-based ontology for cross-Recommendation interoperability and semantic queries.' },
  { num: '06', title: 'Document Library', description: 'Browse all OIML documents in structured, searchable format with instant full-text search.' },
]

interface AudiencePath {
  num: string
  title: string
  description: string
  link: { label: string; href: string }
}

const audiencePaths: AudiencePath[] = [
  {
    num: 'i',
    title: 'For OIML Member States',
    description: 'Understand what SMART means for national legal metrology programmes and how to participate in the technical committees shaping the SMART agenda.',
    link: { label: 'About →', href: '/about/what-is-smart.html' },
  },
  {
    num: 'ii',
    title: 'For Standards Developers',
    description: 'Author new SMART International Recommendations in YAML using the developer guides, schemas, and the Primmel modelling language.',
    link: { label: 'Guides →', href: '/docs/guides/getting-started.html' },
  },
  {
    num: 'iii',
    title: 'For OIML-CS Participants',
    description: 'Issuing Authorities, Test Laboratories, and Manufacturers use the digital certification tools for end-to-end OIML-CS workflows.',
    link: { label: 'OIML-CS →', href: '/oiml-cs.html' },
  },
  {
    num: 'iv',
    title: 'For Metrology Professionals',
    description: 'Browse the structured library of OIML documents, requirements, and ontology terms across all modelled Recommendations.',
    link: { label: 'Library →', href: '/library/' },
  },
]
</script>

<template>
  <div class="oiml-home">
    <!-- Hero -->
    <section class="home-hero">
      <div class="home-hero-content">
        <div class="eyebrow">
          <span class="dot"></span>
          <span>OIML pilot programme · DRAFT · internal</span>
        </div>
        <h1>
          Standards that are<br />
          <em>machine&#8209;actionable.</em>
        </h1>
        <p class="tagline">
          <strong>OIML SMART</strong> transforms International Recommendations from static
          PDF documents into structured digital artifacts — executable, traceable,
          and interoperable across the global metrology community.
        </p>
        <div class="ctas">
          <a class="btn btn-primary" href="/recommendations/">
            Explore Recommendations
            <span class="arrow">→</span>
          </a>
          <a class="btn btn-ghost" href="/about/what-is-smart">What is SMART?</a>
        </div>
      </div>

      <div class="home-globe">
        <img
          src="/smart-logo-light.svg"
          alt="OIML SMART globe mark"
          class="globe-static"
        />
      </div>
    </section>

    <!-- S.M.A.R.T. Acronym -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 01 / Acronym</span>
        <h2>What "SMART" stands for</h2>
        <p>
          Five properties that distinguish a SMART Recommendation from a traditional PDF.
          Together, they make the Recommendation a functional digital artifact —
          not just a document.
        </p>
      </div>
      <div class="acronym-strip">
        <div
          v-for="item in acronym"
          :key="item.letter"
          class="cell"
        >
          <div class="letter">{{ item.letter }}</div>
          <div class="word">{{ item.word }}</div>
          <div class="desc">{{ item.description }}</div>
        </div>
      </div>
    </section>

    <!-- Recommendations -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 02 / Catalogue</span>
        <h2>Recommendations in the pilot</h2>
        <p>
          Each Recommendation below is at a different point in the modelling
          pilot. Numbers reflect the working model and may change as the
          pilot evolves.
        </p>
      </div>
      <div class="rec-grid">
        <a
          v-for="r in recommendations"
          :key="r.number"
          class="rec-card"
          :href="`/recommendations/${r.number.toLowerCase().replace(' ', '')}.html`"
        >
          <div class="rec-num">{{ r.number }} · {{ r.year }} · DRAFT</div>
          <h3>{{ r.title }}</h3>
          <p class="scope">{{ r.scope }}</p>
          <div class="meta">
            <span><strong>{{ r.requirements }}</strong> reqs</span>
            <span><strong>{{ r.tests }}</strong> tests</span>
            <span><strong>{{ r.forms }}</strong> forms</span>
          </div>
        </a>
      </div>
    </section>

    <!-- Stats -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 03 / Pilot scope</span>
        <h2>What the pilot currently covers</h2>
        <p>
          Working figures as of the current pilot snapshot. Will grow as more
          Recommendations and features are added.
        </p>
      </div>
      <div class="stat-row">
        <div
          v-for="s in stats"
          :key="s.label"
          class="stat"
        >
          <div class="value">{{ s.value }}</div>
          <span class="label">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 04 / What works today</span>
        <h2>Capabilities delivered in the pilot</h2>
        <p>
          These are the working capabilities in the current build. They are
          subject to change — the pilot is intentionally exploratory.
        </p>
      </div>
      <div class="feature-grid">
        <div
          v-for="f in features"
          :key="f.num"
          class="feature"
        >
          <span class="icon">{{ f.num }}</span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.description }}</p>
        </div>
      </div>
    </section>

    <!-- Audience paths -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 05 / How the pilot is reviewed</span>
        <h2>Internal review paths</h2>
        <p>
          This site supports ongoing internal review of the OIML SMART pilot.
          OIML Member States and Corresponding Members are invited to contact
          OIML directly for engagement.
        </p>
      </div>
      <div class="audience-grid">
        <div
          v-for="path in audiencePaths"
          :key="path.num"
          class="path"
        >
          <div class="num">{{ path.num }}</div>
          <div>
            <h3>{{ path.title }}</h3>
            <p>
              {{ path.description }}
              <a :href="path.link.href">{{ path.link.label }}</a>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="home-section">
      <div class="home-section-head">
        <span class="num">— 06 / Important</span>
        <h2>This is a DRAFT pilot site</h2>
        <p>
          Every page on this site is part of an ongoing pilot programme. All
          Recommendations, requirements, tests, forms, ontology entities, and
          specifications are <strong>drafts</strong>. Counts, terminology, and
          structure are all subject to change.
        </p>
        <p>
          This site is intended <strong>for the internal use of the OIML SMART
          team</strong>. It is not suitable for public consumption. OIML
          Member States and Corresponding Members seeking engagement should
          contact OIML through official channels.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-hero-content {
  max-width: 36rem;
}

.globe-static {
  width: 100%;
  max-width: 420px;
  height: auto;
  animation: globe-rotate 90s linear infinite;
  transform-origin: center center;
}

@keyframes globe-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .globe-static {
    animation: none;
  }
}
</style>