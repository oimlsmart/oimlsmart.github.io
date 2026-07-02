<script setup lang="ts">
/**
 * DraftCallout — the persistent DRAFT / pilot / internal-use notice.
 *
 * Variant is auto-detected from the current page's URL path:
 *   - /docs/specifications/*  → 'specs'   (mentions the SMART_REQS set)
 *   - /blog/*                 → 'compact' (shorter, for post cards)
 *   - everywhere else         → 'default' (full pilot disclaimer)
 *
 * The variant can still be overridden via the `variant` prop for
 * edge cases (e.g. a page that needs a different tone). But for
 * 99% of call sites, bare `<DraftCallout />` does the right thing.
 *
 * Wording lives in `.vitepress/data/site.ts > draftNotice`.
 */
import { draftNotice } from '../../data/site'
import { computed } from 'vue'
import { useData } from 'vitepress'

type Variant = 'default' | 'compact' | 'specs'

const props = withDefaults(defineProps<{
  variant?: Variant
}>(), {})

const { page } = useData()

function detectVariant(path: string | undefined): Variant {
  if (!path) return 'default'
  if (path.startsWith('/docs/specifications/')) return 'specs'
  if (path.startsWith('/blog/')) return 'compact'
  return 'default'
}

const activeVariant = computed<Variant>(
  () => props.variant ?? detectVariant(page.value?.path)
)

const body = computed(() => {
  switch (activeVariant.value) {
    case 'compact':
      return 'This page is part of the OIML SMART pilot. Content is a draft and may change without notice.'
    case 'specs':
      return (
        'This document is part of the SMART_REQS specification set for the OIML SMART ' +
        'pilot. It is a draft and may change without notice as the pilot evolves. The ' +
        'current version is published from the OIML SMART specification repository.'
      )
    default:
      return draftNotice.body
  }
})
</script>

<template>
  <div class="callout draft-notice">
    <strong>{{ draftNotice.title }}</strong>
    <p>{{ body }}</p>
  </div>
</template>

<style scoped>
.draft-notice {
  margin: 1.75rem 0;
  padding: 1.25rem 1.5rem;
  border-left: 4px solid #d97706;
  background: #fef3c7;
  color: #78350f;
  border-radius: 4px;
}

.dark .draft-notice {
  background: rgba(120, 53, 15, 0.18);
  color: #fde68a;
}

.draft-notice strong {
  display: block;
  color: #92400e;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dark .draft-notice strong {
  color: #fbbf24;
}

.draft-notice p {
  margin: 0.75rem 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
}
</style>