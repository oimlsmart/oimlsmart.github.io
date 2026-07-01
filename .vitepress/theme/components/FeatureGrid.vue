<script setup lang="ts">
/**
 * FeatureGrid — the numbered 6-cell grid of platform capabilities.
 * Data comes from `platformFeatures` in the central data module.
 */
import type { Feature } from '../../types'

defineProps<{
  features: readonly Feature[]
}>()
</script>

<template>
  <div class="feature-grid">
    <div v-for="f in features" :key="f.num" class="feature">
      <span class="icon">{{ f.num }}</span>
      <h3>{{ f.title }}</h3>
      <p>{{ f.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background-color: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

@media (max-width: 960px) {
  .feature-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .feature-grid { grid-template-columns: 1fr; }
}

.feature {
  background-color: var(--vp-c-bg-soft-up);
  padding: 1.75rem;
  position: relative;
  transition: background-color 0.15s;
}

.feature:hover {
  background-color: var(--vp-c-bg-soft);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  margin-bottom: 1rem;
  font-family: var(--vp-font-family-mono);
  font-weight: 500;
  font-size: 0.875rem;
}

.feature h3 {
  font-family: var(--vp-font-family-serif);
  font-size: 1.1875rem;
  font-weight: 500;
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.feature p {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>