<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 11</span>
  <h1>Variable & Symbol Model</h1>
  <p class="lede">Variables, symbols, scope, and binding semantics.</p>
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

This document defines the **Symbol** as a first-class primitive entity in the SMART
specification system. A Symbol declares a typed, named variable in the standard's
mathematical model — the domain vocabulary of quantities that flow through the entire
computation pipeline. Symbols sit at the Recommendation level alongside Requirements,
Conformance Tests, Forms, and Calculations.

Every variable referenced in a form field, test variable, calculation input/output,
computation context, or value model lookup is a Symbol. The Symbol registry is the
single source of truth for variable identity, type, unit, description, and normative
provenance.

## Design Rationale

Without a Symbol primitive, variables are declared ad-hoc in multiple places:

- `D_max` appears as a form field in load-cell-info, creep-dr, load-cell-errors, etc.
- `f` (conversion factor) appears as a computation context parameter AND a form field.
- `E_L` appears as a calculation output, a form field name, and a test variable.
- Units and descriptions are re-stated each time, risking inconsistency.

This violates MECE and DRY. A Symbol provides:

1. **Single definition point** — one canonical declaration per variable.
2. **Type consistency** — type and unit defined once, referenced everywhere.
3. **Formula on the symbol** — the normative formula from the standard is part of the
   symbol, not scattered across calculations and form fields.
4. **Dependency ordering** — `formula.inputs` creates a symbol-to-symbol DAG that
   determines evaluation order. The engine evaluates `f` before `E_L` because
   `E_L.formula.inputs` includes `f`.
5. **Normative traceability** — each symbol links to the clause that defines it.
6. **Closed under reference** — every variable name in a form field, calculation
   input, or test expression resolves to a declared Symbol.

## Relationship to Other Primitives

```
Symbol (Layer 0: domain variable ontology)
  │
  ├── formula.display ──→ what the standard says (for reports/rendering)
  ├── formula.expression ──→ how to compute it (for the engine)
  ├── formula.inputs ──→ [Symbol] (dependency DAG for evaluation ordering)
  └── calculation ──→ Calculation (reusable implementation with typed I/O)

Calculation (computation primitive, SMART_REQS 07)
  ├── implements Symbol.formula
  ├── expression (typed, machine-evaluable)
  ├── inputs[] (typed parameters)
  └── output (typed result)

Form (Layer 3)
  ├── fields[].derivation ──→ inline OCL expression (or references calculation)
  ├── fields[].calculation ──→ Calculation name
  └── fields[].calculation_bindings ──→ maps form field names → calculation inputs

The chain:
  Symbol.formula.expression  ← normative formula
       ↓ implemented by
  Calculation.expression     ← machine-evaluable with typed I/O
       ↓ referenced by
  FormField.calculation      ← with bindings mapping field names to inputs
       ↓ produces at runtime
  FormInstance.computed_values[ fieldName ] ← actual computed number
```

## Entity Definition

### Symbol

