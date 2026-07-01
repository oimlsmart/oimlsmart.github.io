<script setup lang="ts">
/**
 * AcronymStrip — the five-cell S.M.A.R.T. letter grid.
 * Data comes from `acronym` in the central data module.
 */
import type { AcronymItem } from '../../types'

defineProps<{
  items: readonly AcronymItem[]
}>()
</script>

<template>
  <div class="acronym-strip">
    <div v-for="item in items" :key="item.letter" class="cell">
      <div class="letter">{{ item.letter }}</div>
      <div class="word">{{ item.word }}</div>
      <div class="desc">{{ item.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.acronym-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--vp-c-bg-soft-up);
}

@media (max-width: 720px) {
  .acronym-strip { grid-template-columns: repeat(2, 1fr); }
}

.cell {
  padding: 1.5rem 1.25rem;
  border-right: 1px solid var(--vp-c-divider);
  position: relative;
}

.cell:last-child { border-right: none; }

@media (max-width: 720px) {
  .cell:nth-child(2n) { border-right: none; }
  .cell:not(:last-child) { border-bottom: 1px solid var(--vp-c-divider); }
}

.letter {
  font-family: var(--vp-font-family-serif);
  font-size: 3.5rem;
  font-weight: 400;
  line-height: 1;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
  font-feature-settings: 'ss01';
}

.word {
  font-family: var(--vp-font-family-base);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.25rem;
}

.desc {
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--vp-c-text-3);
}
</style>