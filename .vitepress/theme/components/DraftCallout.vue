<script setup lang="ts">
/**
 * DraftCallout — the persistent DRAFT / pilot / internal-use notice.
 *
 * Replaces the inlined `<div class="callout draft-notice">…</div>` block
 * that was copy-pasted into 34 markdown files. Wording lives in
 * `.vitepress/data/site.ts > draftNotice`. To reword: edit there, not here.
 *
 * Variants:
 *   - default   — full notice (used on most pages)
 *   - compact   — shorter version (used in dense reference pages)
 *   - specs     — SMART_REQS variant (mentions specifications)
 */
import { draftNotice } from '../../data/site'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'compact' | 'specs'
}>(), {
  variant: 'default',
})

const body = computed(() => {
  if (props.variant === 'compact') {
    return 'This page is part of the OIML SMART pilot. Content is a draft and may change without notice.'
  }
  if (props.variant === 'specs') {
    return (
      'This document is part of the SMART_REQS specification set for the OIML SMART ' +
      'pilot. It is a draft and may change without notice as the pilot evolves. The ' +
      'current version is published from the OIML SMART specification repository.'
    )
  }
  return draftNotice.body
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