```yaml
symbols:
  - id: EL
    notation: "E_L"
    label: Load cell error
    description: "load cell error, expressed in terms of v"
    reference: "urn:oiml:pub:r:60-3:2021#clause-2.1.2"
    type: number
    unit: v
    source: derived
    formula:
      display: "E_L = (average test indication − reference indication) / f"
      expression: "(avg_test_indication - reference_indication) / f"
      inputs: [f]
    calculation: loadCellError
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique symbol identifier (kebab-case). Used as reference key. |
| `notation` | string | yes | Mathematical notation as it appears in the standard (e.g., `E_L`, `C_C(t)`) |
| `label` | string | yes | Short human-readable name |
| `description` | string | yes | Description from the standard's symbol table |
| `reference` | string | yes | Normative URN to the clause defining this symbol |
| `type` | string | yes | `number`, `integer`, `string`, `boolean` |
| `unit` | string | no | Measurement unit (SI or domain-specific) |
| `source` | enum | yes | How this variable enters the computation pipeline |
| `formula` | object | conditional | Computation rule. Required when `source` is `derived`. |
| `calculation` | string | no | Name of the Calculation in `evaluation.calculations` that computes this symbol. |
| `notes` | string[] | no | Annex notes applicable to this symbol's formula |

### Formula Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `display` | string | yes | Human-readable formula from the standard's Annex (for rendering in reports) |
| `expression` | string | yes | Machine-evaluable AsciiMath expression (for computation) |
| `inputs` | string[] | yes | IDs of other Symbols this formula depends on. Creates the dependency DAG. |

The `formula.expression` uses generic domain variable names (e.g., `avg_test_indication`,
`reference_indication`, `f`). When a Form field references this symbol's calculation,
the field provides `calculation_bindings` that map its own field names to the
calculation's typed input parameters.

### Source Types

| Source | Meaning | Required Fields | Example |
|--------|---------|-----------------|---------|
| `declared` | Stated by manufacturer or evaluator | — | D_max, E_max, n_LC, p_LC |
| `measured` | Directly observed by test operator | — | t, T_1, T_2 |
| `derived` | Computed from other symbols via formula | `formula` | E_L, C_C, C_DR, f |
| `lookup` | Retrieved from value model table | `calculation` | MPE |

## Dependency DAG

`formula.inputs` creates a directed acyclic graph among derived symbols. The engine
evaluates symbols in topological order: parameters first, then derived symbols whose
inputs are all resolved.

### R 60 Dependency Graph

```
Declared parameters (no dependencies):
  Dmax, Dmin, Emax, Emin, n, nLC, pLC, v, vmin

Level 1 — depends only on parameters:
  f       → [Dmax, Dmin, n]
  Y       → [Emax, Emin, vmin]

Level 2 — depends on Level 1 + parameters:
  CC      → [f]
  CC-30-20 → [f]
  CDR     → [f]
  CHmax   → [f]
  CHmin   → [f]
  CM      → [f]
  CM-vmin → [f, vmin]
  CP      → [f]
  CP-vmin → [f, vmin]
  EL      → [f]
  ER      → [f]
  Ri      → [Dmax, Dmin, n, f]

Level 3 — depends on Level 2:
  DR      → [Emax, Emin, CDR, nLC]

Level 4 — depends on Level 3:
  Z       → [Emax, Emin, DR]

Lookup (no dependency ordering needed):
  MPE     → [calculation: mpe]

Measured (no dependency ordering needed):
  t0, t, T1, T2
```

### Validation Rules

1. **Acyclic.** The `formula.inputs` graph MUST be a DAG. Circular dependencies are
   a schema validation error.
2. **All inputs resolve.** Every ID in `formula.inputs` MUST be a declared Symbol.
3. **Calculation exists.** If `calculation` is set, the named calculation MUST exist
   in `evaluation.calculations`.
4. **Derived has formula.** If `source` is `derived`, `formula` MUST be present with
   `display`, `expression`, and `inputs`.

## How Formulae Are Used in Forms

### The Three Ways a Form Field Uses a Formula

**1. Calculation reference (recommended for shared formulae)**

The form field references a named Calculation and provides bindings:

```yaml
# In forms/load-cell-errors.yaml
- name: error_EL
  label: "Error (E_L)"
  symbol: EL                          # ← links to symbol registry
  type: number
  unit: v
  measurement_method: derived
  calculation: loadCellError          # ← references evaluation.calculations[].name
  calculation_bindings:               # ← maps form field names → calculation inputs
    avgIndication: indication         # form field 'indication' → calc input 'avgIndication'
    referenceIndication: reference_indication
    conversionFactor: conversion_factor_f
```

The engine evaluates:
1. Resolves `calculation: loadCellError` → finds `evaluation.calculations.loadCellError`
2. Evaluates its expression `(avgIndication - referenceIndication) / conversionFactor`
3. Substitutes from `calculation_bindings`:
   `avgIndication = <value of form field 'indication'>`
4. Stores result in `FormInstance.computed_values['error_EL']`

**2. Inline derivation (for one-off, form-specific formulae)**

The form field contains the formula directly:

```yaml
- name: error_EL
  label: "Error (E_L)"
  symbol: EL
  type: number
  unit: v
  measurement_method: derived
  derivation: "ocl{(indication - reference_indication) / conversion_factor_f}"
