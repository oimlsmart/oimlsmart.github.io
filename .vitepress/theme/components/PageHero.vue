<script setup lang="ts">
/**
 * PageHero — the consistent hero band at the top of every major page.
 *
 * Primary input: frontmatter. Every page that wants a hero adds
 * `title:` (required), and optionally `description:` and `eyebrow:`
 * to its YAML frontmatter, then writes `<PageHero />` in the body.
 *
 * Props (optional overrides):
 *   - `eyebrow`, `title`, `lede` — use these when the hero text needs
 *     to differ from the page's frontmatter title/description (rare).
 *
 * Why frontmatter is canonical:
 *   - VitePress uses frontmatter.title to set <title> in <head> —
 *     every browser tab gets the right label.
 *   - Search engines, RSS, sitemap, og:tags all read frontmatter.
 *   - One source per page; not duplicated between frontmatter and prop.
 */
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()

const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  lede?: string
}>(), {})

const eyebrow = computed(() => props.eyebrow ?? frontmatter.value.eyebrow)
const title = computed(() => props.title ?? frontmatter.value.title)
const lede = computed(() => props.lede ?? frontmatter.value.description)
</script>

<template>
  <div v-if="title" class="page-hero">
    <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
    <h1>{{ title }}</h1>
    <p v-if="lede" class="lede">{{ lede }}</p>
    <slot />
  </div>
</template>

<style scoped>
.page-hero {
  position: relative;
  padding: 3rem 0 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background-image:
    linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: -1px -1px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.75rem;
}

.eyebrow::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 1px;
  background-color: var(--vp-c-brand-1);
}

.page-hero :deep(h1) {
  font-family: var(--vp-font-family-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0 0 1rem;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
}

.lede {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  max-width: 48rem;
}
</style>