import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import HomePage from './components/HomePage.vue'
import InternalBanner from './components/InternalBanner.vue'
import PageHero from './components/PageHero.vue'
import DraftCallout from './components/DraftCallout.vue'
import RecCard from './components/RecCard.vue'
import StatRow from './components/StatRow.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import AcronymStrip from './components/AcronymStrip.vue'
import AudienceGrid from './components/AudienceGrid.vue'
import HomeSection from './components/HomeSection.vue'
import LoginCard from './components/LoginCard.vue'
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
    app.component('PageHero', PageHero)
    app.component('DraftCallout', DraftCallout)
    app.component('RecCard', RecCard)
    app.component('StatRow', StatRow)
    app.component('FeatureGrid', FeatureGrid)
    app.component('AcronymStrip', AcronymStrip)
    app.component('AudienceGrid', AudienceGrid)
    app.component('HomeSection', HomeSection)
    app.component('LoginCard', LoginCard)

    if (typeof window !== 'undefined') {
      const cfg = (import.meta as any).env || {}
      ;(window as any).__APP_URL__ = cfg.APP_URL || 'http://localhost:5190'
    }
  },
}

export default theme