# 09 — Add vitest infrastructure

**Status:** pending
**Blocks:** all subsequent phases (10-15)

## Why

Per the migration directive: lock in current behavior with tests BEFORE migrating, so any regression during migration is caught immediately. Vitest is the right framework because:
- Already used in `smart/browser/` (consistency)
- Native Vite integration (Astro uses Vite)
- Jest-compatible API (low learning curve)
- First-class Vue support via `@vue/test-utils`

## What to do

### 1. Install dev dependencies

```sh
npm install -D vitest @vue/test-utils @vitest/coverage-v8 jsdom @vitejs/plugin-vue
```

(`@vitejs/plugin-vue` is needed so vitest can compile `.vue` files in test mode — `@astrojs/vue` configures this for dev/build but not for vitest's standalone mode.)

### 2. Create `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.test.ts', 'src/content/**'],
    },
  },
})
```

### 3. Add scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 4. Write a smoke test

`src/components/ThemeToggle.test.ts`:
- Mount the component
- Click the button
- Assert `isDark` toggles
- Assert `document.documentElement.classList` updates

This proves vitest can mount Vue components under Astro before we migrate anything substantial.

### 5. CI integration

Add to `.github/workflows/ci.yml` (or create if missing):
```yaml
- name: Test
  run: npm run test
```

## Acceptance criteria

- [ ] `npm install -D` succeeds
- [ ] `vitest.config.ts` exists at repo root
- [ ] `npm test` runs and passes the smoke test
- [ ] `npm run test:coverage` produces a coverage report
- [ ] CI runs the test step

## What this unlocks

Once vitest works here, every subsequent migration task can:
1. Port tests from `smart/browser/src/__tests__/`
2. Run them against the new code location
3. Catch any behavioral drift immediately
