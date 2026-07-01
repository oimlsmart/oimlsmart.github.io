<PageHero
  eyebrow="Formal Specification · SMART_REQS 09"
  title="Table Definition and Lookup Primitive"
  lede="The Table primitive — tiered, scalar, and range lookups with interpolation."
/>


<DraftCallout />


## Purpose

This document defines the **Table** as a first-class primitive entity in the SMART
specification system. Tables define structured lookup data — tiered thresholds,
parameter profiles, classification constraints — that Calculations and Conditions
reference via formal lookup operations.

## Design Rationale

R 60 defines several tables in the normative text:
- **Table 4**: MPE tiers per accuracy class (0–50000v → 0.5×p_LC, etc.)
- **Table 5**: Repeatability test runs per class (A/B → 5 runs, C/D → 3 runs)
- **Temperature increment**: 2°C for A, 5°C for B/C/D
- **p_LC ranges**: 0.3–1.0 for passive, 0.7–0.8 for electronic
- **n_LC ranges**: per class
- **Temperature span minimums**: per class

These are currently defined as `value_model` profiles in `standard.yaml` — an ad-hoc
structure that's not formally typed or validated. Making Table a first-class primitive
provides:

1. **Typed columns** with explicit types and units
2. **Formal key structure** for lookup operations
3. **Validation** that lookup keys match table dimensions
4. **Reusability** across calculations and conditions
5. **Rendering** — tables can be displayed as HTML/MathML from their definition

## Entity Definition

### Table

```yaml
tables:
  - name: mpeTiers
    identifier: /table/mpe-tiers
    description: "Maximum permissible error tiers per accuracy class (R 60-1, Table 4)"
    reference: "urn:oiml:pub:r:60-1:2021#tabl-4"
    category: metrological
    key: [accuracyClass]
    columns:
      - name: range_min
        type: number
        unit: v
        description: "Lower bound of load range"
      - name: range_max
        type: number
        unit: v
        description: "Upper bound of load range (null = unbounded)"
      - name: factor
        type: number
        unit: dimensionless
        description: "MPE multiplier applied to p_LC"
      - name: expression
        type: string
        description: "Human-readable limit expression"
    rows:
      - key: { accuracyClass: A }
        data:
          - { range_min: 0, range_max: 50000, factor: 0.5, expression: "0.5 × p_LC" }
          - { range_min: 50000, range_max: 200000, factor: 1.0, expression: "1.0 × p_LC" }
          - { range_min: 200000, range_max: null, factor: 1.5, expression: "1.5 × p_LC" }
      - key: { accuracyClass: B }
        data:
          - { range_min: 0, range_max: 5000, factor: 0.5, expression: "0.5 × p_LC" }
          - { range_min: 5000, range_max: 20000, factor: 1.0, expression: "1.0 × p_LC" }
          - { range_min: 20000, range_max: null, factor: 1.5, expression: "1.5 × p_LC" }
      - key: { accuracyClass: C }
        data:
          - { range_min: 0, range_max: 500, factor: 0.5, expression: "0.5 × p_LC" }
          - { range_min: 500, range_max: 2000, factor: 1.0, expression: "1.0 × p_LC" }
          - { range_min: 2000, range_max: null, factor: 1.5, expression: "1.5 × p_LC" }
      - key: { accuracyClass: D }
        data:
          - { range_min: 0, range_max: 50, factor: 0.5, expression: "0.5 × p_LC" }
          - { range_min: 50, range_max: 200, factor: 1.0, expression: "1.0 × p_LC" }
          - { range_min: 200, range_max: null, factor: 1.5, expression: "1.5 × p_LC" }
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Unique table name |
| `identifier` | string | yes | Formal identifier (e.g., `/table/mpe-tiers`) |
| `description` | string | yes | What this table defines |
| `reference` | string | no | Normative URN to the table in the standard |
| `category` | string | no | `metrological`, `electronic`, `classification` |
| `key` | string[] | yes | Dimension names used for lookup |
| `columns` | array | yes | Typed column definitions |
| `rows` | array | yes | Data rows keyed by dimension values |

### Table Column

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Column name |
| `type` | string | yes | `number`, `integer`, `string`, `boolean` |
| `unit` | string | no | Measurement unit |
| `description` | string | no | What this column contains |

### Table Row

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | object | yes | Key values matching the `key` dimensions |
| `data` | array | yes | Array of column-value objects |

## Table Types

### 1. Tiered Table (MPE)

Multiple rows per key, with range columns for lookup:

```yaml
- name: mpeTiers
  key: [accuracyClass]
  columns: [range_min, range_max, factor, expression]
  rows:
    - key: { accuracyClass: C }
      data:
        - { range_min: 0, range_max: 500, factor: 0.5 }
        - { range_min: 500, range_max: 2000, factor: 1.0 }
        - { range_min: 2000, range_max: null, factor: 1.5 }
