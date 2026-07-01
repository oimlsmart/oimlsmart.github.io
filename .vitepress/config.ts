import { defineConfig } from 'vitepress'
import { docsSidebar } from './data/docs-sidebar'
import { navItems } from './data/nav'
import { generateRssFeed } from './rss'

export default defineConfig({
  title: 'OIML SMART',
  description: 'Standards that are Machine-Actionable, Readable and Transferrable.',
  lang: 'en-US',
  lastUpdated: true,

  srcExclude: ['README.md', 'CLAUDE.md', 'TODO.site/**/*.md'],

  // Build-time configuration: the URL of the running OIML SMART app.
  // The /app/ page redirects here for OAuth sign-in.
  // Default: localhost:5190 (development). Override per build:
  //   APP_URL=https://app.oimlsmart.org npm run build
  env: {
    APP_URL: process.env.APP_URL || 'http://localhost:5190',
  },

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    // font-display:swap is appended via &display=swap — fonts load async
    ['link', {
      rel: 'preload stylesheet',
      as: 'style',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
    }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/smart-logo-light.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/smart-logo-light.png', sizes: '512x512' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'OIML SMART pilot updates', href: '/feed.xml' }],
    ['meta', { name: 'theme-color', content: '#004996' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['meta', { name: 'robots', content: 'noindex, nofollow' }],
  ],

  themeConfig: {
    logo: {
      light: '/smart-logo-light.svg',
      dark: '/smart-logo-dark.svg',
    },
    siteTitle: 'OIML SMART',

    nav: navItems,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/oimlsmart' },
    ],

    footer: {
      message: 'A programme of the <a href="https://www.oiml.org">International Organization of Legal Metrology</a>, delivered by <a href="https://www.ribose.com">Ribose</a>',
      copyright: 'Content © OIML · Code © Ribose',
    },

    sidebar: {
      '/docs/': docsSidebar,
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Search', buttonAriaLabel: 'Search OIML SMART' },
        },
        miniSearch: {
          searchOptions: {
            boost: { title: 4, text: 1, slug: 2 },
            prefix: true,
            fuzzy: 0.2,
          },
        },
      },
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next',
    },

    darkModeSwitchLabel: 'Theme',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Back to top',
  },

  // Build hook — emit /feed.xml after VitePress produces its output.
  async buildEnd(siteConfig) {
    await generateRssFeed(siteConfig)
  },
})
