---
title: Sign in to OIML SMART
layout: page
---

<script setup>
import { onMounted, ref } from 'vue'

const OAUTH_CLIENT_ID = 'Ov23li14hMhdjgtfWKBA'
const appUrl = (typeof window !== 'undefined')
  ? (window.__APP_URL__ || 'http://localhost:5190')
  : 'http://localhost:5190'

const oauthUrl = `${appUrl}/api/auth/signin/github`
const demoLoginUrl = `${appUrl}/app/login`
const isDark = ref(false)

onMounted(() => {
  const html = document.documentElement
  isDark.value = html.classList.contains('dark')
  const observer = new MutationObserver(() => {
    isDark.value = html.classList.contains('dark')
  })
  observer.observe(html, { attributes: true, attributeFilter: ['class'] })
})
</script>

<div class="login-shell">
  <div class="login-card">
    <div class="login-mark">
      <img :src="isDark ? '/smart-logo-dark.svg' : '/smart-logo-light.svg'" alt="OIML SMART" />
    </div>

    <h1 class="login-title">Sign in</h1>
    <p class="login-lede">
      Authenticate with GitHub OAuth to continue into the OIML SMART
      application. The app will open at the configured URL.
    </p>

    <a class="login-btn primary" :href="oauthUrl">
      <span class="icon">↗</span>
      <span>Continue with GitHub</span>
    </a>

    <a class="login-btn ghost" :href="demoLoginUrl">
      <span class="icon">⌂</span>
      <span>Use a demo account</span>
    </a>

    <div class="login-meta">
      <div class="meta-row">
        <span class="meta-label">OAuth App</span>
        <code>{{ OAUTH_CLIENT_ID }}</code>
      </div>
      <div class="meta-row">
        <span class="meta-label">Dev URL</span>
        <code>{{ appUrl }}</code>
      </div>
      <div class="meta-row">
        <span class="meta-label">Demo password</span>
        <code>demo2026</code>
      </div>
    </div>

    <p class="login-foot">
      Demo accounts (password <code>demo2026</code>):
      <code>admin@oiml.org</code> · <code>ia@oiml.org</code> ·
      <code>tl@oiml.org</code> · <code>viewer@oiml.org</code> ·
      <code>developer@ribose.com</code>
    </p>
  </div>
</div>

<style scoped>
.login-shell {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.login-card {
  background: var(--vp-c-bg-soft-up);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  position: relative;
}

.login-mark {
  width: 96px;
  height: 96px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
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

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-base);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
  margin-bottom: 0.625rem;
}

.login-btn.primary {
  background-color: var(--vp-c-brand-1);
  color: #ffffff;
  border: 1px solid var(--vp-c-brand-1);
}

.login-btn.primary:hover {
  background-color: var(--vp-c-brand-3);
  border-color: var(--vp-c-brand-3);
}

.login-btn.ghost {
  background-color: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.login-btn.ghost:hover {
  border-color: var(--vp-c-text-1);
}

.login-btn .icon {
  font-family: var(--vp-font-family-mono);
}

.login-meta {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--vp-c-divider);
  text-align: left;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
}

.meta-label {
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.meta-row code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  color: var(--vp-c-text-1);
}

.login-foot {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

.login-foot code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.6875rem;
}
</style>