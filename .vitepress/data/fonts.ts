/**
 * Single source of truth for web font loading.
 *
 * The CSS subset the site actually uses, expressed once. Consumed by
 * `.vitepress/config.ts` for `<link rel="preload stylesheet">` so fonts
 * start loading at the head of the document.
 *
 * To add a weight or family: edit here, rebuild. Nothing else.
 *
 * Light mode hero/italic uses Fraunces 400+500.
 * Headings use 500/600. Body 400. Mono 400/500.
 * No 300 or 700 weights are used.
 */

const FAMILIES = {
  'Fraunces:opsz,wght': [9, [400, 500, 600]],
  'IBM+Plex+Sans:wght': [[400, 500, 600]],
  'IBM+Plex+Mono:wght': [[400, 500]],
} as const

function encodeFamily(family: string, axes: readonly (number | readonly number[])[]): string {
  const parts = axes.map((axis) =>
    Array.isArray(axis) ? axis.join(';') : String(axis)
  )
  return `${family}@${parts.join(',')}`
}

export const FONT_URL: string =
  'https://fonts.googleapis.com/css2?' +
  Object.entries(FAMILIES)
    .map(([family, axes]) => `family=${encodeFamily(family, axes as readonly (number | readonly number[])[])}`)
    .join('&') +
  '&display=swap'

export const FONT_PRELOAD_URL: string = FONT_URL
