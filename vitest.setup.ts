// Vitest setup — polyfill browser APIs that jsdom doesn't implement.
// Loaded once per test run via vitest.config.ts `setupFiles`.

// window.matchMedia — used by ThemeToggle.vue and other components
// that respect prefers-color-scheme.
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
