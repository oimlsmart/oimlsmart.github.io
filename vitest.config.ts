/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Vitest config — separate from astro.config.mjs because Astro's
// built-in Vite doesn't expose the test API. This file is what
// `npm test` reads. Vue plugin is needed so .vue SFCs compile.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/content/**',
        'src/pages/**/*.astro',
      ],
    },
  },
})
