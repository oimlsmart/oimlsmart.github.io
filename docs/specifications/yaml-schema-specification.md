<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 06</span>
  <h1>YAML Schema Specification</h1>
  <p class="lede">Formal YAML schemas for all entity types in the SMART platform.</p>
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

This document specifies the evolved YAML schemas for all entity types, incorporating
the new `variables`, `steps`, and `acceptance_criteria` on conformance tests, the
`ocl{}` enclosed expression syntax, and the form instance runtime model.

## Schema Evolution Summary

| Schema File | Current Gaps | Evolution |
|---|---|---|
| `symbols.yaml` | Not defined | New: Symbol entity with dependency DAG, source typing, calculation linking |
| `cc.yaml` | No `variables`, `steps`, or formal `acceptance_criteria` | Add TestVariable, TestStep, TestCriterion |
| `form.yaml` | Expressions are untyped strings | Add `ocl{}` syntax, measurement_method enforcement |
| `entities.yaml` | FormInstance lacks evaluations, computed_values | Add evaluation fields, computation_context |
| `rc.yaml` | acceptance_criteria limit_expression is prose | Align with OCL expressions |

## Conformance Test Schema (cc.yaml) — Evolved

### New Definitions

```yaml
# In cc.yaml $defs

testVariable:
  type: object
  required: [name, type, source]
  additionalProperties: false
  properties:
    name:
      type: string
      description: "Unique variable name within the test"
    type:
      type: string
      enum: [number, integer, string, boolean, enum, collection]
    unit:
      type: string
    source:
      type: string
      enum: [declared, measured, derived, computed, lookup]
      description: |
        declared: stated by manufacturer/evaluator (not measured)
        measured: directly observed by operator
        derived: computed from other variables via OCL
        computed: evaluated by registered computation function
        lookup: retrieved from value model table
    derivation:
      type: string
      description: "OCL expression (ocl{...}). Required when source is derived or computed."
    description:
      type: string
    item_type:
      type: object
      description: "For collection type: defines the fields of each element"
      properties:
        name:
          type: string
        fields:
          type: array
          items:
            $ref: "#/$defs/testVariable"
    enum_values:
      type: array
      items:
        type: string

testStep:
  type: object
  required: [order, action]
  additionalProperties: false
  properties:
    order:
      type: integer
      description: "Execution order (1-based)"
    action:
      type: string
      description: "Human-readable action description"
    input_variables:
      type: array
      items:
        type: string
      description: "Names of variables consumed by this step"
    output_variables:
      type: array
      items:
        type: string
      description: "Names of variables produced by this step"
    note:
      type: string

testCriterion:
  type: object
  required: [name, target, pass_if]
  additionalProperties: false
  properties:
    name:
      type: string
      description: "Unique criterion name"
    target:
      type: string
      description: "Requirement identifier this criterion traces to"
    pass_if:
      type: string
      description: "OCL boolean expression (ocl{...})"
    description:
      type: string
```

### Evolved `test` Definition

```yaml
test:
  type: object
  additionalProperties: false
  required:
    - name
    - targets
    - purpose
    - method
    - type
  oneOf:
    - required: [identifier]
    - required: [identifier_fragment]
  properties:
    name: { type: string }
    identifier: { type: string }
    identifier_fragment: { type: string }
    targets:
      type: array
      items: { type: string }
    purpose: { type: string }
    method: { type: string }
    type:
      type: string
      enum: [Testing, Inspection]
    reference: { type: string }
    applicability:
      $ref: "#/$defs/applicability"
    guidance:
      oneOf:
        - type: array
          items: { type: string }
        - type: string
        - type: "null"
    dependencies:
      oneOf:
        - type: array
          items: { type: string }
        - type: "null"

    # ── NEW: Test Variables ──
    variables:
      type: array
      items:
        $ref: "#/$defs/testVariable"
      description: "All variables used in this test. Every variable referenced in steps and acceptance_criteria must be declared here."

    # ── NEW: Test Steps ──
    steps:
      type: array
      items:
        $ref: "#/$defs/testStep"
      description: "Ordered sequence of test actions with declared input/output variables."

    # ── EVOLVED: Acceptance Criteria ──
    acceptance_criteria:
      type: object
      required: [type, pass_if]
      properties:
        type:
          type: string
          enum: [composite, threshold, tiered, qualitative]
        pass_if:
          type: string
          description: "OCL boolean expression for overall test pass/fail (ocl{...})"
        description:
          type: string
        items:
          type: array
          items:
            $ref: "#/$defs/testCriterion"

    # ── NEW: Result Forms (m:n) ──
    result_forms:
      type: array
      items:
        type: string
      description: "Form identifiers that implement this test's data capture"
```

