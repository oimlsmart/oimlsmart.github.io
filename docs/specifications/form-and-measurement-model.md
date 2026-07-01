<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 03</span>
  <h1>Form & Measurement Model</h1>
  <p class="lede">Form schemas, fields, and measurement kinds.</p>
</div>


<div class="callout draft-notice">
<strong>DRAFT — Pilot programme</strong>
<p>
This document is part of the SMART_REQS specification set for the OIML SMART
pilot. It is a <strong>draft</strong> and may change without notice as the
pilot evolves. The current version is published from the OIML SMART
specification repository.
</p>
</div>


## Purpose

This document defines Layer 3 (Forms) and the measurement model that connects form
fields to the variables declared in conformance tests. Every field in a form must
declare its measurement kind, measurement method, and (for derived fields) an OCL
derivation expression.

## Form Schema

A form is a structured data capture template linked to one or more conformance tests.

```yaml
# forms/creep-dr.yaml
form_schema:
  name: CreepDR
  identifier: "r60-3/sec-2.1.5"
  description: "Creep and dead load output return test"
  section: "R 60-3, 2.1.5"
  scope: technical
  conformance_test: /conf/metrological-tests/creep-dr
  requirements:
    - /req/metrological/creep
    - /req/metrological/creep-20-30
    - /req/metrological/dr

  references:
    - urn: "urn:oiml:pub:r:60-1:2021#clause-5.5.1"
      role: requirement
    - urn: "urn:oiml:pub:r:60-2:2021#clause-2.10.2"
      role: test-procedure
    - urn: "urn:oiml:pub:r:60-3:2021#clause-2.1.5"
      role: calculation

  computation_context:
    header: load-cell-info
    dimensions: true
    tables: [mpe_tiers]

  fields:
    - name: creep_readings
      label: "Creep readings at D_max"
      type: array
      items:
        type: object
        fields:
          - name: time_minutes
            label: "Time (min)"
            type: number
            unit: min
            measurement_kind: NUMERIC
            measurement_method: declared

          - name: indication_counts
            label: "Indication (counts)"
            type: number
            unit: counts
            measurement_kind: NUMERIC
            measurement_method: direct
            precision: 1

          - name: change_v
            label: "Change (v)"
            type: number
            unit: v
            measurement_kind: DERIVED
            measurement_method: derived
            derivation: "ocl{(indication_counts - $context.initial_dmax_indication) / $context.conversion_factor_f}"

    - name: max_creep_change_v
      label: "Maximum creep change (v)"
      type: number
      unit: v
      measurement_kind: DERIVED
      measurement_method: derived
      derivation: "ocl{creep_readings->collect(r | r.change_v)->max()}"

    - name: creep_30min
      label: "Creep at 30 min (v)"
      type: number
      unit: v
      measurement_kind: DERIVED
      measurement_method: derived
      derivation: "ocl{creep_readings->select(r | r.time_minutes = 30)->first().change_v}"

    - name: creep_20min
      label: "Creep at 20 min (v)"
      type: number
      unit: v
      measurement_kind: DERIVED
      measurement_method: derived
      derivation: "ocl{creep_readings->select(r | r.time_minutes = 20)->first().change_v}"

    - name: dr_value
      label: "DR (v)"
      type: number
      unit: v
      measurement_kind: DERIVED
      measurement_method: derived
      derivation: "ocl{(final_dmin_indication - initial_dmin_indication) / $context.conversion_factor_f}"

    - name: mpe_at_dmax
      label: "MPE at D_max (v)"
      type: number
      unit: v
      measurement_kind: DERIVED
      measurement_method: computed
      derivation: "ocl{lookup_mpe($context.D_max, $context.accuracy_class, 0.7)}"

    - name: creep_30min_result
      label: "30-min creep result"
      type: enum
      values: [pass, fail]
      measurement_kind: "TRUE/FALSE"
      measurement_method: evaluated
      evaluation:
        rule: "ocl{abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)}"
        condition: "|C_C(30 min)| ≤ 0.7 × |MPE|"
        specification_reference: "R 60-1, 5.5.1"

    - name: creep_20_30_result
      label: "20–30 min creep result"
      type: enum
      values: [pass, fail]
      measurement_kind: "TRUE/FALSE"
      measurement_method: evaluated
      evaluation:
        rule: "ocl{abs(creep_30min - creep_20min) <= 0.15 * abs(mpe_at_dmax)}"
        condition: "|C_C(30–20)| ≤ 0.15 × |MPE|"

    - name: dr_half_v_result
      label: "DR ≤ 0.5 v result"
      type: enum
      values: [pass, fail]
      measurement_kind: "TRUE/FALSE"
      measurement_method: evaluated
      evaluation:
        rule: "ocl{abs(dr_value) <= 0.5}"
        condition: "|C_DR| ≤ 0.5 v"

  pass_fail:
    criteria: |
      30-min creep C_C(t) ≤ 0.7 × |MPE|;
      20–30 min difference C_C(30–20) ≤ 0.15 × |MPE|;
      C_DR ≤ 0.5 v
    pass_if: "ocl{creep_30min_result = 'pass' and creep_20_30_result = 'pass' and dr_half_v_result = 'pass'}"
```

## Measurement Kinds

Eight kinds, forming a discriminated union:

| Kind | Description | Key Fields |
|------|-------------|------------|
| **NUMERIC** | Single numeric value | `valid_range`, `precision`, `uncertainty` |
| **DATALIST** | Ordered array of measurements | `items` (nested MeasurementDef), `min_items`, `max_items` |
| **DERIVED** | Computed from OCL expression | `derivation` (required) |
| **TRUE/FALSE** | Boolean pass/fail | `evaluation.rule` (OCL condition) |
| **DURATION** | ISO 8601 time span | `pattern` |
| **TEXT** | Free-form string | `pattern`, `enum_values` |
| **TABLE_REFERENCE** | Looked up from value model | `table_ref`, `lookup_keys` |
| **TABLE_OPTIONS** | Selectable options from table | `table_ref` |

## Measurement Methods

Six methods describing how a value is obtained:

| Method | Meaning | OCL Engine Role |
|--------|---------|-----------------|
| **direct** | Observed/measured by operator | User provides value; engine stores it |
| **derived** | Computed from other fields via OCL | Engine evaluates `derivation` expression |
| **computed** | Evaluated by registered function | Engine calls named computation |
| **lookup** | Retrieved from value model table | Engine resolves `table_ref` + `lookup_keys` |
| **evaluated** | Boolean result from OCL condition | Engine evaluates `evaluation.rule`, produces pass/fail |
| **declared** | Stated by manufacturer/evaluator | User provides value; no computation |

## Computation Context

Shared parameters that derivation expressions may reference via `$context.*`:

```yaml
computation_context:
  header: load-cell-info       # Header form providing shared fields
  dimensions: true              # Classification dimensions in scope
  tables: [mpe_tiers]           # Lookup tables available
  # Resolved values (injected at evaluation time):
  #   $context.conversion_factor_f
  #   $context.accuracy_class
  #   $context.p_LC
  #   $context.n_LC
  #   $context.D_max
  #   $context.D_min
  #   $context.v_min
```

The computation context is populated from:
1. Header form field values (e.g., D_max, D_min, conversion_factor_f)
2. Application classification dimensions (accuracy_class, technology, humidity_class)
3. Value model lookups (n_LC from class, p_LC range from technology)

## Uncertainty Model

Any NUMERIC measurement may declare an uncertainty budget:

```yaml
uncertainty:
  type_a:
    standard_uncertainty: 0.012
    degrees_of_freedom: 9
  type_b:
    distribution: rectangular
    half_width: 0.005
  combined:
    coverage_factor: 2.0
    expanded_uncertainty: 0.026
    confidence_level: 0.95
```

Full GUM-compatible budget with component-level tracking:

```yaml
uncertainty:
  budget:
    - source: "Indicator resolution"
      type: B
      distribution: rectangular
      half_width: 0.5
    - source: "Repeatability (Type A)"
      type: A
      standard_uncertainty: 0.012
      degrees_of_freedom: 9
    - source: "Reference mass tolerance"
      type: B
      distribution: triangular
      half_width: 0.003
```

## Form-to-Test Variable Alignment

Every form field must align with a test variable declared in the linked ConformanceTest.
The alignment is by name: a form field named `max_creep_change_v` implements the test
variable `max_creep_change_v`.

If a form field is declared but has no corresponding test variable, it must have
`scope: administrative` (e.g., report metadata). If a test variable has no corresponding
form field, it must be provided by the computation context.

```
ConformanceTest.variables        Form.fields
─────────────────────        ────────────────
D_max (declared)         ←→  [header form: D_max]
conversion_factor_f      ←→  [header form: conversion_factor_f]
creep_readings           ←→  creep_readings (DATALIST)
max_creep_change_v       ←→  max_creep_change_v (DERIVED)
creep_30min              ←→  creep_30min (DERIVED)
creep_20min              ←→  creep_20min (DERIVED)
dr_value                 ←→  dr_value (DERIVED)
mpe_at_dmax              ←→  mpe_at_dmax (DERIVED)
creep_30min_result       ←→  creep_30min_result (TRUE/FALSE, evaluated)
creep_20_30_result       ←→  creep_20_30_result (TRUE/FALSE, evaluated)
dr_half_v_result         ←→  dr_half_v_result (TRUE/FALSE, evaluated)
```

## Field Derivation Rules

A field with `measurement_method: derived` or `measurement_method: computed` MUST have
a `derivation` field containing an OCL expression. The expression may reference:

1. Other fields in the same form (by name).
2. Fields in the computation context (`$context.*`).
3. Registered computation functions (`lookup_mpe`, `compute`).
4. Collection operations on DATALIST fields (`->collect`, `->select`, `->max`).

The derivation expression is evaluated by the OCL engine in dependency order
(topological sort). If a derivation references another derived field, that field is
evaluated first.

## Field Evaluation Rules

A field with `measurement_method: evaluated` MUST have an `evaluation` object:

```yaml
evaluation:
  rule: "ocl{abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)}"
  condition: "|C_C(30 min)| ≤ 0.7 × |MPE|"
  specification_reference: "R 60-1, 5.5.1"
```

- `rule`: An OCL boolean expression. The field value is `'pass'` if the expression
  evaluates to `true`, `'fail'` otherwise.
- `condition`: Human-readable statement of the condition (for reports).
- `specification_reference`: Normative clause where the condition is defined.

## Pass/Fail Definition

Each form declares an overall pass/fail condition:

```yaml
pass_fail:
  criteria: "Prose description of pass conditions"
  pass_if: "ocl{creep_30min_result = 'pass' and creep_20_30_result = 'pass' and dr_half_v_result = 'pass'}"
  derivation:
    - name: overall_result
      computation: "ocl{...}"
```

The `pass_if` expression must reference only evaluated fields (those with
`measurement_method: evaluated`) or derived boolean fields.
