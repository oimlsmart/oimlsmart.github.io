import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import HomePage from './components/HomePage.vue'
import InternalBanner from './components/InternalBanner.vue'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout: (props, ctx) => {
    return h(DefaultTheme.Layout, props, {
      ...ctx.slots,
      'layout-top': () => h(InternalBanner),
    })
  },
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('InternalBanner', InternalBanner)
    if (typeof window !== 'undefined') {
      const cfg = (import.meta as any).env || {}
      ;(window as any).__APP_URL__ = cfg.APP_URL || 'http://localhost:5190'
    }
  },
}

export default theme