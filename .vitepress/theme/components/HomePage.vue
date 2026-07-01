<script setup lang="ts">
/**
 * HomePage — composes the home page from typed data + reusable components.
 *
 * No inline literals. No inline styles beyond the hero-specific layout.
 * The hero globe uses a Vue-rendered img with a useDark ref to swap
 * the SVG between light and dark variants at runtime.
 */

import { computed } from 'vue'
import HomeSection from './HomeSection.vue'
import AcronymStrip from './AcronymStrip.vue'
import StatRow from './StatRow.vue'
import FeatureGrid from './FeatureGrid.vue'
import AudienceGrid from './AudienceGrid.vue'
import RecCard from './RecCard.vue'
import { useTheme } from '../composables/useTheme'
import {
  acronym,
  pilotStats,
  platformFeatures,
  audiencePaths,
  draftNotice,
} from '../../data/site'
import { recommendations } from '../../data/recommendations'

const { isDark } = useTheme()
const heroGlobeSrc = computed(() =>
  isDark.value ? '/smart-logo-dark.svg' : '/smart-logo-light.svg'
)
</script>

<template>
  <div class="oiml-home">
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
          <a class="btn btn-ghost" href="/about/what-is-smart.html">What is SMART?</a>
        </div>
      </div>

      <div class="home-globe">
        <img
          :src="heroGlobeSrc"
          alt="OIML SMART globe mark"
          class="globe-static"
        />
      </div>
    </section>

    <HomeSection
      num="— 01 / Acronym"
      title='What "SMART" stands for'
      lede="Five properties that distinguish a SMART Recommendation from a traditional PDF. Together, they make the Recommendation a functional digital artifact — not just a document."
    >
      <AcronymStrip :items="acronym" />
    </HomeSection>

    <HomeSection
      num="— 02 / Catalogue"
      title="Recommendations in the pilot"
      lede="Each Recommendation below is at a different point in the modelling pilot. Numbers reflect the working model and may change as the pilot evolves."
    >
      <div class="rec-grid">
        <RecCard v-for="r in recommendations" :key="r.number" :rec="r" />
      </div>
    </HomeSection>

    <HomeSection
      num="— 03 / Pilot scope"
      title="What the pilot currently covers"
      lede="Working figures as of the current pilot snapshot. Will grow as more Recommendations and features are added."
    >
      <StatRow :stats="pilotStats" />
    </HomeSection>

    <HomeSection
      num="— 04 / What works today"
      title="Capabilities delivered in the pilot"
      lede="These are the working capabilities in the current build. They are subject to change — the pilot is intentionally exploratory."
    >
      <FeatureGrid :features="platformFeatures" />
    </HomeSection>

    <HomeSection
      num="— 05 / How the pilot is reviewed"
      title="Internal review paths"
      lede="This site supports ongoing internal review of the OIML SMART pilot. OIML Member States and Corresponding Members are invited to contact OIML directly for engagement."
    >
      <AudienceGrid :paths="audiencePaths" />
    </HomeSection>

    <HomeSection
      num="— 06 / Important"
      title="This is a DRAFT pilot site"
    >
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
      <p class="draft-tag">{{ draftNotice.title }}</p>
    </HomeSection>
  </div>
</template>

<style scoped>
.home-hero {
  position: relative;
  min-height: min(92vh, 800px);
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 0;
}

@media (max-width: 960px) {
  .home-hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 0 3rem;
    min-height: auto;
    text-align: center;
  }
}

.home-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: 64px 64px;
  background-position: center center;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 30%, transparent 75%);
  pointer-events: none;
  z-index: 0;
}

.home-hero > * { position: relative; z-index: 1; }
.home-hero-content { max-width: 36rem; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 1.5rem;
}

.eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 4px var(--vp-c-brand-soft);
}

@media (max-width: 960px) {
  .home-hero-content,
  .eyebrow,
  .ctas { margin-left: auto; margin-right: auto; }
  .eyebrow { justify-content: center; }
  .ctas { justify-content: center; }
}

h1 {
  font-family: var(--vp-font-family-serif);
  font-size: clamp(2.5rem, 6.5vw, 4.75rem);
  font-weight: 500;
  line-height: 0.98;
  letter-spacing: -0.035em;
  margin: 0 0 1.5rem;
  color: var(--vp-c-text-1);
}

h1 em {
  font-style: italic;
  font-weight: 400;
  color: var(--vp-c-brand-1);
}

.tagline {
  font-size: 1.1875rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  max-width: 32rem;
  margin: 0 0 2.5rem;
}

.tagline strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-base);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}

.btn-primary:hover {
  background-color: var(--vp-c-brand-1);
  color: #ffffff;
}

.btn-ghost {
  background-color: transparent;
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.btn-ghost:hover {
  border-color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft-up);
}

.btn .arrow { transition: transform 0.15s; }
.btn:hover .arrow { transform: translateX(2px); }

.home-globe {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  max-width: 480px;
  margin: 0 auto;
}

.home-globe::before {
  content: '';
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%,
    var(--vp-c-brand-soft) 0%,
    transparent 60%);
  filter: blur(40px);
}

.globe-static {
  position: relative;
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
  .globe-static { animation: none; }
}

.rec-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 960px) {
  .rec-grid { grid-template-columns: 1fr; }
}

.draft-tag {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #d97706;
}

.dark .draft-tag { color: #fbbf24; }
</style>