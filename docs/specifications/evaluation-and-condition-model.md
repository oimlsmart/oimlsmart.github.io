
<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 05</span>
  <h1>Evaluation & Condition Model</h1>
  <p class="lede">Evaluation pipeline, condition tracking, and verdict aggregation.</p>
</div>


<DraftCallout />


## Purpose

This document defines Layers 4 and 5 of the entity chain: how form instances capture
measurements, how evaluations apply OCL conditions to produce pass/fail results, and
how results trace back through conformance tests to requirements.

## Evaluation Pipeline

The complete pipeline from form instance to requirement compliance:

```
1. LOAD       Load the Form schema (field definitions, derivation rules, evaluation rules)
     ↓
2. BIND       Bind computation context (dimensions, header values, table references)
     ↓
3. POPULATE   User fills direct/declared fields → measurements
     ↓
4. DERIVE     Topologically sort derived fields; evaluate OCL derivation expressions
     ↓
5. EVALUATE   Evaluate OCL rules on evaluated fields → pass/fail per field
     ↓
6. AGGREGATE  Evaluate pass_if expression → overall form result (PASS/FAIL)
     ↓
7. TRACE      Link form result → conformance test → requirements
```

## Layer 4: FormInstance (Runtime Entity)

A FormInstance is a filled form containing actual measurement values.

```yaml
form_instance:
  id: "fi-001"
  standard_id: "oiml-r60"
  form_id: "creep-dr"
  conformance_test_id: "/conf/metrological-tests/creep-dr"
  test_report_id: "tr-001"
  evaluator: "John Smith"
  created: "2026-06-09T10:30:00Z"
  modified: "2026-06-09T14:00:00Z"

  # Classification dimensions (from application)
  dimensions:
    accuracy_class: C
    technology: analogue-passive
    humidity_class: CH

  # Computation context (resolved from header form and dimensions)
  computation_context:
    D_max: 5000
    D_min: 0
    conversion_factor_f: 2.0
    accuracy_class: C
    p_LC: 0.7
    n_LC: 3000
    v_min: 0.833

  # Direct/declared measurements (operator input)
  measurements:
    creep_readings:
      - time_minutes: 0
        indication_counts: 10000
      - time_minutes: 2
        indication_counts: 10003
      - time_minutes: 5
        indication_counts: 10008
      - time_minutes: 10
        indication_counts: 10015
      - time_minutes: 20
        indication_counts: 10020
      - time_minutes: 30
        indication_counts: 10025
    initial_dmin_indication: 50
    final_dmin_indication: 51

  # Computed values (derived by OCL engine)
  computed_values:
    change_v:                    # Per-reading, computed in step 4
      - 0                        # t=0
      - 1.5                      # t=2
      - 4.0                      # t=5
      - 7.5                      # t=10
      - 10.0                     # t=20
      - 12.5                     # t=30
    max_creep_change_v: 12.5     # max of all change_v
    creep_30min: 12.5            # reading at t=30
    creep_20min: 10.0            # reading at t=20
    dr_value: 0.5                # (51 - 50) / 2.0
    mpe_at_dmax: 1.25            # lookup_mpe(5000, C, 0.7)

  # Evaluation results (computed in step 5)
  evaluations:
    creep_30min_result:
      result: fail               # abs(12.5) > 0.7 * abs(1.25) = 0.875
      rule: "abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)"
      computed_left: 12.5
      computed_right: 0.875
    creep_20_30_result:
      result: fail               # abs(12.5 - 10.0) = 2.5 > 0.15 * 1.25 = 0.1875
      rule: "abs(creep_30min - creep_20min) <= 0.15 * abs(mpe_at_dmax)"
      computed_left: 2.5
      computed_right: 0.1875
    dr_half_v_result:
      result: pass               # abs(0.5) <= 0.5
      rule: "abs(dr_value) <= 0.5"
      computed_left: 0.5
      computed_right: 0.5

  # Overall result (computed in step 6)
  overall_result: FAIL           # not all evaluations pass

  # Status
  status: PENDING                # DRAFT → PENDING → REVIEWED → FINAL
```

### FormInstance Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique instance identifier |
| `standard_id` | string | Standard identifier (e.g., "oiml-r60") |
| `form_id` | string | Form schema identifier (e.g., "creep-dr") |
| `conformance_test_id` | string | Conformance test being performed |
| `test_report_id` | string | Parent test report |
| `evaluator` | string | Person performing the test |
| `dimensions` | object | Classification dimensions from application |
| `computation_context` | object | Resolved shared parameters |
| `measurements` | object | Direct/declared field values (user input) |
| `computed_values` | object | Derived/computed field values (engine output) |
| `evaluations` | object | Per-field evaluation results |
| `overall_result` | enum | PASS, FAIL, NA, PENDING |
| `status` | enum | DRAFT, PENDING, REVIEWED, FINAL |

