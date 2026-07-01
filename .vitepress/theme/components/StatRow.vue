<script setup lang="ts">
/**
 * StatRow — the four-up grid of headline figures on the home page.
 * Data comes from `pilotStats` in the central data module.
 */
import type { Stat } from '../../types'

defineProps<{
  stats: readonly Stat[]
}>()
</script>

<template>
  <div class="stat-row">
    <div v-for="s in stats" :key="s.label" class="stat">
      <div class="value">{{ s.value }}</div>
      <span class="label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background-color: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

@media (max-width: 720px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat {
  background-color: var(--vp-c-bg-soft-up);
  padding: 1.75rem 1.25rem;
  text-align: center;
}

.value {
  font-family: var(--vp-font-family-serif);
  font-size: 2.75rem;
  font-weight: 500;
  line-height: 1;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
}

.label {
  display: block;
  margin-top: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}
</style>