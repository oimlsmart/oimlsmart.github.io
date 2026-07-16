# 15 — prefers-reduced-motion: forbidden (user rule)

## Rule
**Never** add `@media (prefers-reduced-motion: reduce)` overrides or `window.matchMedia('(prefers-reduced-motion: reduce)')` checks that disable animations. All motion runs unconditionally.

## Origin
On 2026-07-16, when the Metrological Blueprint design work shipped with copy stating "All animations respect prefers-reduced-motion", the user responded:

> No I do not want this at all. remember

This is an explicit override of the default accessibility best-practice. Saved as a permanent feedback memory at `~/.claude/projects/-Users-mulgogi-src-oimlsmart-oimlsmart-github-io/memory/no-prefers-reduced-motion.md`.

## Files changed
- `src/styles/blueprint.css` — removed 3 `@media (prefers-reduced-motion: reduce)` blocks (bp-reveal override, hero-stagger override, and the global "disable everything" block at the end)
- `public/blueprint.js` — removed the `prefersReduced` constant and every `if (prefersReduced)` branch; bp-reveal and bp-counter now always observe and animate; bp-magnetic always wires up
- `src/pages/index.astro` — removed the `prefers-reduced-motion` style block that neutralised the globe rings + parallax + hero afterglow; removed the `prefersReduced` JS variable and the early-return in `initParallax`
- `src/pages/login.astro` — removed the `prefers-reduced-motion` style block that disabled the .enter / gate-* animations

## Verification
- `grep -rn "prefers-reduced-motion\|prefersReduced" src/ public/` returns zero matches
- `npm run build` clean (163 pages)
- All animations now run regardless of OS-level motion preference

## Future work
- When adding new animations elsewhere in the site, DO NOT add reduced-motion overrides. The user wants motion to be unconditional.
- If a future accessibility audit flags this, escalate to the user rather than silently re-adding the media query.
