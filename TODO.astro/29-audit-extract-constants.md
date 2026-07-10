# 29 — Audit: constants extracted from inline literals

**Status:** proposal
**Type:** architectural improvement / DRY
**Audit finding:** magic numbers and strings scattered across pages

## Finding

Examples found during the index.astro refactor:

- `'180+'` (requirements count) lives inline in `index.astro`
- `'60+'` (tests count) same
- `'40+'` (forms count) same
- `'3'` (Recommendations count) — already replaced by `STANDARDS.length` indirectly
- Test duration `6000` and `3000` ms in `useNotification.ts`

These are derived values that should compute from data, not be hardcoded.

## Proposal

Two fixes:

### Fix 1: compute aggregate stats from STANDARDS

```ts
// src/data/standards.ts (add)
export const STANDARDS_STATS = {
  total: STANDARDS.length,
  totalRequirements: STANDARDS.reduce((sum, s) => sum + s.counts.requirements, 0),
  totalTests: STANDARDS.reduce((sum, s) => sum + s.counts.tests, 0),
  totalForms: STANDARDS.reduce((sum, s) => sum + s.counts.forms, 0),
} as const

// Round-up display helpers
export function approximate(n: number): string {
  if (n >= 100) return `${Math.ceil(n / 10) * 10}+`
  return String(n)
}
```

In `index.astro`:

```ts
import { STANDARDS, STANDARDS_STATS, approximate } from '../data/standards'

const stats = [
  { label: 'Recommendations', value: String(STANDARDS_STATS.total) },
  { label: 'Requirements', value: approximate(STANDARDS_STATS.totalRequirements) },
  { label: 'Conformance Tests', value: approximate(STANDARDS_STATS.totalTests) },
  { label: 'Forms', value: approximate(STANDARDS_STATS.totalForms) },
]
```

### Fix 2: notification durations as named constants

```ts
// src/lib/useNotification.ts
export const NOTIFICATION_DURATION = {
  default: 3000,
  error: 6000,
} as const

function add(n: Omit<Notification, 'id'>): void {
  // ...
  const duration = n.duration ?? (n.type === 'error' ? NOTIFICATION_DURATION.error : NOTIFICATION_DURATION.default)
  // ...
}
```

## Why

- Adding a 4th Recommendation automatically updates the home page stats
- Tests can import `NOTIFICATION_DURATION.default` and assert against it
- No more "the stat says 180+ but the real count is 195"

## Acceptance criteria

- [ ] `STANDARDS_STATS` exported
- [ ] `approximate()` helper exists with tests
- [ ] `index.astro` uses computed values
- [ ] `NOTIFICATION_DURATION` constants defined
- [ ] `useNotification` tests use the constants
