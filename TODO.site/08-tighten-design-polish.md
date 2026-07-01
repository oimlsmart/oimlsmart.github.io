# Tighten design polish

**Status**: first-pass CSS only.

## Goal

The smart application's Vue UI is built with Tailwind and has a polished visual identity — serif headings, generous spacing, branded cards, animations. The current VitePress theme is a first-pass approximation. Bring it closer to the source.

## Specific items

- **Typography**: match the smart app's font stack (Source Serif Pro for headings, Inter for body). Currently declared in CSS but not loaded — add a Google Fonts link to `config.ts` `head`.
- **Hero**: port the spinning-globe animation from `smart/browser/src/components/SpinningGlobeWrapper.vue`. Currently the hero is text-only.
- **Feature cards**: more polished hover states and icons.
- **Dark mode**: verify the dark-mode brand variants render correctly (the smart app has specific dark-mode logo variants).
- **Sidebar**: match the smart app's docs sidebar styling.
- **Color tokens**: audit against the smart app's Tailwind palette to ensure the brand colors are accurate.

## Source

- `/Users/mulgogi/src/oimlsmart/smart/browser/src/styles/` — Tailwind config and base styles.
- `/Users/mulgogi/src/oimlsmart/smart/browser/src/layouts/` — the layout components.

## Acceptance

- Visual review by the design owner.
- Screenshots match the smart app's look where applicable.
