<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    class="theme-toggle"
    @click="toggle" data-testid="theme-toggle"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <span v-show="!isDark" class="icon-sun">☀</span>
    <span v-show="isDark" class="icon-moon">☾</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: 1px solid var(--rule);
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  color: inherit;
  transition: border-color 0.15s;
}
.theme-toggle:hover {
  border-color: var(--accent);
}
</style>