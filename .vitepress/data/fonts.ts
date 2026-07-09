/**
 * Single source of truth for web font loading.
 *
 * Consumed by `.vitepress/config.ts` for `<link rel="preload stylesheet">`
 * so fonts start loading at the head of the document.
 *
 * To add a weight or family: edit the URL here, rebuild. Nothing else.
 *
 * Fraunces uses the full optical-size range (9..144) so text at any
 * size gets the right glyph variant. Source Serif 4 is included as
 * a secondary serif (used in the CSS font stack). IBM Plex Sans/Mono
 * are the body and code families.
 */

export const FONT_URL: string =
  'https://fonts.googleapis.com/css2?' +
  'family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700' +
  '&family=IBM+Plex+Sans:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Mono:wght@400;500;600' +
  '&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700' +
  '&display=swap'

export const FONT_PRELOAD_URL: string = FONT_URL