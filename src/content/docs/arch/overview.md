# Architecture Overview

The OIML SMART platform is built around a six-layer entity model. Each layer has well-defined entity types, a clear purpose, and a specific stage in the lifecycle of a SMART Recommendation.

## The six layers

| Layer | Entity Types | Purpose | R 60 Example |
| --- | --- | --- | --- |
| 1. Requirements | `RequirementClass`, `Requirement` | Normative provisions with obligation (shall/should/may) | "Errors shall not exceed MPE" |
| 2. Conformance Tests | `ConformanceTestClass`, `ConformanceTest` | Test procedures with variables, steps, criteria | Measurement error & repeatability test |
| 3. Forms | `Form`, `Field` | Structured data capture with measurement kinds | Load cell error recording form |
| 4. Form Instances | `FormInstance` | Runtime measurements stored in IndexedDB | A specific TL's filled-in form |
| 5. Evaluation Results | `EvaluationResult`, `FormDetermination` | Pass/fail with evidence chain | "PASS: E = 0.3d ≤ MPE = 0.5d" |
| 6. Certification | `Application` → `Certificate` | End-to-end workflow orchestration | Certificate `DE1-2024-R60-001` |

## Entity Relationships

The layers are connected through explicit references. Tests target requirements many-to-many, forms link to tests, and runtime instances reference both their schema and their workflow context.

```
Standard ──→ RequirementClass ──→ Requirement
Standard ──→ ConformanceTestClass ──→ ConformanceTest
Standard ──→ Form ──→ Field

ConformanceTest ←──m:n──→ Requirement  (targets)
ConformanceTest ←──m:n──→ Form         (result_forms)

FormInstance → Form, → ConformanceTest, → TestReport
EvaluationResult → FormInstance → Requirement (traceability)

Application → InstrumentModelFamily → ClassificationGroup
                                              → InstrumentModel → InstrumentSample
TestRequest → Application, → InstrumentSample
TestReport → TestRequest, → FormInstance[]
EvaluationReport → TestReport, → FormDetermination[]
Certificate → InstrumentModelFamily
```

## Data Flow

Layers 1–3 are **build-time** YAML artifacts — they define the structure and rules. Layers 4–6 are **runtime** entities that live in IndexedDB in the browser. The evaluation pipeline processes runtime data against build-time declarations.

```
Evaluation Pipeline:

  1. LOAD      — Retrieve form schema and ConformanceTest definition
  2. BIND      — Resolve computation context from entity graph
  3. POPULATE  — Fill direct/measured fields with user data
  4. DERIVE    — Evaluate derived/computed fields (topological order)
  5. EVALUATE  — Apply OCL evaluation rules → pass/fail per field
  6. AGGREGATE — Evaluate form-level pass_if → overall result
  7. TRACE     — Link results back to Requirements (evidence chain)
```

## File Organization

```
data/
  oiml-r60/                       ← one directory per standard
    standard.yaml                 ← value model (tables, calculations)
    dimensions.yaml               ← classification dimensions, parameters
    requirements/
      rc.yaml                     ← requirements class schema
      met-requirements.yaml       ← individual requirements
    conformance/
      cc.yaml                     ← conformance class schema
      measurement-error-mdlo.yaml ← individual tests
    forms/
      measurement-error-mdlo.yaml ← form schemas
  oiml-r144/                      ← another standard
    ...

data/schemas/                     ← JSON Schemas for validation
browser/src/data/generated/       ← TypeScript generated from YAML
```

The build pipeline reads all YAML, validates schemas and cross-references, and generates TypeScript modules that the application imports at runtime.

## What's modelled in Primmel

The information model that defines these layers is authored in [Primmel](https://www.primmel.org/), Ribose's successor to MMEL. Primmel provides:

- **Data model declarations** for entities, attributes, and relationships.
- **Process model declarations** for state machines and transitions.
- **Compliance rule declarations** for typed expressions and OCL constraints.

The Primmel model is the canonical source; the YAML files above are its concrete serialization for a specific Recommendation.

Continue with the [design principles](/docs/arch/design-principles.html) that shape every decision in the model.
