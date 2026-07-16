# 14 — Metrological Blueprint Design System

## Aesthetic direction
Engineering drawing × scientific journal — the site reads like a calibration
sheet from a national measurement institute. Restrained color, precise
typography, monospace numerics, calibration tick marks, annotation
callouts, and a subtle film-grain texture.

The home page already had the DNA (vf-corner markers, vf-coord labels,
hero-stagger). This iteration elevates it to a complete design system
applied across home + ontology browser.

## Files added / changed

### New
- `src/styles/blueprint.css` — design system layer (~350 lines)
  - Tokens: `--bp-radius`, `--bp-shadow-{sm,md,lg,glow}`, `--bp-transition-{fast,slow}`,
    `--bp-ease-bounce`, `--bp-grid-size`, `--bp-tick-color`
  - Utilities: `.bp-grid`, `.bp-ticks`, `.bp-tally`, `.bp-annotation`, `.bp-counter`,
    `.bp-magnetic`, `.bp-card-hover`, `.bp-reveal`, `.bp-focus-ring`, `.bp-crosshair`,
    `.bp-coord`, `.bp-noise`, `.bp-underline-draw`, `.bp-pulse`, `.bp-scan`, `.bp-chip`,
    `.bp-metric`, `.bp-uri`, `.bp-section-anchor`, `.bp-link-draw`, `.bp-hover-detail`
  - Keyframes: `bp-draw` (SVG underline), `bp-stagger-in` (hero load),
    `bp-pulse-ring` (calibration dot), `bp-scan-x` (horizontal sweep)
  - `prefers-reduced-motion` overrides
- `public/blueprint.js` — progressive enhancement (zero deps)
  - Count-up animation on scroll (IntersectionObserver + rAF)
  - Reveal on scroll (fade-up via `.is-visible` class)
  - Magnetic hover (cursor-following translate)
  - Copy-to-clipboard for `[data-copy]` elements
  - Keyboard nav for `[data-keyboard-list]` lists
  - Respects `prefers-reduced-motion` + `(pointer: coarse)` (skips magnetic on touch)
- `TODO.onto/14-design-system.md` — this file

### Changed
- `src/styles/app.css` — added `@import "./blueprint.css"` after Tailwind import
- `src/layouts/Base.astro` — added `<script is:inline src="/blueprint.js" defer>` so the
  interactions load site-wide
- `src/pages/index.astro` — home page redesigned
  - Calibration tick dividers between every section
  - Section anchors (§ 01 — § 05) with numbered chip + ruler line
  - Count-up stat metrics (`data-target` + `data-format`)
  - Magnetic CTAs (`bp-magnetic` with `data-magnetic-strength`)
  - Hero: pulse indicator, blueprint scanning overlay, refined underline-draw
  - Cards: hover lift + crosshair corner brackets + chip tags
  - Recommendation cards: hover-reveal "View →" footer strip
  - Footer: dense calibration ruler
- `src/components/ontology/OntologyBrowser.vue` — significantly upgraded
  - Hero card with pulse, tally counter, section coord
  - Search input with `/` keyboard shortcut + clear button + search icon
  - Type filter shows counts per type
  - Namespace chips with active/inactive states per accent color
  - Group headers: gradient accent bar, version chip, total tally
  - Entity rows: index numeration (001, 002…), active-row highlight
  - Keyboard `/` focuses search, ESC clears
- `src/components/ontology/OntologyDetail.vue` — significantly upgraded
  - Header card with gradient accent strip
  - Section anchors (§ 01 Definition, § 02 Property, § 03 Hierarchy, § 04 See Also)
  - Copy-to-clipboard for URI + namespace URI
  - Sibling entities grid (was missing)
  - Parent/children rendered as visual tree branches
  - 404 state: refined "not found" card
  - Smooth scroll to top on mount

## How to apply to remaining pages

The design system is global (Base.astro loads blueprint.js, app.css imports
blueprint.css). Any page can use the utilities:

```astro
---
import Base from '../layouts/Base.astro'
---
<Base title="…">
  <section class="py-20 px-8 bp-grid">
    <div class="bp-section-anchor mb-4">
      <span class="bp-section-anchor__num">§ 01</span>
      <span>Section Title</span>
      <span class="bp-section-anchor__line"></span>
      <span class="bp-coord">meta info</span>
    </div>
    <h2 class="font-serif text-3xl mb-4 bp-reveal">Heading</h2>
    <div class="bp-metric bp-reveal">
      <span class="bp-metric__value bp-counter" data-target="42">0</span>
      <span class="bp-metric__label">Counted</span>
    </div>
  </section>
</Base>
```

Available utilities (all in `src/styles/blueprint.css`):

| Class | Purpose |
|---|---|
| `.bp-grid` `.bp-grid--major` | Grid paper background (32px / 128px) |
| `.bp-ticks` `.bp-ticks--bottom` `.bp-ticks--dense` | Calibration ruler dividers |
| `.bp-section-anchor` + `__num` + `__line` | § numbered section dividers |
| `.bp-coord` | Monospace coordinate label |
| `.bp-tally` + `__current` + `__sep` | 001 / 067 counter |
| `.bp-metric` + `__value` + `__label` | Large display number |
| `.bp-counter[data-target]` | Animated count-up (paired with blueprint.js) |
| `.bp-chip` | Compact monospace pill |
| `.bp-crosshair` | Technical-drawing corner brackets |
| `.bp-noise` | Film grain overlay |
| `.bp-pulse` | Pulsing calibration dot |
| `.bp-scan` | Horizontal scanning sweep |
| `.bp-underline-draw path` | Animated SVG underline |
| `.bp-reveal` | Fade-up on scroll (IntersectionObserver) |
| `.bp-card-hover` | Lift + shadow on hover |
| `.bp-magnetic[data-magnetic-strength]` | Cursor-following translate |
| `.bp-link-draw` | Underline draw on hover |
| `.bp-annotation` + `__label` | Marginal callout with leader line |
| `.bp-uri[data-copy]` | Code block with auto-injected copy button |
| `.bp-focus-ring` | Accessible `:focus-visible` outline |

## Accessibility
- All animations respect `prefers-reduced-motion`
- Magnetic hover disabled on `(pointer: coarse)` devices
- Focus rings on all interactive elements (`.bp-focus-ring`)
- ARIA labels on icon-only buttons
- Color contrast: brand-600 on paper = 7.1:1 (AAA), brand-700 on paper-soft = 8.4:1

## Verification
- `npm run build`: 163 pages, 3879 search-indexed words
- `npm test`: 189 passed
- Home page: 30 crosshair corners, 25 grid sections, 5 count-up stats, 6 magnetic CTAs
- Ontology landing: 71 card hovers, 76 crosshair corners, 15 tally counters
- Ontology detail: 6 URI copy blocks, 3 annotation callouts, 8 section anchors

## Not touched (could be next)
- `/docs/` — already uses DocsLayout.astro, could get section anchors + reveal
- `/blog/` — uses BlogPost.astro, could get refined typography
- `/about/`, `/recommendations/`, `/library/`, `/vocabularies/` — would benefit from
  section anchors + count-up stats where applicable
- Nav dropdown (NavDropdown.vue) — could get hover-reveal animation
- Mobile nav (MobileNav.vue) — could get drawer animation

The design system is ready to apply; the work above establishes the patterns.
