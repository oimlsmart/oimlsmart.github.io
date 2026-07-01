<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 01</span>
  <h1>System Architecture</h1>
  <p class="lede">The top-level architecture of the SMART platform — entities, layers, and the build pipeline.</p>
</div>


<DraftCallout />


## Purpose

This document defines the complete architecture of the evolved MMEL/SMART system — a
declarative specification language for metrological standards, declared in YAML, where
every domain concept is explicitly defined as an entity with typed attributes, every
computation is expressed in a formal OCL expression language, and every evaluation
produces a traceable pass/fail result linked back to normative requirements.

## Design Principles

1. **CODE HAS NO DATA.** All domain knowledge lives in YAML. Code is pure engine.
2. **Declarative.** Everything is declared, never programmed. Adding a new standard
   means adding YAML files, not changing code (OCP).
3. **Closed under reference.** Every identifier used in an expression resolves to a
   declared entity. No undefined variables, no dangling references. Symbols are the
   canonical variable declarations — every variable name resolves to a Symbol.
4. **MECE.** Every concept has exactly one canonical definition point. No overlap, no
   gaps between entity responsibilities.
5. **Traceability.** Every evaluation result traces back through a chain:
   `Requirement → ConformanceTest → Form → FormInstance → Evaluation`.
   Extended through the workflow: `Certificate → EvaluationReport → TestReport → FormInstance`.
6. **MMEL-compatible.** YAML structures map 1:1 to MMEL constructs for future
   round-trip migration.

---

## SMART MMEL Primitive Catalog

Every concept in the SMART specification language is modelled as one of the following
primitives. Each primitive has a single canonical definition point in the YAML data
files. The catalog is exhaustive — if it's not listed here, it's not a SMART primitive.

### Specification Primitives (declared in YAML)

| # | Primitive | Layer | YAML Location | Defining REQ | Purpose |
|---|-----------|-------|---------------|--------------|---------|
| 1 | **Standard** | — | `standard.yaml` | 01 | Recommendation identity, enums, value models, workflow config |
| 2 | **Symbol** | 0 | `symbols.yaml` | 11 | Domain variable: typed quantity with source, formula, dependencies |
| 3 | **Formula** | 0 | `symbols.yaml` (on Symbol) | 11 | Computation rule: display + evaluable expression + input bindings |
| 4 | **Calculation** | 0 | `standard.yaml` → `evaluation.calculations` | 07 | Named, typed, reusable computation primitive |
| 5 | **Table** | 0 | `standard.yaml` → `tables` | 09 | Structured lookup data (columns + rows) |
| 6 | **ValueModel** | 0 | `standard.yaml` → `value_model` | 01 | Dimension-parameterized profile (per-class breakpoints, ranges) |
| 7 | **EnumDef** | 0 | `standard.yaml` → `enums` | 01 | Classification enumeration with per-value metadata |
| 8 | **TerminologyEntry** | 0 | `terminology.yaml` | 01 | Term definition with source, alt forms, scope |
| 9 | **RequirementClass** | 1 | `requirements/*.yaml` | 02 | Named scope grouping related requirements |
| 10 | **Requirement** | 1 | `requirements/*.yaml` | 02 | Normative provision with obligation, parameters, acceptance criteria |
| 11 | **Parameter** | 1 | on Requirement | 02 | Typed variable on a requirement with range and default |
| 12 | **AcceptanceCriteria** | 1 | on Requirement | 02 | Pass/fail condition: tiered, threshold, or qualitative |
| 13 | **ConformanceTestClass** | 2 | `conformance/*.yaml` | 02 | Named scope grouping related conformance tests |
| 14 | **ConformanceTest** | 2 | `conformance/*.yaml` | 02 | Test procedure with variables, steps, criteria, result forms |
| 15 | **TestVariable** | 2 | on ConformanceTest | 02 | Typed variable declared in a test (declared/measured/derived/computed/lookup) |
| 16 | **TestStep** | 2 | on ConformanceTest | 02 | Ordered action with declared input/output variables |
| 17 | **TestCriterion** | 2 | on ConformanceTest | 02 | Acceptance criterion with OCL pass_if targeting a requirement |
| 18 | **Form** | 3 | `forms/*.yaml` | 03 | Structured data capture template linked to conformance tests |
| 19 | **FormField** | 3 | on Form | 03 | Individual field: typed, measured, derived, or evaluated |
| 20 | **Measurement** | 3 | on FormField | 03 | Discriminated union: NUMERIC, DATALIST, DERIVED, TRUE/FALSE, etc. |
| 21 | **ComputationContext** | 3 | on Form | 03 | Shared parameter scope (header form, dimensions, tables) |
| 22 | **PassFailDef** | 3 | on Form | 03 | Overall form pass/fail with OCL pass_if and derivation rules |
| 23 | **Reference** | 3 | on any entity | 01 | Normative URN link to specification clause |
| 24 | **Expression** | — | on any computed field | 04, 08 | OCL or AsciiMath expression: the computation language |
| 25 | **Uncertainty** | 3 | on FormField | 03 | GUM-compatible measurement uncertainty budget (Type A/B/combined) |
| 26 | **Applicability** | — | on Requirement/Test | 02 | Classification dimension filter (accuracy_class, technology, etc.) |
| 27 | **StateMachine** | — | `standard.yaml` → `evaluation.state_machines` | 10 | Entity lifecycle: states, transitions, guards |

