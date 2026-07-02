<script setup lang="ts">
/**
 * HomePage — composes the home page from typed data + reusable components.
 *
 * After the HomeHero extraction, HomePage is just a sequence of
 * HomeSection blocks. Hero logic + hero styles live in HomeHero.vue.
 */
import HomeHero from './HomeHero.vue'
import HomeSection from './HomeSection.vue'
import AcronymStrip from './AcronymStrip.vue'
import StatRow from './StatRow.vue'
import FeatureGrid from './FeatureGrid.vue'
import AudienceGrid from './AudienceGrid.vue'
import RecCard from './RecCard.vue'
import {
  acronym,
  pilotStats,
  platformFeatures,
  audiencePaths,
  draftNotice,
} from '../../data/site'
import { recommendations } from '../../data/recommendations'
</script>

<template>
  <div class="oiml-home">
    <HomeHero />

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
.oiml-home {
  position: relative;
  overflow: hidden;
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