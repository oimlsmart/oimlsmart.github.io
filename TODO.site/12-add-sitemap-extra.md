# Sitemap and Search Console

**Status**: VitePress generates a sitemap by default; not yet submitted.

## Goal

- Verify that `sitemap.xml` is generated at `.vitepress/dist/sitemap.xml`.
- Submit it to Google Search Console and Bing Webmaster Tools.
- Verify ownership (typically via a meta tag in `config.ts` `head`).

## Steps

1. After the first production deploy, fetch `https://www.oimlsmart.org/sitemap.xml` and confirm it lists all pages.
2. Add the property to Google Search Console.
3. Verify ownership — either upload an HTML file or add a meta tag.
4. Submit the sitemap.
5. Monitor for crawl errors.

## VitePress specifics

VitePress 1.6+ generates a sitemap automatically when `lastUpdated: true` is set in config (which it is). No extra config needed.
