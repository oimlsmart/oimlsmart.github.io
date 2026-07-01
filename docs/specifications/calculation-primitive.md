
<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 07</span>
  <h1>Calculation Primitive</h1>
  <p class="lede">The Calculation primitive — typed, reusable, named computations.</p>
</div>


<DraftCallout variant="specs" />


## Purpose

This document defines the **Calculation** as a first-class primitive entity in the
SMART specification system. A Calculation encapsulates a named, typed, reusable
computation with formally declared inputs, a typed output, and an OCL expression.
It sits at the Recommendation level alongside Requirements, Conformance Tests, and
Forms, and is referenced by both forms and tests to avoid duplicating formulas.

## Design Rationale

Without a Calculation primitive, the same formula appears in multiple places:
- `E_L = (I - I_ref) / f` appears in load-cell-errors, humidity-sh, and span-stability
- `lookup_mpe(load, class, pLC)` appears in every test that checks MPE
- `(max(runs) - min(runs)) / f` appears in load-test-3run, load-test-5run, repeatability, humidity-ch

This violates MECE and DRY. A Calculation provides:
1. **Single definition point** — one canonical formula, typed and referenced.
2. **Reuse across forms and tests** — forms bind their field names to calculation inputs.
3. **Normative traceability** — each calculation links to the clause in R 60-1/2/3.
4. **Type safety** — inputs and output are typed, enabling static validation.
5. **Testability** — calculations can be unit-tested independently of forms.

## Entity Definition

### Calculation

```yaml
calculations:
  - name: loadCellError
    identifier: /calc/load-cell-error
    description: "Load cell error: difference between indicated and reference values, converted to verification units."
    reference: "urn:oiml:pub:r:60-3:2021#clause-2.1.3"
    inputs:
      - name: avgIndication
        type: number
        unit: counts
        description: "Average indication reading"
      - name: referenceIndication
        type: number
        unit: counts
        description: "Reference indication value"
      - name: conversionFactor
        type: number
        unit: "counts/v"
        description: "Conversion factor f"
    output:
      name: error_EL
      type: number
      unit: v
      description: "Load cell error in verification units"
    expression: "ocl{(avgIndication - referenceIndication) / conversionFactor}"
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Unique calculation name (camelCase) |
| `identifier` | string | yes | Formal identifier (e.g., `/calc/load-cell-error`) |
| `description` | string | yes | What this calculation computes |
| `reference` | string | no | Normative URN to the clause defining this formula |
| `inputs` | array | yes | Ordered list of typed input variables |
| `output` | object | yes | Typed output variable |
| `expression` | string | yes | OCL expression (`ocl{...}`) referencing only declared inputs |
| `category` | string | no | Grouping: `metrological`, `electronic`, `classification` |

### Input Variable

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Parameter name (used in expression) |
| `type` | string | yes | `number`, `integer`, `string`, `boolean`, `enum`, `collection` |
| `unit` | string | no | Measurement unit |
| `description` | string | no | What this input represents |
| `default` | any | no | Default value if not bound |

### Output Variable

Same fields as Input Variable, plus:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `valid_range` | object | no | `{min, max}` for output validation |

## Calculation Types

Three categories of calculations exist in R 60:

### 1. Expression Calculations
Pure mathematical expressions over their inputs:

```yaml
- name: conversionFactor
  identifier: /calc/conversion-factor
  reference: "urn:oiml:pub:r:60-3:2021#clause-2.1.2.4"
  inputs:
    - name: avgIndicationAt75pct
      type: number
      unit: counts
    - name: indicationAtDmin
      type: number
      unit: counts
    - name: n_LC
      type: integer
  output:
    name: f
    type: number
    unit: "counts/v"
  expression: "ocl{(avgIndicationAt75pct - indicationAtDmin) / (0.75 * n_LC)}"
```

### 2. Table Lookup Calculations
Look up a value from a value model table:

```yaml
- name: mpe
  identifier: /calc/mpe
  reference: "urn:oiml:pub:r:60-1:2021#tabl-4"
  inputs:
    - name: load
      type: number
      unit: v
    - name: accuracyClass
      type: enum
      enum_values: [A, B, C, D]
    - name: pLC
      type: number
      unit: dimensionless
  output:
    name: mpe
    type: number
    unit: v
  expression: "ocl{lookup_mpe(load, accuracyClass, pLC)}"
```

### 3. Pass/Fail Determination Calculations
Produce a boolean or enum (pass/fail) result:

```yaml
- name: passFailThreshold
  identifier: /calc/pass-fail-threshold
  inputs:
    - name: computedValue
      type: number
    - name: limit
      type: number
  output:
    name: result
    type: enum
    enum_values: [pass, fail]
  expression: "ocl{if abs(computedValue) <= abs(limit) then 'pass' else 'fail' endif}"
