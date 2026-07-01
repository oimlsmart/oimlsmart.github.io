# Port landing page visuals

**Status**: home page uses text + stat grid + acronym strip only.

## Goal

The smart app's landing page (`smart/browser/src/pages/public/landing.vue`) has:

- A **spinning globe** hero animation (`SpinningGlobeWrapper.vue`).
- A more polished feature grid with icons.
- A platform-stats section that pulls live counts from the underlying data.

Port at least the spinning globe and the icon-decorated feature cards.

## Approach

- Convert the Vue component to a static Vue component inside `.vitepress/theme/components/HomePage.vue` (VitePress supports Vue components natively).
- If the globe uses Three.js or WebGL, evaluate whether the weight is worth it for a marketing page. Consider a CSS animation as a lightweight alternative.

## Acceptance

- The home page has a visual hero element (not just text).
- The feature cards have icon decoration.
- Lighthouse performance score remains above 80 on mobile.
