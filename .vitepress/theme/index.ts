import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import InternalBanner from './components/InternalBanner.vue'
import PageHero from './components/PageHero.vue'
import DraftCallout from './components/DraftCallout.vue'
import LoginCard from './components/LoginCard.vue'
import BlogList from './components/BlogList.vue'
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
    // Components used directly in markdown — global registration so
    // markdown authors don't have to <script setup> import them.
    // Other components (HomePage, HomeHero, HomeSection, AcronymStrip,
    // StatRow, FeatureGrid, AudienceGrid, RecCard) are imported
    // explicitly by their parent .vue files; they don't need to be global.
    //
    // APP_URL is read via `useAppUrl()` from composables/useAppUrl.ts,
    // not via a window global. Vite statically injects it at build time.
    app.component('PageHero', PageHero)
    app.component('DraftCallout', DraftCallout)
    app.component('LoginCard', LoginCard)
    app.component('BlogList', BlogList)
  },
}

export default theme