## Form Schema (form.yaml) — Evolved

### New Field Properties

```yaml
# In form.yaml definitions.field

measurement_kind:
  type: string
  enum: [NUMERIC, DATALIST, DERIVED, "TRUE/FALSE", DURATION, TEXT,
         TABLE_REFERENCE, TABLE_OPTIONS]
  description: "MMEL measurement kind discriminated union tag"

measurement_method:
  type: string
  enum: [direct, derived, computed, lookup, evaluated, declared]
  description: "How this field's value is obtained"

derivation:
  type: string
  description: "OCL expression (ocl{...}) for derived/computed fields"

evaluation:
  type: object
  description: "Evaluation rule for evaluated fields"
  required: [rule]
  properties:
    rule:
      type: string
      description: "OCL boolean expression (ocl{...})"
    condition:
      type: string
      description: "Human-readable condition statement"
    specification_reference:
      type: string
```

### Validation Rules (beyond JSON Schema)

The following rules are enforced by the schema validator (a custom validator, not
pure JSON Schema):

1. If `measurement_method` is `derived` or `computed`, then `derivation` is required.
2. If `measurement_method` is `evaluated`, then `evaluation.rule` is required.
3. If `measurement_kind` is `DERIVED`, then `derivation` is required.
4. If `measurement_kind` is `TRUE/FALSE`, then `evaluation.rule` is required.
5. Every identifier in a `derivation` or `evaluation.rule` OCL expression must
   resolve to a declared field, context variable, or built-in function.
6. `pass_fail.pass_if` must reference only evaluated fields.

## Runtime Entity Schema (entities.yaml) — Evolved

### Evolved FormInstance

```yaml
formInstance:
  type: object
  required:
    - id
    - standardId
    - formId
    - conformanceTestId
    - testReportId
    - dimensions
    - measurements
    - evaluator
    - created
    - modified
  additionalProperties: false
  properties:
    id: { type: string }
    standardId: { type: string }
    formId: { type: string }
    conformanceTestId: { type: string }
    testReportId: { type: string }
    evaluator: { type: string }

    dimensions:
      type: object
      description: "Classification dimensions from the application"
      additionalProperties: true

    computation_context:
      type: object
      description: "Resolved shared parameters from header form and dimensions"
      additionalProperties: true

    measurements:
      type: object
      description: "Direct/declared field values provided by the operator"
      additionalProperties: true

    computed_values:
      type: object
      description: "Derived/computed field values generated by the OCL engine"
      additionalProperties: true

    evaluations:
      type: object
      description: "Per-field evaluation results with evidence"
      additionalProperties:
        type: object
        required: [result, rule]
        properties:
          result:
            type: string
            enum: [pass, fail]
          rule:
            type: string
          computed_left:
            type: number
          computed_right:
            type: number
          error:
            type: string

    overall_result:
      type: string
      enum: [PASS, FAIL, NA, PENDING]

    status:
      type: string
      enum: [DRAFT, PENDING, REVIEWED, FINAL]

    created: { type: string, format: date-time }
    modified: { type: string, format: date-time }
```

### Evolved FormDetermination

```yaml
formDetermination:
  type: object
  required: [formId, formInstanceId, conformanceTestId, decision, requirementTraceability]
  additionalProperties: false
  properties:
    formId: { type: string }
    formInstanceId: { type: string }
    conformanceTestId: { type: string }
    decision:
      type: string
      enum: [PASS, FAIL, CONDITIONAL, NOT_REVIEWED]
    notes: { type: string }
    reviewedDate: { type: string }
    fieldDeterminations:
      type: object
      additionalProperties:
        $ref: "#/$defs/fieldDetermination"
    requirementTraceability:
      type: array
      items:
        type: object
        required: [requirementId, result]
        properties:
          requirementId: { type: string }
          evidence: { type: string }
          result:
            type: string
            enum: [PASS, FAIL, INCONCLUSIVE]
```

