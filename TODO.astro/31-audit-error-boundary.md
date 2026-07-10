# 31 — Audit: error boundary for Vue islands

**Status:** proposal
**Audit finding:** if a Vue island throws during hydration, the entire page crashes with a blank screen

## Finding

Vue islands on the public site (`ThemeToggle`, `MobileNav`, `AboutDropdown`, `SearchBox`) hydrate client-side. If any of them throws (e.g., localStorage quota exceeded, matchMedia not available), the error propagates to the Astro page and may break the layout.

## Proposal

Wrap each Vue island in an `<ErrorBoundary>` component:

```vue
<!-- src/components/ErrorBoundary.vue -->
<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
const error = ref<Error | null>(null)
onErrorCaptured((e) => { error.value = e; return false })
</script>
<template>
  <slot v-if="!error" />
  <span v-else class="text-xs text-red-500" :title="error.message">⚠</span>
</template>
```

Then in Base.astro:
```astro
<ErrorBoundary client:load><ThemeToggle /></ErrorBoundary>
```

## Acceptance criteria

- [ ] `ErrorBoundary.vue` exists with tests
- [ ] All 4 Vue islands wrapped
- [ ] Test that a throwing island doesn't crash the page
