import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'

const isE2E = process.env.E2E_TESTING === 'true'

export default defineConfig({
  site: 'https://www.oimlsmart.org',
  output: 'static',
  ...(isE2E ? {} : {
    adapter: cloudflare({
      platformProxy: { enabled: true },
    }),
  }),
  integrations: [sitemap(), mdx(), vue({ appEntrypoint: '/src/_app.ts' })],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
})