### Runtime Primitives (entity instances in IndexedDB)

| # | Primitive | Defining REQ | Purpose |
|---|-----------|--------------|---------|
| 28 | **InstrumentModelFamily** | 10 | Top-level entity: Family → Group → Model → Sample |
| 29 | **Application** | 10 | Type evaluation application submitted by manufacturer |
| 30 | **TestReport** | 10 | Collection of form instances for a sample |
| 31 | **FormInstance** | 05 | Filled form: measurements, computed values, evaluations |
| 32 | **EvaluationResult** | 05 | Per-field pass/fail with evidence (result, rule, computed values) |
| 33 | **EvaluationReport** | 05 | Aggregated determination per conformance test → requirement |
| 34 | **Certificate** | 10 | OIML certificate of conformity with classifications |

### Primitive Relationships (the data flow)

```
Specification time:
  Symbol ──formula──→ Expression
    │                    ↑
    │ formula.inputs     │ expression references
    ↓                    │
  Symbol (dependency DAG) │
    │                    │
    └──calculation──→ Calculation ──expression──→ Expression
                         │   ↑
    ┌────────────────────┘   │
    │ calculation_bindings   │ calculation
    ↓                        │
  FormField ──derivation──→ Expression
    │
    │ evaluation.rule
    ↓
  EvaluationResult (runtime: pass/fail)

Runtime:
  Form ──1:n──→ FormInstance
                    ├── measurements (direct/declared fields)
                    ├── computed_values (derived/computed fields via Expression)
                    ├── evaluations (evaluated fields → pass/fail)
                    └── overall_result (from PassFailDef.pass_if)

  FormInstance ──→ EvaluationResult ──→ EvaluationReport ──→ Certificate
```

---

## The Seven-Layer Entity Chain

