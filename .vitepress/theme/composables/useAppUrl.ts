/**
 * useAppUrl — the canonical URL of the running OIML SMART app.
 *
 * Reads `APP_URL` from Vite's `import.meta.env`, which Vite statically
 * replaces at build time. SSR-safe (no `window` access). Defaults to
 * the smart app's Vite dev port (`http://localhost:5190`).
 *
 * Override per build:
 *   APP_URL=https://app.oimlsmart.org npm run build
 *
 * Used by:
 *   - LoginCard.vue (constructs the OAuth signin URL)
 *
 * Replaces the previous `window.__APP_URL__` global that was set as a
 * side effect of `enhanceApp`. The composable makes the contract
 * explicit and typed.
 */
import { computed, type Ref } from 'vue'

const DEFAULT_APP_URL = 'http://localhost:5190'

export function useAppUrl(): Ref<string> {
  const env = (import.meta as any).env || {}
  const url: string = typeof env.APP_URL === 'string' && env.APP_URL.length > 0
    ? env.APP_URL
    : DEFAULT_APP_URL
  return computed(() => url)
}
