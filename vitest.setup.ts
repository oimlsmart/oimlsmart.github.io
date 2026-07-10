// Vitest setup — polyfill browser APIs that jsdom doesn't implement.
// Loaded once per test run via vitest.config.ts `setupFiles`.

// Note: fake-indexeddb is imported per-file (in repository.test.ts)
// with @vitest-environment node — it conflicts with jsdom.

// window.matchMedia — used by ThemeToggle.vue and other components.
// Only available in jsdom; skip in node env (repository tests).
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}