```

Semantically equivalent to the calculation reference, but the formula is inline.
Appropriate when the formula is not reused across forms.

**3. Lookup (for value model table lookups)**

The form field references a lookup calculation:

```yaml
- name: mpe
  label: MPE
  symbol: MPE
  type: number
  unit: v
  measurement_method: lookup
  derivation: "ocl{lookup_mpe(test_load, accuracy_class, plc)}"
```

### Evaluation Pipeline (Form-Level)

When a FormInstance is populated, the engine processes fields in this order:

```
1. RESOLVE context
   - Load computation_context fields from header form + dimensions
   - Build $context scope: { conversion_factor_f, accuracy_class, p_LC, ... }

2. COLLECT direct/declared fields
   - User-entered values: indication, reference_indication, D_max, D_min, ...

3. TOPOLOGICAL SORT derived fields
   - Build dependency graph from calculation_bindings and derivation references
   - Order: f → error_EL → mpe → within_mpe (bottom-up)

4. EVALUATE derived/computed fields
   - For each derived field (in topological order):
     a. If has calculation: resolve bindings → evaluate calculation expression
     b. If has derivation: evaluate OCL expression
     c. If has lookup: call lookup function
   - Store results in computed_values

5. EVALUATE evaluated fields (pass/fail)
   - For each field with measurement_method: evaluated
   - Evaluate evaluation.rule OCL expression → 'pass' or 'fail'
   - Store in evaluations with evidence (rule, computed_left, computed_right)

6. AGGREGATE overall result
   - Evaluate pass_fail.pass_if OCL expression
   - Set overall_result: PASS, FAIL, NA, or PENDING
```

### Complete Example: load-cell-errors Form

```
Symbol registry (symbols.yaml):
  EL ──formula──→ expression: "(avg_test_indication - reference_indication) / f"
       │              inputs: [f]
       └──calculation──→ loadCellError

Calculation (standard.yaml → evaluation.calculations):
  loadCellError:
    inputs: [avgIndication, referenceIndication, conversionFactor]
    output: error_EL (v)
    expression: "(avgIndication - referenceIndication) / conversionFactor"

Form field (forms/load-cell-errors.yaml):
  name: error_EL
  symbol: EL                    # ← traceable to symbol
  calculation: loadCellError    # ← traceable to calculation
  calculation_bindings:
    avgIndication: indication   # ← bound to this form's field
    referenceIndication: reference_indication
    conversionFactor: conversion_factor_f

At runtime (FormInstance):
  computed_values:
    error_EL: 12.5              # = (10050 - 10000) / 4.0

  evaluations:
    within_mpe:
      result: pass              # abs(12.5) <= abs(13.0)
      rule: "ocl{abs(error_EL) <= abs(mpe)}"
      computed_left: 12.5
      computed_right: 13.0
```

## YAML Schema Location

Symbols are declared in the standard definition:

```yaml
# In data/{standard}/symbols.yaml
---
symbols:
  - id: EL
    notation: "E_L"
    ...
```

Referenced from `standard.yaml`:

```yaml
structure:
  symbols:
    path: symbols.yaml
    label: Symbols and Formulae
    description: Annex symbol registry and formula definitions
```

## Referencing Symbols from Forms

Form fields may declare a `symbol` reference to link the field to its canonical variable:

```yaml
- name: error_EL
  label: "Load cell error (v)"
  symbol: EL              # ← references symbols.yaml
  type: number
  unit: v
  measurement_method: derived
  derivation: "ocl{(indication - reference_indication) / conversion_factor_f}"