```
Layer 0: SYMBOLS (domain variable ontology)
  Symbol
    ├── notation, type, unit, description
    ├── source (declared|measured|derived|lookup)
    ├── formula → Formula (computation rule)
    │     ├── display (human-readable, from standard)
    │     ├── expression (machine-evaluable, AsciiMath/OCL)
    │     └── inputs → Symbol (m:n, dependency DAG)
    └── calculation → Calculation (optional, implements formula)

Layer 1: REQUIREMENTS
  RequirementClass ─┬─ Requirement
                    │   ├── obligation (shall/should/may)
                    │   ├── parameters (typed variables with ranges)
                    │   ├── acceptance_criteria (OCL conditions)
                    │   └── applicability (classification dimensions)
                    │
Layer 2: CONFORMANCE TESTS        ← m:n link to Layer 1
  ConformanceTestClass ─┬─ ConformanceTest
                        │   ├── targets → Requirement (m:n)
                        │   ├── test_steps (ordered actions)
                        │   ├── test_variables (declared I/O)
                        │   ├── acceptance_criteria (OCL conditions)
                        │   ├── result_forms → Form (m:n)
                        │   └── applicability (classification dimensions)
                        │
Layer 3: FORMS                   ← m:n link to Layer 2
  Form
    ├── fields (structured data capture)
    │     ├── measurement_kind (NUMERIC|DATALIST|DERIVED|TRUE/FALSE|...)
    │     ├── measurement_method (direct|derived|computed|lookup|evaluated|declared)
    │     ├── derivation (OCL expression)
    │     ├── evaluation (OCL rule + condition)
    │     └── uncertainty (Type A/B/combined budget)
    ├── computation_context (shared parameters: f, p_LC, n_LC, ...)
    ├── pass_fail (pass_if expression, derivation rules)
    └── references (URN links to specification clauses)
    │
Layer 4: FORM INSTANCES          ← 1:1 link to Layer 3 schema
  FormInstance (runtime)
    ├── form → Form (schema)
    ├── conformance_test → ConformanceTest
    ├── measurements (field name → observed/computed value)
    ├── evaluations (field name → {result, evidence})
    └── overall_result (PASS|FAIL|NA|PENDING)
    │
Layer 5: EVALUATION RESULTS      ← aggregates Layer 4
  EvaluationResult (runtime)
    ├── form_instance → FormInstance
    ├── conformance_test → ConformanceTest
    ├── requirement → Requirement
    ├── result (PASS|FAIL|INCONCLUSIVE)
    └── evidence_chain (traceable path to measurements)
    │
Layer 6: CERTIFICATION WORKFLOW  ← orchestrates Layers 1–5 (SMART_REQS 10)
  InstrumentModelFamily → ClassificationGroup → InstrumentModel
  InstrumentSample → Application → TestRequest → TestReport
  EvaluationReport → Certificate
  State machines govern entity lifecycles.
  Dimension schemas configure standard-specific parameters.
```

## Entity Relationship Summary

```
Standard
  │
  ├── Symbol (1:n, domain variable ontology)
  │     ├── type, unit, description, notation
  │     ├── source (declared|measured|derived|lookup)
  │     ├── formula_inputs → Symbol (m:n, dependency DAG)
  │     └── calculation → ComputationDef (0..1)
  │
  ├── RequirementClass (1:n)
  │     └── Requirement (1:n)
  │           ├── parameters (1:n Parameter)
  │           ├── acceptance_criteria (1:1 AcceptanceCriteria)
  │           └── verification (1:1 Verification)
  │
  ├── ConformanceTestClass (1:n)
  │     └── ConformanceTest (1:n)
  │           ├── targets ──→ Requirement (m:n)
  │           ├── test_steps (1:n TestStep)
  │           ├── test_variables (1:n TestVariable)
  │           ├── acceptance_criteria (1:n TestCriterion)
  │           └── result_forms ──→ Form (m:n)
  │
  ├── Form (1:n)
  │     ├── fields (1:n FormField)
  │     ├── computation_context (1:1 ComputationContext)
  │     ├── pass_fail (1:1 PassFailDef)
  │     └── references (1:n Reference)
  │
  ├── ComputationDef (1:n, registered)
  ├── ValueModel (1:n, lookup tables)
  ├── EnumDef (1:n)
  └── TerminologyEntry (1:n)

Runtime:
  Application ─┬─→ Standard
               └─→ InstrumentModelFamily (with groups → models → samples)

  TestRequest (IA → TL commissioning)
    ├── application → Application
    ├── sampleIds → InstrumentSample[]
    └── testReportId → TestReport

  TestReport
    ├── application → Application
    ├── testRequest → TestRequest
    ├── sample → InstrumentSample
    ├── sharedContext { declared, equipment, computed }
    ├── required_forms → Form (1:n)
    └── form_instances → FormInstance (1:n)
          ├── form → Form
          ├── measurements {field → value}
          └── evaluations {field → EvalResult}

  EvaluationReport
    ├── testReportIds → TestReport[] (1:n)
    ├── summary → EvaluationSummaryEntry[]
    ├── synopsis → { fulfilsAllRequirements }
    ├── form_determinations (1:n FormDetermination)
    │     ├── form_instance → FormInstance
    │     ├── conformance_test → ConformanceTest
    │     ├── requirement → Requirement
    │     └── result (PASS|FAIL|CONDITIONAL)
    └── overall_decision (APPROVED|REJECTED|CONDITIONALLY_APPROVED)

  Certificate
    ├── instrumentModelFamily → InstrumentModelFamily
    ├── classifications → CertificateClassification[] (derived from groups)
    ├── evaluation_report → EvaluationReport
    └── revisions → CertificateRevision[]

  See SMART_REQS 10 for the full workflow model.
```

