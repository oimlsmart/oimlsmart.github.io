---
title: Directory structure
description: Every SMART Recommendation follows the same directory layout. Knowing where each artifact lives makes authoring fast and review tractable.
eyebrow: 'Guide · 03 of 13'
---

<PageHero />

## Per-standard layout

```
data/oiml-r60/
├── standard.yaml                 # identity, value model, terminology
├── dimensions.yaml               # classification axes (accuracy, range, etc.)
├── navigation.yaml               # app navigation entries
├── enums.yaml                    # shared enumerations
├── cross-refs.yaml               # cross-reference graph
├── entity-relationships.yaml     # entity-graph declarations
├── evaluation-profiles.yaml      # evaluation workflow profiles
├── formulas.yaml                 # AsciiMath formula library
├── calculations.yaml             # Calculation primitive definitions
├── calculation-context.yaml      # binding context for calculations
├── data-classes.yaml             # data class declarations
├── data-registries.yaml          # data registry declarations
├── gateways.yaml                 # gateway declarations
├── models/                       # model declarations
├── anr/                          # ANR (additional national requirements)
├── approvals/                    # approval workflow declarations
├── documents/                    # document fragment declarations
├── requirements/
│   ├── rc.yaml                   # requirements class schema
│   ├── metrological.yaml         # individual requirements
│   ├── technical.yaml
│   └── ...
├── conformance/
│   ├── cc.yaml                   # conformance class schema
│   ├── measurement-error-mdlo.yaml  # individual tests
│   └── ...
└── forms/
    ├── measurement-error-mdlo.yaml  # form schemas
    └── ...
```

## Cross-standard layout

```
data/
├── oiml-r60/                     # one directory per Recommendation
├── oiml-r129/
├── oiml-r144/
├── schemas/                      # JSON Schemas for validation
│   ├── requirements.schema.json
│   ├── conformance-test.schema.json
│   ├── form.schema.json
│   ├── standard.schema.json
│   └── dimensions.schema.json
└── platform/
    ├── catalog.yaml              # document catalog
    └── docs/                     # platform documentation YAML
        ├── about.yaml
        └── oiml-cs.yaml
```

## The generated side

After build, the generated TypeScript modules live under:

```
browser/src/data/generated/
├── r60/
│   ├── requirements.ts           # all R 60 requirements
│   ├── conformance.ts            # all R 60 tests
│   ├── forms.ts                  # all R 60 forms
│   ├── standard.ts               # R 60 standard + dimensions
│   └── ontology.ts               # R 60 domain ontology
├── r129/
│   └── ...
├── ontology.ts                   # cross-standard ontology
└── index.ts                      # manifest of all standards
```

The application imports these modules at runtime. There is no dynamic loading
of YAML in production — everything is pre-validated TypeScript.

## Conventions

- **One entity per file** when entities are large (forms, tests). Group small entities (terminology entries, enums) in a single file.
- **Naming**: lowercase-kebab-case for files. Camel-case for identifiers (`mpe`, `measurementErrorMdlo`).
- **Cross-references**: always use the URN form (`urn:oiml:requirement:r60:mpe`), never a file path.
- **Comments**: YAML files support `#` comments — use them to record the source clause from the Recommendation (`# R 60 §3.4.1`).

## Next

[Identity & Dimensions](/docs/guides/identity-dimensions.html) walks through what goes in `standard.yaml` and `dimensions.yaml`.