## Step 4: Derivation Engine

The derivation engine evaluates all `measurement_method: derived` and
`measurement_method: computed` fields in topological order.

### Dependency Resolution

1. Build a dependency graph: for each derived field, parse its `derivation` OCL
   expression to extract referenced field names.
2. Topologically sort using Kahn's algorithm.
3. Detect circular dependencies (error if found).
4. Evaluate in order, substituting previously computed values.

### Evaluation Context

Each derivation expression receives:

```typescript
interface EvaluationContext {
  // Field values resolved so far
  fields: Record<string, any>

  // Computation context parameters
  $context: Record<string, any>

  // Current DATALIST index (if in iteration)
  $index?: number

  // Previous element in DATALIST (if in iteration)
  $prev?: Record<string, any>

  // Root test report
  $root: TestReport

  // Current form
  $form: FormInstance

  // Self
  $self: FormInstance
}
```

### Derivation Example

For the creep-dr form, the derivation order is:

```
1. creep_readings[*].change_v    (depends on: indication_counts, $context.initial_dmax_indication, $context.conversion_factor_f)
2. max_creep_change_v            (depends on: creep_readings[*].change_v)
3. creep_30min                   (depends on: creep_readings)
4. creep_20min                   (depends on: creep_readings)
5. dr_value                      (depends on: final_dmin_indication, initial_dmin_indication, $context.conversion_factor_f)
6. mpe_at_dmax                   (depends on: $context.D_max, $context.accuracy_class)
```

## Step 5: Evaluation Engine

The evaluation engine applies OCL conditions to produce pass/fail per field.

### Evaluation Process

For each field with `measurement_method: evaluated`:

1. Parse the `evaluation.rule` OCL expression.
2. Resolve all referenced variables from computed_values and measurements.
3. Evaluate the expression.
4. If result is `true` → field value is `'pass'`.
5. If result is `false` → field value is `'fail'`.
6. Record the evaluation result with evidence:
   - `result`: pass or fail
   - `rule`: the OCL expression evaluated
   - `computed_left`: left-hand side value (for threshold comparisons)
   - `computed_right`: right-hand side value (threshold)

### Evaluation Result Structure

```typescript
interface FieldEvaluation {
  result: 'pass' | 'fail'
  rule: string              // OCL expression that was evaluated
  computed_left?: number    // Value of the tested variable
  computed_right?: number   // Threshold value compared against
  error?: string            // If evaluation failed (e.g., missing variable)
}
```

## Step 6: Aggregation

The `pass_fail.pass_if` expression determines the overall form result.

```yaml
pass_if: "ocl{creep_30min_result = 'pass' and creep_20_30_result = 'pass' and dr_half_v_result = 'pass'}"
```

- If `pass_if` evaluates to `true` → `overall_result = PASS`.
- If `pass_if` evaluates to `false` → `overall_result = FAIL`.
- If any evaluated field has an error → `overall_result = PENDING`.

### Derivation Rules (pass_fail.derivation)

Some forms compute intermediate summary values before the pass_if expression:

```yaml
pass_fail:
  derivation:
    - name: span_vmin
      for_each: measurements
      computation: "ocl{span / $context.conversion_factor_f}"
    - name: variation
      for_each: measurements
      computation: "ocl{abs(span_vmin - measurements[0].span_vmin)}"
    - name: max_allowable_variation
      computation: "ocl{max(0.5, lookup_mpe($context.D_max, $context.accuracy_class, 1.0) * 0.5)}"
    - name: within_limit
      for_each: measurements
      computation: "ocl{variation <= max_allowable_variation}"
  pass_if: "ocl{measurements->forAll(m | m.within_limit = 'yes')}"
```

`for_each: measurements` means the computation is applied to each element of the
`measurements` DATALIST, producing a derived field per element.

## Layer 5: EvaluationResult and Traceability

### EvaluationReport

The evaluation report aggregates all form instance results into a determination
per conformance test, and links each determination to the original requirements.

