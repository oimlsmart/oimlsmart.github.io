# Tune local search

**Status**: default VitePress local search.

## Goal

Tune the search index so users get relevant results, not noise.

## Specific items

- **Exclude stub pages** from the index (e.g. `/docs/ref/yaml-schema.html` and `/docs/ref/type-definitions.html` until they have real content).
- **Boost overview pages** in relevance ranking (VitePress uses MiniSearch — see its `boost` option).
- **Add weighting** to titles and headings so concept searches surface overview pages.

## Approach

In `config.ts`:

```ts
search: {
  provider: 'local',
  options: {
    miniSearch: {
      // see https://vitepress.dev/reference/site-config#local-search
    },
  },
},
```

## Acceptance

- Searching for "MPE" surfaces the Tables & Lookups and Forms pages.
- Searching for "certificate" surfaces the OIML-CS and Evaluation pages.
- Stub pages don't dominate results for their stub-keywords.