```

Lookup: `table_lookup('mpeTiers', {accuracyClass: 'C', load: 1000})` → `{factor: 1.0}`

The lookup matches the row where `range_min <= load < range_max`.

### 2. Scalar Table (Parameter Profile)

Single value per key:

```yaml
- name: testRuns
  identifier: /table/test-runs
  description: "Number of test runs per accuracy class"
  reference: "urn:oiml:pub:r:60-1:2021#clause-5.4"
  key: [accuracyClass]
  columns:
    - name: runs
      type: integer
      description: "Number of identical load applications"
  rows:
    - key: { accuracyClass: A }
      data: [{ runs: 5 }]
    - key: { accuracyClass: B }
      data: [{ runs: 5 }]
    - key: { accuracyClass: C }
      data: [{ runs: 3 }]
    - key: { accuracyClass: D }
      data: [{ runs: 3 }]
```

Lookup: `table_lookup('testRuns', {accuracyClass: 'C'})` → `{runs: 3}`

### 3. Range Table (Constraints)

Min/max ranges for parameter validation:

```yaml
- name: plcRanges
  identifier: /table/plc-ranges
  description: "Allowed p_LC ranges per technology type"
  reference: "urn:oiml:pub:r:60-1:2021#clause-3.7.2"
  key: [technology]
  columns:
    - name: min
      type: number
      unit: dimensionless
    - name: max
      type: number
      unit: dimensionless
    - name: default
      type: number
      unit: dimensionless
  rows:
    - key: { technology: analogue-passive }
      data: [{ min: 0.3, max: 1.0, default: 0.7 }]
    - key: { technology: analogue-active }
      data: [{ min: 0.7, max: 0.8, default: 0.7 }]
    - key: { technology: digital }
      data: [{ min: 0.7, max: 0.8, default: 0.7 }]
```

Lookup: `table_lookup('plcRanges', {technology: 'digital'})` → `{min: 0.7, max: 0.8, default: 0.7}`

## Lookup Operations

### In Calculations (math.js)

```yaml
- name: mpe
  expression: "lookup('mpeTiers', accuracyClass, load).factor * pLC"
```

math.js `lookup()` is a custom function registered in the scope that:
1. Resolves the table by name
2. Matches the key dimensions
3. For tiered tables, finds the row where `range_min <= load < range_max`
4. Returns the matched row data

### In OCL Conditions

```
ocl{abs(error_EL) <= abs(lookup('mpeTiers', $context.accuracy_class, test_load).factor * $context.p_LC)}
```

OCL's `lookup()` function resolves the table and returns the matched row. The
`.factor` property access retrieves the specific column value.

### Built-in lookup_mpe()

The `lookup_mpe(load, accuracyClass, pLC)` function is a convenience shorthand:

```typescript
// Equivalent to:
lookup('mpeTiers', accuracyClass, load).factor * pLC
```

This is the most common lookup in R 60, so it gets a dedicated function for brevity.

## Complete R 60 Table Catalog

| Identifier | Name | Key | Columns | Reference |
|---|---|---|---|---|
| `/table/mpe-tiers` | MPE tiers | accuracyClass | range_min, range_max, factor | R 60-1, Table 4 |
| `/table/test-runs` | Test runs | accuracyClass | runs | R 60-1, 5.4 |
| `/table/temperature-increment` | MDLO temperature increment | accuracyClass | increment | R 60-1, 5.6.1.3 |
| `/table/nlc-ranges` | n_LC ranges | accuracyClass | min, max | R 60-1, 3.7.3 |
| `/table/plc-ranges` | p_LC ranges | technology | min, max, default | R 60-1, 3.7.2 |
| `/table/min-temperature-span` | Minimum temperature span | accuracyClass | span | R 60-1, 5.6.1.1 |
| `/table/temperature-limits` | Temperature limits | (none) | standard_low, standard_high | R 60-1, 5.6.1.1 |

## Relationship to Existing System

| Current | Evolved |
|---------|---------|
| `value_model` profiles in standard.yaml (untyped bindings) | `tables` in standard.yaml (typed, keyed, formal) |
| `lookup_mpe()` hardcoded in computation registry | `lookup()` generic + `lookup_mpe()` convenience |
| MPE tiers only in acceptance_criteria tiers | MPE tiers in Table primitive, referenced by Calculation and Criteria |

## Validation

The table lookup system enables static validation:

1. Every `lookup('tableName', ...)` call references a declared table.
2. The key arguments match the table's `key` dimensions.
3. The returned column access (`.factor`) matches a declared column.
4. The lookup result type matches what the expression expects.

This ensures that no lookup can reference an undefined table or non-existent column.
