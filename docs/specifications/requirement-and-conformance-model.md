
<PageHero
  eyebrow="Formal Specification · SMART_REQS 02"
  title="Requirement & Conformance Model"
  lede="Formal model for requirements and conformance tests — the core provision entities."
/>


<DraftCallout />


## Purpose

This document defines the complete data model for Layer 1 (Requirements) and Layer 2
(Conformance Tests), including the m:n linking between them. Every variable, step,
method, and criterion must be explicitly declared.

## Layer 1: Requirement Model

### RequirementClass

A named scope that groups requirements applicable to a common subject.

```yaml
groups:
- scopes:
  - title: "Metrological requirements for load cells"
    name: Metrological requirements
    identifier: /req/metrological
    target: /req/metrological        # self-reference for class-level
    subject: "load cell"
    applicability:
      accuracy_class: [A, B, C, D]
      technology: [analogue-passive, analogue-active, digital]
    requirements:
    - ...  # Requirement entries
```

### Requirement

A single normative provision with formal acceptance criteria.

```yaml
- name: "Maximum permissible error"
  identifier_fragment: mpe
  identifier: /req/metrological/mpe
  reference: "urn:oiml:pub:r:60-1:2021#tabl-4"
  statement: |
    The maximum permissible error (MPE) for a load cell shall not exceed the
    values given in Table 4, multiplied by the apportioning factor p_LC.
  obligation: shall
  subjects:
    - slot: 1
      entity_id: LoadCell
      label: "the load cell"
  applicability: {}  # template: applies to all classes
  parameters:
    - name: p_LC
      type: number
      unit: dimensionless
      description: "Apportioning factor"
      range: { min: 0.3, max: 1.0 }
      default: 0.7
  acceptance_criteria:
    type: tiered
    description: "MPE with class-specific breakpoints (R 60-1, Table 4)"
    variable: load
    variable_unit: v
    limit_expression: "factor × p_LC"
    referenced_function: lookupMPE
    tiers:
      - range: { min: 0, max: 50000 }
        limit: { factor: 0.5, expression: "0.5 × p_LC" }
      - range: { min: 50000, max: 200000 }
        limit: { factor: 1.0, expression: "1.0 × p_LC" }
      - range: { min: 200000 }
        limit: { factor: 1.5, expression: "1.5 × p_LC" }
  verification:
    method: testing
    description: "Determined by load testing per R 60-3, 2.1"
```

### Acceptance Criteria Types

Three formal types, each declaring the variable under test and the pass condition:

| Type | Use When | Key Fields |
|------|----------|------------|
| **TieredCriteria** | Multi-range lookup (MPE tiers) | `variable`, `tiers[].range`, `tiers[].limit.factor` |
| **ThresholdCriteria** | Single comparison | `variable`, `limit.operator`, `limit.expression`, `limit.threshold_expression` |
| **QualitativeCriteria** | Checklist/inspection | `items[].description`, `items[].reference` |

Threshold operators: `lte`, `gte`, `eq`, `lt`, `gt`, `abs_lte`.

### Specialization

A generic requirement becomes class-specific via `applicability` + `specialization`:

```yaml
# Template (no applicability)
- name: "Maximum permissible error"
  identifier: /req/metrological/mpe
  acceptance_criteria:
    type: tiered
    tiers: [...]  # generic tiers with factor

# Specialized for Class A
- name: "Class A MPE"
  identifier: /req/class-a/mpe
  applicability: { accuracy_class: [A] }
  specialization:
    dimension: accuracy_class
    value: A
    template_id: /req/metrological/mpe
  parameters:
    - name: p_LC
      range: { min: 0.3, max: 1.0 }
      default: 0.7
  acceptance_criteria:
    type: tiered
    # Class A tiers: 0-50000v → 0.5×p_LC, 50000-200000v → 1.0×p_LC, >200000v → 1.5×p_LC
```

## Layer 2: Conformance Test Model

### ConformanceTestClass

Groups tests by scope, targeting a requirements class:

```yaml
# In conformance/metrological.yaml
groups:
- scopes:
  - title: "Metrological conformance tests"
    name: Metrological conformance tests
    identifier: /conf/metrological-tests
    target: /req/metrological
    subject: "load cell testing"
    test_subject:
      entity: MeasuringInstrument
      classification_dimensions:
        accuracy_class: [A, B, C, D]
        technology: [analogue-passive, analogue-active, digital]
        humidity_class: [CH, SH, NH]
    tests:
    - ...  # ConformanceTest entries
```

