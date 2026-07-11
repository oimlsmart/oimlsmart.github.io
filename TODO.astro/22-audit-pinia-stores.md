# 22 — Audit: encapsulate module-scoped singletons behind Pinia stores

**Status:** ✓ implemented
**Type:** architectural improvement
**Audit finding:** reactive state currently lives in module-scoped refs (e.g., `useNotification.notifications`)

## Finding

The ported `useNotification.ts` follows the original pattern:

```ts
const notifications = ref<Notification[]>([])  // module-scoped

export function useNotification() {
  return { notifications, success, /* ... */ }
}
```

This works but:
- **Side-effects at module load**: notifications ref is created when the module imports, even if never used
- **No devtools integration**: hard to debug state changes
- **No namespacing**: every composable reaches for module scope; conflicts if names collide
- **Test pollution**: tests must remember to clear module state in beforeEach
- **No SSR story**: module-scoped state leaks between requests on the server

## Proposal

Adopt **Pinia** for state that is genuinely global (notifications, current user, current standard). Pinia provides:
- Stores as functions returning reactive state (lazy)
- Vue devtools integration
- SSR-safe state scoping
- Test isolation via `createTestingPinia()`

For purely local component state, keep `ref()` inside `<script setup>` — Pinia is overkill for that.

### Migration target

```ts
// src/stores/notifications.ts
import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function add(n: Omit<Notification, 'id'>) {
    const id = crypto.randomUUID()
    notifications.value.push({ ...n, id })
    setTimeout(() => dismiss(id), n.duration ?? (n.type === 'error' ? 6000 : 3000))
  }
  function dismiss(id: string) {
    const i = notifications.value.findIndex(n => n.id === id)
    if (i !== -1) notifications.value.splice(i, 1)
  }

  return {
    notifications,
    success: (title: string, message?: string) => add({ type: 'success', title, message }),
    error: (title: string, message?: string) => add({ type: 'error', title, message }),
    warning: (title: string, message?: string) => add({ type: 'warning', title, message }),
    info: (title: string, message?: string) => add({ type: 'info', title, message }),
    dismiss,
  }
})
```

### Caller

```ts
import { useNotificationStore } from '~/stores/notifications'

const notifications = useNotificationStore()
notifications.success('Saved')
```

In tests:

```ts
import { createTestingPinia } from '@pinia/testing'

beforeEach(() => {
  mount(MyComponent, { global: { plugins: [createTestingPinia()] } })
})
```

## Trade-offs

**Pros**
- Lazy state (only created when first used)
- Test isolation per test
- Vue devtools support
- Future-proofs SSR (TODO.astro/13)
- Pinia is the Vue-ecosystem standard

**Cons**
- Adds ~7KB to bundle
- Existing callers must migrate (`useNotification()` → `useNotificationStore()`)
- Initial setup needs Pinia plugin in main.ts

## Migration plan

1. Install Pinia in this site
2. Create `src/stores/notifications.ts` (port useNotification)
3. Find all callers, replace
4. Delete `src/lib/useNotification.ts`
5. Repeat for other module-scoped state (e.g., useAuth)

## Acceptance criteria

- [ ] Pinia added as dependency
- [ ] `src/stores/notifications.ts` exists
- [ ] All callers migrated
- [ ] `src/lib/useNotification.ts` removed
- [ ] Existing tests still pass (port to createTestingPinia)