## Cross-Reference Generation

Cross-references are computed from declarations (not manually maintained):

```
# From Symbol.formula_inputs → generates:
#   symbol dependency DAG (evaluation ordering)
#   symbol → [input_symbol1, input_symbol2, ...]

# From ConformanceTest.targets → generates:
#   requirement → [test1, test2, ...]

# From ConformanceTest.result_forms → generates:
#   form → [test1, test2, ...]

# From Form.requirements → generates:
#   requirement → [form1, form2, ...]

# From FormField.targets → generates:
#   requirement → [form.field1, form.field2, ...]
```

## Symbol Schema (symbols.yaml)

### Symbol Definition

```yaml
# In symbols.yaml $defs

symbol:
  type: object
  required: [id, notation, label, description, reference, type, source]
  additionalProperties: false
  properties:
    id:
      type: string
      description: "Unique symbol identifier (kebab-case). Used as reference key."
    notation:
      type: string
      description: "Mathematical notation as it appears in the standard"
    label:
      type: string
      description: "Short human-readable name"
    description:
      type: string
      description: "Description from the standard's symbol table"
    reference:
      type: string
      description: "Normative URN to the clause defining this symbol"
    type:
      type: string
      enum: [number, integer, string, boolean]
    unit:
      type: string
      description: "Measurement unit (SI or domain-specific)"
    source:
      type: string
      enum: [declared, measured, derived, lookup]
      description: |
        declared: stated by manufacturer/evaluator
        measured: directly observed by test operator
        derived: computed from other symbols via formula
        lookup: retrieved from value model table
    formula_display:
      type: string
      description: "DEPRECATED: use formula.display instead."
    formula_inputs:
      type: array
      items:
        type: string
      description: "DEPRECATED: use formula.inputs instead."
    formula:
      type: object
      description: "Computation rule for derived symbols."
      required: [display, expression, inputs]
      properties:
        display:
          type: string
          description: "Human-readable formula from the standard's Annex (for reports/rendering)"
        expression:
          type: string
          description: "Machine-evaluable AsciiMath expression (for computation)"
        inputs:
          type: array
          items:
            type: string
          description: "IDs of other Symbols this formula depends on. Creates the dependency DAG."
    calculation:
      type: string
      description: "Name of the Calculation in evaluation.calculations that computes this symbol."
    notes:
      type: array
      items:
        type: string
      description: "Annex notes applicable to this symbol's formula"
```

### Schema Validation Rules

The following rules are enforced beyond JSON Schema:

1. If `source` is `derived`, then `formula_display` is required.
2. If `source` is `derived`, then `formula_inputs` must be non-empty.
3. Every ID in `formula_inputs` MUST resolve to a declared Symbol ID.
4. The `formula_inputs` graph MUST be a DAG (no circular dependencies).
5. If `calculation` is set, the named calculation MUST exist in `evaluation.calculations`.
6. Symbol IDs MUST be unique within the standard.

## Schema Validation Pipeline

```
1. Parse YAML against JSON Schema (structural validation)
     ↓
2. Resolve symbol registry (symbols.yaml)
     ↓
3. Validate symbol dependency DAG (acyclic, all inputs resolve)
     ↓
4. Resolve all identifier references (cross-file, including symbol references)
     ↓
5. Validate OCL expressions (parse + identifier resolution against symbols)
     ↓
6. Check closed-reference rule (every variable used is a declared Symbol)
     ↓
7. Check variable-step alignment (step I/O vars are in test variables)
     ↓
8. Check form-test alignment (form fields align with test variables)
     ↓
9. Check symbol-field alignment (form field symbol refs resolve to declared symbols)
     ↓
10. Generate TypeScript types from validated schemas
```

## Migration from Current Schema

The evolved schema is backward-compatible with the current YAML data. The new fields
(`variables`, `steps`, `result_forms`, formal `acceptance_criteria`) are optional in
the schema but required for full SMART compliance. A validation level flag controls
strictness:

- `strict`: All new fields required, all OCL expressions validated.
- `transitional`: New fields optional, OCL validation optional.
- `legacy`: Current behavior, no new fields required.
