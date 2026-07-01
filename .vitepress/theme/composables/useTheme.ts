/**
 * useTheme — reactive access to VitePress's color-scheme class.
 *
 * VitePress toggles `.dark` on `<html>` when the user switches themes.
 * Components that need theme-aware rendering (e.g. swapping a logo SVG)
 * call this composable instead of re-implementing the MutationObserver
 * dance.
 *
 * SSR-safe: returns `false` on the server; the observer attaches only
 * in `onMounted`. The returned ref is readonly — callers read, they
 * don't write.
 *
 * Usage:
 *   const { isDark } = useTheme()
 *   <img :src="isDark ? '/dark.svg' : '/light.svg'" />
 */

import { ref, onMounted, onBeforeUnmount, type Readonly } from 'vue'

export interface ThemeState {
  readonly isDark: Readonly<Ref<boolean>>
}

import type { Ref } from 'vue'

export function useTheme(): { isDark: Ref<boolean> } {
  const isDark = ref(false)
  let observer: MutationObserver | null = null

  onMounted(() => {
    if (typeof document === 'undefined') return
    const html = document.documentElement
    isDark.value = html.classList.contains('dark')

    observer = new MutationObserver(() => {
      isDark.value = html.classList.contains('dark')
    })
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { isDark }
}
