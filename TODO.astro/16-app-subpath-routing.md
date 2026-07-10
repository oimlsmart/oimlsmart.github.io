# 16 — App subpath routing

**Status:** pending
**Depends on:** 14 (first workflow page)

## Why

Vue components mount as Astro islands, but a multi-page Vue app needs a client-side router. Otherwise every navigation triggers a full page load, defeating the SPA experience users expect from the workflow tools.

## What to do

### 1. Add `vue-router` dependency

```sh
npm install vue-router@4
```

### 2. Create a Vue Router instance scoped to `/app/`

```ts
// src/lib/router.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/app/', component: () => import('./pages/AppHome.vue') },
  { path: '/app/dispatch/', component: () => import('./pages/DispatchWizard.vue') },
  { path: '/app/test-requests/', component: () => import('./pages/TestRequestsList.vue') },
  { path: '/app/test-requests/:id/', component: () => import('./pages/TestRequestDetail.vue') },
  { path: '/app/lab-inbox/', component: () => import('./pages/LabInbox.vue') },
  { path: '/app/evaluations/:id/', component: () => import('./pages/EvaluationDetail.vue') },
  // ... etc.
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

### 3. Wrap all `/app/*` Astro routes in a single root Vue component

Create `src/pages/app/[...slug].astro`:
```astro
---
import AppRoot from '../components/AppRoot.vue'
---
<AppRoot client:load />
```

`AppRoot.vue`:
```vue
<script setup>
import { router } from '../lib/router'
</script>
<template>
  <router-view />
</template>
```

### 4. Server-side fallback for direct hits

For `/app/test-requests/abc-123` accessed directly (e.g., refresh), Astro needs to render the same shell. The `[...slug].astro` catch-all handles this — it just renders `<AppRoot>` which hydrates and lets Vue Router take over.

## Acceptance criteria

- [ ] `/app/` loads the app shell
- [ ] Navigation between `/app/dispatch/`, `/app/test-requests/`, etc. is client-side (no full page reload)
- [ ] Direct hit on `/app/test-requests/abc-123` works
- [ ] Browser back/forward works
- [ ] Logged-out users get redirected to `/login/`
