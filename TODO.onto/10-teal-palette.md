# 10 — Define proper teal-50..950 palette

## Problem
The site sets `--color-teal: #024873` (a deep navy-blue, hue ≈ 200) but doesn't define the rest of the teal palette. Tailwind 4's default teal palette (greenish, hue ≈ 175) is still registered, so:

- `bg-teal-100` renders as **greenish** (#99f6e4)
- `bg-teal` renders as the site's **navy-blue** (#024873)

These are two different colors with the same name. The result: when we write `bg-teal-100 text-teal-800` for a SMART Core chip, it shows greenish instead of the site's accent-2 identity.

## Deliverable

Add a full `teal-50..950` palette to the `@theme` block in `src/styles/app.css`, derived from the site's `#024873` hue. Smooth ramp from very light (95%+ lightness) to very dark (under 10%), with 600 = #024873.

```css
@theme {
  /* ... existing tokens ... */

  /* Teal palette aligned with the site's --color-teal (#024873 = teal-600).
     Replaces Tailwind's default greenish teal so bg-teal-100/bg-teal-700/etc.
     match the --accent-2 identity. */
  --color-teal-50:  #f0f7fc;
  --color-teal-100: #dbeaf3;
  --color-teal-200: #b3d5e6;
  --color-teal-300: #82bad5;
  --color-teal-400: #4d9ac0;
  --color-teal-500: #1a7aa3;
  --color-teal-600: #024873;  /* == --color-teal (site) */
  --color-teal-700: #023d62;
  --color-teal-800: #013150;
  --color-teal-900: #00243d;
  --color-teal-950: #001629;
}
```

Keep the existing `--color-teal`, `--color-teal-light`, `--color-teal-dark` for backward compatibility (legacy references in scoped CSS).

## Amber palette
Tailwind's default amber-600 is `#d97706`, which already matches `--color-amber-warm` / `--accent-3`. No palette override needed — `bg-amber-100`/`bg-amber-800` will use Tailwind's defaults and be visually consistent.

## Acceptance
- After the change, `bg-teal-100 text-teal-800` renders as a light navy-blue chip with dark navy-blue text.
- The SMART Core namespace chip visually matches the site's `--accent-2` identity.
- `--color-teal-light` and `--color-teal-dark` still work (legacy aliases).