## MMEL Construct Mapping

| SMART Entity | MMEL Construct | Status |
|---|---|---|
| Symbol | domain variable declaration | SMART-specific (Layer 0) |
| RequirementClass | `requirements_class` | Aligned |
| Requirement | `requirement` + `provision` | Aligned |
| ConformanceTestClass | `conformance_class` | Aligned |
| ConformanceTest | `conformance_test` with `test_step`, `test_variable` | Extended |
| Form | `form_schema` | Aligned |
| FormField | `measurement` discriminated union | Aligned |
| ComputationDef | `computation` in standard definition | Aligned |
| ValueModel | `value_model` profile | Aligned |
| AcceptanceCriteria | `acceptance_criteria` (tiered/threshold/qualitative) | Aligned |
| OCL Expression | Custom OCL subset | SMART-specific |
| FormInstance | Runtime entity (IndexedDB) | SMART-specific |
| EvaluationResult | Runtime entity (IndexedDB) | SMART-specific |

## File Organization

```
data/{standard}/
  standard.yaml              ← enums, value_models, dimensions, computations, workflow
  symbols.yaml               ← symbol registry: typed variable declarations with dependency DAG
  dimensions.yaml            ← group/model parameter schemas, computed params, shared context
  requirements/
    {domain}.yaml            ← requirement classes and requirements
  conformance/
    {domain}.yaml            ← conformance classes and tests (with steps, variables, criteria)
  forms/
    {form-name}.yaml         ← form schemas (fields, measurements, pass_fail)
  terminology.yaml           ← term definitions
  cross-refs.yaml            ← computed cross-references

data/schemas/
  standard-meta.yaml         ← JSON Schema for standard.yaml
  rc.yaml                    ← JSON Schema for requirements
  cc.yaml                    ← JSON Schema for conformance tests
  form.yaml                  ← JSON Schema for forms
  entities.yaml              ← JSON Schema for runtime entities
```

## Cross-Cutting Concerns

- **Applicability**: Entities may declare which classification dimensions they apply to
  (accuracy_class, technology, humidity_class). Omitted dimensions = all values.
- **Specialization**: A requirement with `applicability` is a specialization of a
  template requirement. The template has no applicability; the specialized form pins
  dimension values to derive parameter-specific rules.
- **References**: All normative references use OIML URN format
  (`urn:oiml:pub:r:60-1:2021#clause-5.3.2`).
- **Obligation**: ISO/IEC Directives Part 2, Annex H modality keywords
  (shall/should/may and their negatives).