```yaml
evaluation_report:
  id: "er-001"
  standard_id: "oiml-r60"
  test_report_id: "tr-001"
  instrument_id: "inst-001"
  authority_id: "ia-001"

  form_determinations:
    - form_id: "creep-dr"
      form_instance_id: "fi-001"
      conformance_test_id: "/conf/metrological-tests/creep-dr"
      decision: FAIL
      notes: "Creep exceeds 0.7 × |MPE| at D_max"
      field_determinations:
        creep_30min_result:
          decision: FAIL
          notes: "12.5 v > 0.875 v (0.7 × MPE)"
        creep_20_30_result:
          decision: FAIL
          notes: "2.5 v > 0.1875 v (0.15 × MPE)"
        dr_half_v_result:
          decision: PASS
          notes: "0.5 v ≤ 0.5 v"
      requirement_traceability:
        - requirement_id: "/req/metrological/creep"
          evidence: "fi-001.creep_30min_result = fail"
          result: FAIL
        - requirement_id: "/req/metrological/creep-20-30"
          evidence: "fi-001.creep_20_30_result = fail"
          result: FAIL
        - requirement_id: "/req/metrological/dr"
          evidence: "fi-001.dr_half_v_result = pass"
          result: PASS

  overall_decision: REJECTED
  review_notes: "Creep test failed at two criteria. Recommend redesign."
  reviewer_name: "Dr. Schmidt"
  review_date: "2026-06-10"
```

### Traceability Chain

Every evaluation determination traces back through the full chain:

```
Requirement (Layer 1)
  ↑ targets (m:n)
ConformanceTest (Layer 2)
  ↑ result_forms (m:n)
Form (Layer 3)
  ↑ 1:1 schema
FormInstance (Layer 4)
  ↑ evaluations + field_determinations
EvaluationResult (Layer 5)
  ↑ requirement_traceability
Requirement (Layer 1)  ← circular closure: requirement linked to its evidence
```

### Requirement Compliance Matrix

From an EvaluationReport, the system can derive a compliance matrix:

```
Requirement                        | Test                    | Form         | Result
-----------------------------------|-------------------------|--------------|-------
/req/metrological/creep            | creep-dr                | creep-dr     | FAIL
/req/metrological/creep-20-30      | creep-dr                | creep-dr     | FAIL
/req/metrological/dr               | creep-dr                | creep-dr     | PASS
/req/metrological/mpe              | measurement-error-...   | load-cell-.. | PASS
/req/metrological/repeatability    | measurement-error-...   | repeatability| PASS
/req/metrological/span-stability   | span-stability          | span-stab.   | PASS
```

A requirement is COMPLIANT when ALL conformance tests that target it PASS.
A requirement is NON-COMPLIANT when ANY conformance test that targets it FAILS.
A requirement is INCONCLUSIVE when some tests are PENDING.

## Condition Types Summary

### At the Requirement Level (Layer 1)

Requirements declare **acceptance_criteria** that define what constitutes compliance:

| Type | Structure | Example |
|------|-----------|---------|
| Tiered | Multiple ranges with factor | MPE tiers per class |
| Threshold | Single comparison with operator | `|E_L| ≤ |MPE|` |
| Qualitative | Checklist items | Markings present, documentation complete |

### At the Conformance Test Level (Layer 2)

Tests declare **acceptance_criteria.items** with OCL `pass_if` expressions that
reference test variables:

```yaml
acceptance_criteria:
  items:
    - name: creep_30min_criterion
      target: /req/metrological/creep
      pass_if: "ocl{abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)}"
```

### At the Form Field Level (Layer 3)

Fields with `measurement_method: evaluated` declare **evaluation.rule** OCL
expressions that produce pass/fail:

```yaml
evaluation:
  rule: "ocl{abs(error_EL) <= abs(mpe)}"
  condition: "|E_L| ≤ |MPE|"
```

### At the Form Level (Layer 3)

Forms declare **pass_fail.pass_if** that aggregates evaluated fields:

```yaml
pass_fail:
  pass_if: "ocl{every evaluated field = 'pass'}"
```

### The Three Condition Levels Are Aligned

The condition at each level MUST be semantically equivalent:

```
Requirement.acceptance_criteria (semantic definition)
    ≡ ConformanceTest.acceptance_criteria.items[*].pass_if (test-level OCL)
    ≡ Form.field.evaluation.rule (field-level OCL)
    → FormInstance.evaluations (runtime pass/fail)
    → EvaluationReport.requirement_traceability (traceable evidence)
```

This alignment ensures that the OCL expression in the form is a faithful
implementation of the requirement's acceptance criteria, traced through the
conformance test's test variables.