### ConformanceTest

A single test procedure with structured steps, declared variables, and formal criteria.

```yaml
- name: "Determination of creep error and dead load output return"
  identifier_fragment: creep-dr
  reference: "urn:oiml:pub:r:60-2:2021#clause-2.10.2"
  targets:
    - /req/metrological/creep
    - /req/metrological/creep-20-30
    - /req/metrological/dr
  type: Testing
  purpose: |
    Verify that creep over 30 minutes does not exceed 0.7 × |MPE|, that the
    difference between 20 and 30 minute readings does not exceed 0.15 × |MPE|,
    and that dead load output return does not exceed 0.5 v.
  method: |
    Apply D_max (90–100% of E_max) and hold for 30 minutes. Record indications
    at specified intervals. Calculate C_C per R 60-3, 2.1.5. Always use
    p_LC = 0.7 for MPE calculation. Repeat at each test temperature.

  # ── Test Variables: every variable used by this test ──
  variables:
    - name: D_max
      type: number
      unit: kg
      source: declared
      description: "Maximum test load, 90–100% of E_max"

    - name: D_min
      type: number
      unit: kg
      source: declared
      description: "Minimum test load"

    - name: conversion_factor_f
      type: number
      unit: "counts/v"
      source: derived
      derivation: "ocl{(avgIndicationAt75pct - indicationAtDmin) / (0.75 * n_LC)}"
      description: "Conversion factor from counts to verification units"

    - name: initial_dmax_indication
      type: number
      unit: counts
      source: measured
      description: "Indication at D_max at time t = 0"

    - name: creep_readings
      type: collection
      item_type:
        name: CreepReading
        fields:
          - name: time_minutes
            type: number
            unit: min
            source: declared
          - name: indication_counts
            type: number
            unit: counts
            source: measured
          - name: change_v
            type: number
            unit: v
            source: derived
            derivation: "ocl{(indication_counts - $context.initial_dmax_indication) / $context.conversion_factor_f}"
      source: measured
      description: "Time-series of creep readings at D_max"

    - name: max_creep_change_v
      type: number
      unit: v
      source: derived
      derivation: "ocl{creep_readings->collect(r | r.change_v)->max()}"
      description: "Maximum creep change across all readings"

    - name: creep_30min
      type: number
      unit: v
      source: derived
      derivation: "ocl{creep_readings->select(r | r.time_minutes = 30)->first().change_v}"
      description: "Creep change at exactly 30 minutes"

    - name: creep_20min
      type: number
      unit: v
      source: derived
      derivation: "ocl{creep_readings->select(r | r.time_minutes = 20)->first().change_v}"
      description: "Creep change at exactly 20 minutes"

    - name: initial_dmin_indication
      type: number
      unit: counts
      source: measured
      description: "Indication at D_min before creep test"

    - name: final_dmin_indication
      type: number
      unit: counts
      source: measured
      description: "Indication at D_min after creep test"

    - name: dr_value
      type: number
      unit: v
      source: derived
      derivation: "ocl{(final_dmin_indication - initial_dmin_indication) / conversion_factor_f}"
      description: "Dead load output return in verification units"

    - name: mpe_at_dmax
      type: number
      unit: v
      source: computed
      derivation: "ocl{lookup_mpe(D_max, $context.accuracy_class, 0.7)}"
      description: "MPE at D_max with p_LC = 0.7 (forced for creep)"

  # ── Test Steps: ordered actions with I/O variables ──
  steps:
    - order: 1
      action: "Record initial indication at D_min"
      input_variables: [D_min]
      output_variables: [initial_dmin_indication]

    - order: 2
      action: "Apply D_max load (90–100% of E_max)"
      input_variables: [D_max]
      output_variables: []

    - order: 3
      action: "Record initial indication at D_max (t = 0)"
      input_variables: []
      output_variables: [initial_dmax_indication]

    - order: 4
      action: "Hold D_max for 30 minutes, recording at specified intervals"
      input_variables: [conversion_factor_f]
      output_variables: [creep_readings]
      note: "Readings taken at t = 2, 5, 10, 20, 30 minutes"

    - order: 5
      action: "Remove load, return to D_min"
      input_variables: []
      output_variables: []

    - order: 6
      action: "Record final indication at D_min"
      input_variables: []
      output_variables: [final_dmin_indication]

  # ── Acceptance Criteria: formal OCL conditions ──
  acceptance_criteria:
    type: composite
    pass_if: "ocl{creep_30min_criterion and creep_20_30_criterion and dr_criterion}"
    items:
      - name: creep_30min_criterion
        target: /req/metrological/creep
        pass_if: "ocl{abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)}"
        description: "|C_C(30 min)| ≤ 0.7 × |MPE| at D_max"

      - name: creep_20_30_criterion
        target: /req/metrological/creep-20-30
        pass_if: "ocl{abs(creep_30min - creep_20min) <= 0.15 * abs(mpe_at_dmax)}"
        description: "|C_C(30-20)| ≤ 0.15 × |MPE|"

      - name: dr_criterion
        target: /req/metrological/dr
        pass_if: "ocl{abs(dr_value) <= 0.5}"
        description: "|C_DR| ≤ 0.5 v"

  # ── Result Forms: m:n link to Layer 3 ──
  result_forms:
    - creep-dr
```