```

## Referencing Calculations from Forms

Form fields reference calculations by name and provide bindings from their local
field names to the calculation's input parameter names:

```yaml
- name: error_EL
  label: "Load cell error (v)"
  type: number
  unit: v
  measurement_method: derived
  calculation: loadCellError
  calculation_bindings:
    avgIndication: avg_indication        # form field → calculation input
    referenceIndication: reference_indication
    conversionFactor: conversion_factor_f
```

This is semantically equivalent to:
```yaml
derivation: "ocl{(avg_indication - reference_indication) / conversion_factor_f}"
```

But with the calculation reference, the formula is defined once and the form only
provides the name mapping. This enables:
- Static validation that all calculation inputs are bound
- Single-point-of-change for formula corrections
- Normative traceability from form field → calculation → specification clause

### Shorthand: Direct Derivation

For simple one-off expressions not reused across forms, the inline `derivation`
syntax remains valid:

```yaml
- name: dr_value
  derivation: "ocl{(final_dmin_indication - initial_dmin_indication) / conversion_factor_f}"
```

This is appropriate when the formula is form-specific and not shared.

## Referencing Calculations from Conformance Tests

Test variables may also reference calculations:

```yaml
# In a conformance test
variables:
  - name: error_EL
    type: number
    unit: v
    source: derived
    calculation: loadCellError
    calculation_bindings:
      avgIndication: avg_indication
      referenceIndication: reference_indication
      conversionFactor: conversion_factor_f
```

This ensures the test variable uses the same canonical formula as the form field,
maintaining the three-level condition alignment (requirement ≡ test ≡ form).

## YAML Schema Location

Calculations are declared in the standard definition:

```yaml
# In standard.yaml
evaluation:
  calculations:
    - name: loadCellError
      ...
    - name: mpe
      ...
  computations: [...]     # DEPRECATED: replaced by calculations
```

The existing `computations` array is deprecated in favor of `calculations`. The
generator continues to support both during transition.

## Relationship to Existing System

| Current | Evolved | Status |
|---------|---------|--------|
| `standard.yaml` computations (10 entries, JS syntax) | `standard.yaml` calculations (typed, OCL syntax) | Evolved |
| Inline `derivation:` on form fields | `calculation:` + `calculation_bindings:` on form fields | Optional |
| Inline `derivation:` on test variables | `calculation:` + `calculation_bindings:` on test variables | Optional |
| `field-evaluator.ts` string substitution | OCL engine evaluation | Replaced |

## Complete R 60 Calculation Catalog

| Identifier | Name | Inputs | Output | Reference |
|---|---|---|---|---|
| `/calc/conversion-factor` | Conversion factor f | avgInd75pct, indAtDmin, n_LC | f (counts/v) | R 60-3, 2.1.2.4 |
| `/calc/v-min` | Verification interval v_min | dMax, dMin, nLC, f | v_min (kg) | R 60-1, 3.7.5 |
| `/calc/mpe` | Maximum permissible error | load, accuracyClass, pLC | mpe (v) | R 60-1, Table 4 |
| `/calc/load-cell-error` | Load cell error E_L | avgIndication, refIndication, f | error_EL (v) | R 60-3, 2.1.3 |
| `/calc/repeatability-error` | Repeatability error E_R | indications (collection), f | repeatability (v) | R 60-3, 2.1.4 |
| `/calc/creep` | Creep C_C | indAtTime, initialInd, f | creep (v) | R 60-3, 2.1.5 |
| `/calc/dead-load-return` | Dead load output return DR | indMin2, indMin1, f | dr (v) | R 60-3, 2.1.5.4 |
| `/calc/barometric-effect` | Barometric pressure effect C_P | ind2, ind1, f | change_v (v) | R 60-3, 2.1.6 |
| `/calc/temperature-mdlo` | Temperature effect on MDLO | ind2, ind1, f, temp2, temp1 | change_per_5deg (v) | R 60-3, 2.1.4 |
| `/calc/humidity-chmin` | Humidity effect on MDLO (CH) | indDminAfter, indDminBefore, f | chmin (v) | R 60-3, 2.1.7 |
| `/calc/humidity-chmax` | Humidity effect on span (CH) | avgDmaxAfter, avgDminAfter, avgDmaxBefore, avgDminBefore, f | chmax (v) | R 60-3, 2.1.7 |
| `/calc/span-variation` | Span stability variation | span, f | span_vmin (v) | R 60-3, 2.1.8 |
| `/calc/max-allowable-span-variation` | Max allowable span variation | dMax, accuracyClass | maxVar (v) | R 60-1, 5.7.2.6 |
| `/calc/electronic-difference` | Electronic disturbance difference | indWith, indWithout, f | difference (v) | R 60-3, 2.1.9 |
| `/calc/significant-fault` | Significant fault determination | difference, vMin | significantFault (boolean) | R 60-1, 5.3 |
| `/calc/pass-fail-threshold` | Generic pass/fail by threshold | computedValue, limit | result (pass/fail) | — |
