# 11 — Dark mode audit + entity type chip desaturation

## Problem 1: entity type chips are rainbow noise
The current `ontologyTypeMeta` uses 7 different Tailwind palettes for type chips:

| Type | Current color |
|---|---|
| class | `bg-blue-100 text-blue-800` |
| objectProperty | `bg-green-100 text-green-800` |
| concept | `bg-teal-100 text-teal-800` (conflicts with the SMART ontology teal!) |
| conceptScheme | `bg-cyan-100 text-cyan-800` |
| ontology | `bg-indigo-100 text-indigo-800` |
| individual | `bg-orange-100 text-orange-800` |
| external | `bg-slate-100 text-slate-600` |

These compete with the 3-accent ontology colors. The eye doesn't know where to look. Also, the teal type chip collides with the teal ontology chip — same color, different meaning.

## Deliverable 1: desaturate type chips
Replace ALL type chip colors with neutral slate. The type LABEL (not color) becomes the differentiator:

```ts
export const ontologyTypeMeta = {
  class:            { label: 'Class',              color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', colorDot: 'bg-slate-500' },
  objectProperty:   { label: 'Obj Prop',           color: '...slate...', colorDot: 'bg-slate-500' },
  datatypeProperty: { label: 'Datatype Prop',      color: '...slate...', colorDot: 'bg-slate-500' },
  annotationProperty: { label: 'Annotation Prop',  color: '...slate...', colorDot: 'bg-slate-500' },
  shape:            { label: 'Shape',              color: '...slate...', colorDot: 'bg-slate-500' },
  concept:          { label: 'Concept',            color: '...slate...', colorDot: 'bg-slate-500' },
  conceptScheme:    { label: 'Concept Scheme',     color: '...slate...', colorDot: 'bg-slate-500' },
  individual:       { label: 'Individual',         color: '...slate...', colorDot: 'bg-slate-500' },
  ontology:         { label: 'Ontology',           color: '...slate...', colorDot: 'bg-slate-500' },
  external:         { label: 'External',           color: '...slate...', colorDot: 'bg-slate-400' },
}
```

Use short labels (e.g. "Obj Prop" instead of "Object Property") so chips stay narrow.

Also: add the missing types currently absent from `ontologyTypeMeta` (`datatypeProperty`, `annotationProperty`, `shape`). Without these, entities of those types fall through to the default fallback styling.

## Problem 2: dark mode coverage
Every new color combination needs dark variants. Audit the Vue templates:

| Pattern | Light | Dark |
|---|---|---|
| Ontology chip (brand) | `bg-brand-100 text-brand-800` | `dark:bg-brand-900/40 dark:text-brand-200` |
| Ontology chip (teal) | `bg-teal-100 text-teal-800` | `dark:bg-teal-900/40 dark:text-teal-200` |
| Ontology chip (amber) | `bg-amber-100 text-amber-800` | `dark:bg-amber-900/40 dark:text-amber-200` |
| Type chip (slate) | `bg-slate-100 text-slate-700` | `dark:bg-slate-800 dark:text-slate-300` |
| Group header accent | `text-brand-700` (etc.) | `dark:text-brand-300` (etc.) |
| Entity card | `bg-paper-soft border-rule` | (already has dark via semantic tokens) |

The `paper-soft`, `paper`, `ink`, `ink-soft`, `ink-muted`, `rule` semantic tokens already flip in dark mode (defined in app.css). So using them for chrome is safe.

## Deliverable 2: verify rendered output
After all changes:
1. Run `npm run build` — must complete without errors
2. `curl http://localhost:4321/ontology/` and grep for:
   - `oiml-r60` → must return 0 matches (R60 hidden)
   - `bg-brand-100 text-brand-800` → at least 1 match (oiml chip)
   - `bg-teal-100 text-teal-800` → at least 1 match (smart chip)
   - `bg-amber-100 text-amber-800` → at least 1 match (pubtype chip)
3. Toggle dark mode (look at `/ontology/oiml-Standard` in dark theme) — chips should remain readable.

## Acceptance
- All type chips render as slate (light gray in light mode, dark gray in dark mode)
- All 3 ontology chips have working dark mode variants
- No type chip uses non-slate colors
- Build is clean
