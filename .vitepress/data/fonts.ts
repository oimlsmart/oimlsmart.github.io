/**
 * Single source of truth for web font loading.
 *
 * The CSS subset the site actually uses, expressed once. Consumed by
 * `.vitepress/config.ts` for `<link rel="preload stylesheet">` so fonts
 * start loading at the head of the document.
 *
 * To add a weight or family: edit here, rebuild. Nothing else.
 *
 * Each family maps to a list of axis-tuples. For variable fonts with
 * multiple axes (e.g. Fraunces has opsz + wght), each tuple carries
 * values for BOTH axes — Google Fonts requires `opsz,wght@9,400;9,500;9,600`,
 * not `opsz,wght@9,400;500;600`.
 */

type AxisTuple = readonly number[]

const FAMILIES: Readonly<Record<string, readonly AxisTuple[]>> = {
  // Fraunces: optical-size axis (opsz) pinned to 9 (display range),
  // three weights for headings + hero italic.
  'Fraunces:opsz,wght': [
    [9, 400],
    [9, 500],
    [9, 600],
  ],
  'IBM+Plex+Sans:wght': [
    [400],
    [500],
    [600],
  ],
  'IBM+Plex+Mono:wght': [
    [400],
    [500],
  ],
}

function encodeFamily(family: string, tuples: readonly AxisTuple[]): string {
  const parts = tuples.map((t) => t.join(','))
  return `${family}@${parts.join(';')}`
}

export const FONT_URL: string =
  'https://fonts.googleapis.com/css2?' +
  Object.entries(FAMILIES)
    .map(([family, tuples]) => `family=${encodeFamily(family, tuples)}`)
    .join('&') +
  '&display=swap'

export const FONT_PRELOAD_URL: string = FONT_URL