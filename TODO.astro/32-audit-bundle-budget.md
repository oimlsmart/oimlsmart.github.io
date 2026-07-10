# 32 — Audit: bundle size budget

**Status:** proposal
**Audit finding:** no guard against JavaScript bundle bloat as Vue pages are migrated

## Finding

The current site is mostly static HTML with ~20KB of JS for Vue islands. As workflow pages migrate from smart/browser, each brings ~50–200KB of JS (Vue component + composables + services). Without a budget, the homepage could silently grow to 1MB+.

## Proposal

Add `vite-plugin-size-limit` or a post-build check:

```ts
// vitest.config.ts addition
test: {
  // ... existing config
}

// Or separate script: scripts/check-bundle-size.ts
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const BUDGETS: Record<string, number> = {
  '_astro/': 200_000,  // 200KB max per JS chunk
}

const dist = 'dist/_astro'
for (const file of readdirSync(dist)) {
  const size = statSync(join(dist, file)).size
  if (file.endsWith('.js') && size > 200_000) {
    console.error(`Bundle over budget: ${file} is ${(size/1024).toFixed(0)}KB (limit: 200KB)`)
    process.exit(1)
  }
}
```

## Acceptance criteria

- [ ] Build-time size check runs in CI
- [ ] Budget: 200KB per JS chunk (sufficient for Vue + composables + one page)
- [ ] Budget: 500KB total JS per page (Astro islands + shared)
- [ ] PRs that exceed budget are blocked until justified
