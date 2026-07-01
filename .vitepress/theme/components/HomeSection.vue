<script setup lang="ts">
/**
 * HomeSection — a labelled section on the home page.
 * Provides consistent eyebrow / heading / lede spacing and numbering.
 *
 * Slot default is the section body (grid, cards, etc.).
 */
defineProps<{
  num: string
  title: string
  lede?: string
}>()
</script>

<template>
  <section class="home-section">
    <div class="home-section-head">
      <span class="num">{{ num }}</span>
      <h2>{{ title }}</h2>
      <p v-if="lede">{{ lede }}</p>
      <slot name="head-extra" />
    </div>
    <slot />
  </section>
</template>

<style scoped>
.home-section {
  padding: 5rem 0;
  border-top: 1px solid var(--vp-c-divider);
  position: relative;
}

.home-section-head {
  max-width: 48rem;
  margin-bottom: 3rem;
}

.home-section-head :deep(.num) {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  color: var(--vp-c-brand-1);
  display: block;
  margin-bottom: 0.5rem;
}

.home-section-head :deep(h2) {
  font-family: var(--vp-font-family-serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 1rem;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
}

.home-section-head :deep(p) {
  font-size: 1.0625rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>