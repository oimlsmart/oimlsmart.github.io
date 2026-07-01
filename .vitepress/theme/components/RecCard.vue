<script setup lang="ts">
/**
 * RecCard — a single Recommendation card. Used in the home page
 * Recommendations showcase and the /recommendations/ index grid.
 *
 * The href, scope, year, and counts all come from the typed
 * Recommendation interface — no inline literal duplication.
 */
import type { Recommendation } from '../../types'

defineProps<{
  rec: Recommendation
}>()
</script>

<template>
  <a class="rec-card" :href="rec.href">
    <div class="rec-num">{{ rec.number }} · {{ rec.year }} · DRAFT</div>
    <h3>{{ rec.title }}</h3>
    <p class="scope">{{ rec.scope }}</p>
    <div class="meta">
      <span><strong>{{ rec.stats.requirements }}</strong> reqs</span>
      <span><strong>{{ rec.stats.tests }}</strong> tests</span>
      <span><strong>{{ rec.stats.forms }}</strong> forms</span>
    </div>
  </a>
</template>

<style scoped>
.rec-card {
  display: block;
  padding: 1.75rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: all 0.2s ease;
  overflow: hidden;
}

.rec-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--vp-c-brand-1);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.rec-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px -12px rgba(10, 22, 40, 0.18);
}

.rec-card:hover::before {
  transform: scaleX(1);
}

.rec-num {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
}

.rec-card h3 {
  font-family: var(--vp-font-family-serif);
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.015em;
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.scope {
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin: 0 0 1rem;
}

.meta {
  display: flex;
  gap: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.meta strong {
  color: var(--vp-c-text-1);
  font-weight: 500;
}
</style>