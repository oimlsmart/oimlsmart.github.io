---
title: 'Identity & Dimensions'
description: 'Two foundational files — `standard.yaml` and `dimensions.yaml` — tell the platform what the standard is and how the instrument varies. Everything else builds on these.'
eyebrow: 'Guide · 04 of 13'
---

<PageHero />

## `standard.yaml` — identity

The `standard.yaml` file declares who the standard is and what enums it uses.

```yaml
id: oiml-r60
shortName: "R 60"
fullName: "Metrological regulation for load cells"
year: 2021
doctype: international-recommendation
publisher: "OIML"
custodian: "TC 9 — Instruments for measuring mass and density"
urn: "urn:oiml:recommendation:r60:2021"

enums:
  accuracy_class:
    type: string
    label: "Accuracy Class"
    values: [A, B, C, D]
  output_type:
    type: string
    label: "Output Type"
    values: [analog, digital]
  max_intervals:
    type: number
    label: "Maximum number of verification intervals"

terminology:
  # inline definitions; can also be in a separate terminology.yaml
  - term: load cell
    definition: |
      Force transducer that, after taking into account the effects of
      gravity and air buoyancy at its location, converts a measured quantity
      (force) into an output signal proportional to the measured quantity.
```

### Fields

- `id` — unique slug, matches the directory name.
- `shortName`, `fullName`, `year` — display metadata.
- `doctype` — one of `international-recommendation`, `international-document`, etc.
- `urn` — the canonical URN.
- `enums` — keyed enumerations used in dimensions and forms.
- `terminology` — defined terms (also linkable from requirements).

## `dimensions.yaml` — classification axes

A **dimension** is a classification axis of the instrument under test. Examples
for R 60: accuracy class, output type, maximum number of verification intervals.

```yaml
dimensions:
  - id: accuracy_class
    label: "Accuracy Class"
    enum: accuracy_class
    applicability:
      default: true
  - id: output_type
    label: "Output Type"
    enum: output_type
    applicability:
      default: true
  - id: temperature_class
    label: "Temperature Class"
    enum: temperature_class
    applicability:
      filter: |
        standard.enums.temperature_class.contains(value)
```

### Why dimensions matter

The same requirement template produces different acceptance criteria for
different dimensional contexts through **specialization**. For example, the
R 60 maximum permissible error table varies by accuracy class — the same
`Requirement` declaration parameterizes its threshold by the `accuracy_class`
dimension.

When the application evaluates a FormInstance, the engine:

1. Walks up to the sample's ClassificationGroup.
2. Reads the dimension values from the group.
3. Selects the specialized criteria that match those dimension values.
4. Evaluates the sample against the specialized criteria.

## Dimension applicability

Not every dimension applies to every instrument. The `applicability` block
declares when a dimension is in scope:

- `default: true` — always applicable unless explicitly overridden.
- `filter:` — an OCL predicate that must hold for the dimension value to apply.

## Next

With identity and dimensions in place, the [Provision Data Model](/docs/guides/provision-data-model.html) guide shows how requirements, tests, and forms fit together.