```

When `symbol` is set:
- The field inherits `type`, `unit`, and `description` from the symbol if not overridden.
- The engine validates that the field's computation is consistent with the symbol's
  `calculation` reference.
- The field's `derivation` expression may only reference other fields whose `symbol`
  is in this symbol's `formula.inputs`.

## Complete R 60 Symbol Catalog

### Derived Quantities (16)

| ID | Notation | Formula (display) | Inputs | Calculation |
|----|----------|--------------------|--------|-------------|
| CC | C_C(t) | (ind − initial ind) / f | f | creep |
| CC-30-20 | C_C(30–20) | (ind₃₀ − ind₂₀) / f | f | — |
| CDR | C_DR | (ind₂ − ind₁) / f | f | deadLoadOutputReturn |
| CHmax | C_Hmax | [(indDmax−indDmin)after − before] / f | f | humidityCHmax |
| CHmin | C_Hmin | [(indDmin)after − before] / f | f | humidityCHmin |
| CM | C_M | (avgT₂ − avgT₁) / f | f | temperatureMDLO |
| CM-vmin | C_M(v_min) | (avgT₂ − avgT₁) / f, per degC | f, vmin | — |
| CP | C_P | (indP₂ − indP₁) / f | f | barometricPressureEffect |
| CP-vmin | C_P(v_min) | (indP₂ − indP₁) / f, per kPa | f, vmin | — |
| DR | DR | (Emax − Emin) × CDR / nLC | Emax, Emin, CDR, nLC | deadLoadReturnMass |
| EL | E_L | (avg test ind − ref ind) / f | f | loadCellError |
| ER | E_R | (max ind − min ind) / f | f | repeatabilityError |
| f | f | (avg ind 75% − ind Dmin) / (0.75 × n) | Dmax, Dmin, n | conversionFactor |
| Ri | R_i | [(load − Dmin) / (Dmax − Dmin)] × n × f | Dmax, Dmin, n, f | referenceIndication |
| Y | Y | (Emax − Emin) / vmin | Emax, Emin, vmin | — |
| Z | Z | (Emax − Emin) / (2 × DR) | Emax, Emin, DR | — |

### Parameters (9)

| ID | Notation | Type | Unit | Reference |
|----|----------|------|------|-----------|
| Dmax | D_max | number | g, kg, or t | R 60-1, 3.5.6 |
| Dmin | D_min | number | g, kg, or t | R 60-1, 3.5.12 |
| Emax | E_max | number | g, kg, or t | R 60-1, 3.5.5 |
| Emin | E_min | number | g, kg, or t | R 60-1, 3.5.9 |
| n | n | integer | — | R 60-1, 3.5.13 |
| nLC | n_LC | integer | — | R 60-1, 3.5.8 |
| pLC | p_LC | number | dimensionless | R 60-1, 3.7.2 |
| v | v | number | — | R 60-1, 3.5.4 |
| vmin | v_min | number | g, kg, or t | R 60-1, 3.5.11 |

### Lookup (1)

| ID | Notation | Calculation | Reference |
|----|----------|-------------|-----------|
| MPE | MPE | mpe | R 60-1, 3.7.10 |

### Measured (4)

| ID | Notation | Type | Unit | Reference |
|----|----------|------|------|-----------|
| t0 | t_0 | number | min | R 60-3, 2.1.5 |
| t | t | number | min | R 60-3, 2.1.5 |
| T1 | T_1 | number | °C | R 60-3, 2.1.4.2 |
| T2 | T_2 | number | °C | R 60-3, 2.1.4.2 |

## Relationship to Existing System

| Current | Evolved | Status |
|---------|---------|--------|
| Inline field type/unit on every form field | `symbol: EL` on form field, type/unit from registry | Evolved |
| Formula repeated in form field derivation | `symbol: EL` + `calculation: loadCellError` + bindings | Evolved |
| No dependency ordering between computed variables | `formula.inputs` DAG drives topological evaluation | New |
| No normative mapping for field names | `reference` on symbol traces field → specification clause | New |
| MPE breakpoint data duplicated in value_model and formulas | Symbol `MPE` with `source: lookup` + `calculation: mpe` | Aligned |
