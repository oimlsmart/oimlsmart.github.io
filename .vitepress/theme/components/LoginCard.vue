<script setup lang="ts">
/**
 * LoginCard — the GitHub OAuth launcher card on /app/.
 *
 * The OAuth URL is built from `useAppUrl()` — Vite statically injects
 * `APP_URL` at build time (see `composables/useAppUrl.ts`).
 *
 * Dark-mode logo swap is delegated to the useTheme composable.
 */
import { computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useAppUrl } from '../composables/useAppUrl'

const appUrl = useAppUrl()
const oauthUrl = computed(() => `${appUrl.value}/api/auth/signin/github`)
const { isDark } = useTheme()
const logoSrc = computed(() =>
  isDark.value ? '/smart-logo-dark.svg' : '/smart-logo-light.svg'
)
</script>

<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-mark">
        <ClientOnly>
          <img :src="logoSrc" alt="OIML SMART" />
        </ClientOnly>
      </div>

      <h1 class="login-title">Sign in</h1>
      <p class="login-lede">
        Authenticate via GitHub OAuth to continue into the OIML SMART application.
      </p>

      <a class="btn btn-primary login-btn" :href="oauthUrl">
        <span class="icon">↗</span>
        <span>Continue with GitHub</span>
      </a>

      <p class="login-foot">
        Requires the smart app running locally. From the
        <code>smart</code> repo, run <code>bin/dev</code>.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-shell {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  width: 100%;
}

.login-card {
  background: var(--vp-c-bg-soft-up);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 16px 48px -24px rgba(10, 22, 40, 0.18);
}

.login-mark {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.5rem;
}

.login-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: globe-rotate 90s linear infinite;
}

@keyframes globe-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .login-mark img { animation: none; }
}

.login-title {
  font-family: var(--vp-font-family-serif);
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.login-lede {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0 0 2rem;
}

/* Login-specific overrides on .btn — slightly larger padding and
   full-width inside the card. The base button styles come from
   utilities.css (.btn / .btn-primary). */
.login-btn {
  width: 100%;
  padding: 0.875rem 1rem;
}

.login-btn .icon {
  font-family: var(--vp-font-family-mono);
}

.login-foot {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--vp-c-divider);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.login-foot code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  background: var(--vp-c-bg-soft);
  padding: 0.0625rem 0.375rem;
  border-radius: 2px;
}
</style>