### TestVariable

Every variable used in a test must be declared with:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique within the test |
| `type` | string | `number`, `integer`, `string`, `boolean`, `enum`, `collection` |
| `unit` | string | SI or domain unit |
| `source` | enum | `declared`, `measured`, `derived`, `computed`, `lookup` |
| `derivation` | OCL expression | Required when `source` is `derived` or `computed` |
| `description` | string | What this variable represents |

Variable sources:
- **declared**: Stated by manufacturer or evaluator (not measured).
- **measured**: Directly observed by test operator.
- **derived**: Computed from other variables via OCL expression.
- **computed**: Evaluated by a registered computation function.
- **lookup**: Looked up from a value model table.

### TestStep

Every step declares which variables it consumes and produces:

| Field | Type | Description |
|-------|------|-------------|
| `order` | integer | Execution order (1-based) |
| `action` | string | Human-readable description |
| `input_variables` | string[] | Names of variables consumed |
| `output_variables` | string[] | Names of variables produced |
| `note` | string | Optional clarification |

### The Closed-Reference Rule

Within a ConformanceTest:
1. Every variable name in `steps[*].input_variables` or `steps[*].output_variables`
   MUST be declared in `variables`.
2. Every variable name in `acceptance_criteria.items[*].pass_if` MUST be declared
   in `variables`.
3. Every variable referenced in a `derivation` OCL expression MUST be either:
   - Declared in `variables`, or
   - A registered computation function, or
   - A context variable (`$context.*`).

### The targets Relationship (m:n)

A ConformanceTest links to Requirements via `targets`:

```
ConformanceTest.creep-dr
  targets: [/req/metrological/creep, /req/metrological/creep-20-30, /req/metrological/dr]

ConformanceTest.measurement-error-repeatability-mdlo
  targets: [/req/metrological/mpe, /req/metrological/repeatability,
            /req/metrological/temperature-effect-mdlo, /req/metrological/temperature-limits]
```

A single requirement may be targeted by multiple tests. A single test may target
multiple requirements. The m:n relationship is captured in the test's `targets` array
and resolved bidirectionally by the cross-reference generator.

### The result_forms Relationship (m:n)

A ConformanceTest links to Forms via `result_forms`:

```
ConformanceTest.creep-dr
  result_forms: [creep-dr]

ConformanceTest.measurement-error-repeatability-mdlo
  result_forms: [load-cell-errors, repeatability, temperature-mdlo]
```

A form may serve multiple tests. A test may use multiple forms. The m:n relationship
is declared in the test and validated by the schema generator.

## Complete R 60 Test Catalog

| Test Identifier | Targets | Result Forms |
|---|---|---|
| measurement-error-repeatability-mdlo | mpe, repeatability, temp-effect-mdlo, temp-limits | load-cell-errors, repeatability, temperature-mdlo |
| creep-dr | creep, creep-20-30, dr | creep-dr |
| barometric-pressure | barometric-pressure | barometric-pressure |
| humidity-ch | humidity-ch | humidity-ch |
| humidity-sh | humidity-sh | humidity-ch (shared form) |
| span-stability | span-stability | span-stability |
| electronic-fault | significant-fault | esd, bursts, surge, emc-susceptibility |
| voltage-variation | voltage-variation | power-voltage |
| markings-inspection | markings | software-examination |
| documentation-inspection | documentation | test-report-checklist |
