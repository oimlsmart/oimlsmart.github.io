<script setup lang="ts">
/**
 * AudienceGrid — the four-cell audience-aware entry path grid.
 * Data comes from `audiencePaths` in the central data module.
 */
import type { AudiencePath } from '../../types'

defineProps<{
  paths: readonly AudiencePath[]
}>()
</script>

<template>
  <div class="audience-grid">
    <div v-for="path in paths" :key="path.num" class="path">
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
</template>

<style scoped>
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background-color: var(--vp-c-divider);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}

@media (max-width: 720px) {
  .audience-grid { grid-template-columns: 1fr; }
}

.path {
  background-color: var(--vp-c-bg-soft-up);
  padding: 1.75rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.num {
  flex-shrink: 0;
  font-family: var(--vp-font-family-serif);
  font-size: 2.25rem;
  font-weight: 400;
  line-height: 1;
  color: var(--vp-c-brand-1);
  font-style: italic;
}

.path h3 {
  font-family: var(--vp-font-family-serif);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.375rem;
  color: var(--vp-c-text-1);
}

.path p {
  font-size: 0.875rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0;
}

.path p a {
  display: inline-block;
  margin-top: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.path p a:hover { text-decoration: underline; }
</style>