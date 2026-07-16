# 09 — Color system: site's 3-accent palette

## Context
The site's design tokens (`src/styles/app.css`) define exactly **3 accent colors**:

```
--accent   = brand-600 #004996  (primary "OIML blue")
--accent-2 = teal      #024873  (secondary, foundation)
--accent-3 = amber-warm #d97706 (tertiary, vocabulary)
```

The current ontology browser ignores this discipline:
- `ontologyNamespaces` only has 1 entry (oiml) with `color: "emerald"` — emerald is NOT in the 3-accent palette
- Entity type chips use a 7-color rainbow that competes with the brand palette
- The visible namespace groups are incomplete (smart + oiml-pubtype are missing)

## Deliverables

### 9.1 Fix `ontologyNamespaces` in `src/data/ontology-data.ts`
Replace the single oiml entry with 3 entries using the 3-accent color names:

| Prefix | Color name | Maps to |
|---|---|---|
| `smart` | `teal` | `--accent-2` |
| `oiml` | `brand` | `--accent` |
| `oiml-pubtype` | `amber` | `--accent-3` |

(R60 is omitted entirely — it's filtered at the view layer per TODO #08.)

### 9.2 Add `namespaceColors` map in Vue components
A small lookup table in `OntologyBrowser.vue` and `OntologyDetail.vue`:

```ts
const namespaceColors: Record<string, { chip: string; dot: string; border: string; headerAccent: string }> = {
  brand: {
    chip: 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
    dot: 'bg-brand-500',
    border: 'border-l-brand-400',
    headerAccent: 'text-brand-700 dark:text-brand-300',
  },
  teal: {
    chip: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
    dot: 'bg-teal-500',
    border: 'border-l-teal-400',
    headerAccent: 'text-teal-700 dark:text-teal-300',
  },
  amber: {
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    dot: 'bg-amber-500',
    border: 'border-l-amber-400',
    headerAccent: 'text-amber-700 dark:text-amber-300',
  },
  slate: { /* fallback */ },
}
```

### 9.3 Visual hierarchy in `OntologyBrowser.vue`
- **Hero lede**: name the 3 ontologies inline with their accent colors (e.g. `<span class="text-teal-700">IEC-ISO SMART</span>`)
- **Namespace filter chip row**: "All (N)" + one chip per ontology with its accent color, dot, and count
- **Group headers**: colored dot + accent-colored title + version + entity count
- **Entity lists**: colored left border matching the group's accent

### 9.4 Visual hierarchy in `OntologyDetail.vue`
- Breadcrumb includes the ontology name (e.g. `← Ontology Browser / IEC-ISO SMART Core`)
- Header shows a namespace chip next to the type chip: `<span class="bg-teal-100 ...">smart</span>`
- Footer shows a small "Ontology" card with the namespace's accent dot + title + URI + version

## Acceptance
- The browser landing shows 3 distinct ontology groups, each visually coded with a unique accent.
- Entity detail pages show which ontology the entity belongs to via a colored chip.
- No use of `emerald`, `purple`, `indigo`, `cyan`, `orange`, or `lime` outside of entity-type chips (which are being desaturated per TODO #11).
- The 3 visible accents match the site-wide brand/teal/amber identity.
