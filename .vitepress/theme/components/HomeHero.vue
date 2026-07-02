<script setup lang="ts">
/**
 * HomeHero — the hero band at the top of the home page.
 *
 * Owns the eyebrow, headline, tagline, CTA buttons, and the
 * rotating SMART globe. The globe swaps SVG variants via the
 * useTheme composable so light/dark modes both look correct.
 *
 * CTA buttons use the global `.btn` / `.btn-primary` / `.btn-ghost`
 * utility classes from `theme/styles/utilities.css`.
 */
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark } = useTheme()
const heroGlobeSrc = computed(() =>
  isDark.value ? '/smart-logo-dark.svg' : '/smart-logo-light.svg'
)
</script>

<template>
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

.home-hero > * {
  position: relative;
  z-index: 1;
}

.home-hero-content {
  max-width: 36rem;
}

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
  .ctas {
    margin-left: auto;
    margin-right: auto;
  }
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
</style>