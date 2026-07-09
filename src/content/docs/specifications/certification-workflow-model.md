---
title: Certification Workflow Model
description: 'Workflow entities, state machines, and the certification pipeline.'
eyebrow: 'Formal Specification · SMART_REQS 10'
---





## Purpose

This document defines the certification workflow layer — the runtime entity model that
governs how OIML type evaluations proceed from manufacturer application through testing
to certificate issuance. It sits above the form engine (Layers 1–5 from SMART_REQS 01)
and orchestrates how form instances are created, populated, and consolidated.

The workflow is **fully general**: the same entity types and state machines apply to any
OIML recommendation (R 60, R 76, R 129, R 144, …). Standard-specific parameters are
declared in `dimensions.yaml` per standard, not hardcoded in the workflow engine.

## Design Principles

1. **InstrumentModelFamily is the top-level entity.** Replaces the flat
   `MeasuringInstrument` with a rich hierarchy:
   `Family → ClassificationGroup → InstrumentModel → InstrumentSample`.

2. **Standard-specific dimensions are configured, not coded.**
   `dimensions.yaml` per standard declares group classification fields, model parameters,
   computed parameters, shared context mappings, and certificate classification fields.
   Adding a new standard = adding dimension schema + form schemas. Core engine is
   unchanged. (OCP — same as SMART_REQS 01 principle 2.)

3. **State machines govern all entity lifecycles.** Every status transition is explicit,
   guarded, and auditable. Invalid transitions are rejected.

4. **Form fields bind to context.** No data duplication. Bound fields resolve from the
   entity graph (Application, ModelFamily, Sample, TestReport) at render time.

5. **TestRequest is the commissioning link.** The IA → TL assignment step: which
   samples, which test procedures, which TL.

6. **EvaluationReport consolidates.** References multiple TestReports from different TLs,
   adds the IA's own examinations, produces overall determination.

7. **Certificate derives from the model.** Classification data is auto-generated from
   the InstrumentModelFamily's groups using the dimension schema's
   `certificate_classification` declarations.

## The Workflow Layer in Context

```
Layers 1–5 (SMART_REQS 01):  Requirements → Tests → Forms → Instances → Results
                                               │
                                               ▼
Layer 6: CERTIFICATION WORKFLOW (this document)
  ┌──────────────────────────────────────────────────────────────────┐
  │                                                                  │
  │  Manufacturer ──→ InstrumentModelFamily                         │
  │                      │  (typeDesignation, construction, tech)   │
  │                      │                                           │
  │                      ├── ClassificationGroup[]                  │
  │                      │     (accuracy_class, nLC, Y, Z, …)      │
  │                      │     └── InstrumentModel[]                │
  │                      │           (Emax, Emin, humidity, …)      │
  │                      │                                           │
  │                      └── Application                            │
  │                            │                                     │
  │                            ├── InstrumentSample[]                │
  │                            │     (serialNumber, selectionType)   │
  │                            │                                     │
  │                            ├── TestRequest[] ──→ TL              │
  │                            │     └── TestReport                  │
  │                            │           ├── sharedContext         │
  │                            │           └── FormInstance[] ← L3-5│
  │                            │                                     │
  │                            ├── EvaluationReport (IA)             │
  │                            │     ├── testReportIds[]             │
  │                            │     ├── summary[]                   │
  │                            │     └── synopsis                    │
  │                            │                                     │
  │                            └── Certificate                      │
  │                                  ├── classifications[]           │
  │                                  └── revisions[]                 │
  │                                                                  │
  └──────────────────────────────────────────────────────────────────┘
```

## Entity Definitions

### InstrumentModelFamily

A manufacturer's product family. Contains one or more ClassificationGroups differing
by metrological classification parameters.

```yaml
# Here is the runtime entity stored in IndexedDB:

instrumentModelFamily:
  id: string
  manufacturerId: string          # FK → Manufacturer
  standardId: string              # e.g., "oiml-r60"
  typeDesignation: string         # e.g., "RTN", "DISOMAT B"
  description?: string
  construction?: string           # e.g., "bending beam"
  technology?: string             # e.g., "strain gauge", "ultrasonic"
  material?: string
  sealing?: string
  characteristics?: Record<string, unknown>  # catch-all for unmodeled attributes
  groups: ClassificationGroup[]
  created: string
  modified: string
```

### ClassificationGroup

A sub-family sharing the same metrological classification. All models within a group
share classification parameters but differ in rated values.

```yaml
classificationGroup:
  id: string
  label: string                   # e.g., "C3", "C3MI7.5", "Class 0.5"
  classification: Record<string, unknown>
    # R 60: { accuracy_class: "C", nLC: 3000, Y: 10000, Z: 3000, pLC: 0.7 }
    # R 144: { accuracy_class: 2, Q3: 25, R: 160, DN: 50 }
  models: InstrumentModel[]
```

### InstrumentModel

A specific model within a group. Has standard-specific parameters and computed
derived parameters.

```yaml
instrumentModel:
  id: string
  designation: string             # e.g., "RTN-C3-4.7t"
  parameters: Record<string, unknown>
    # R 60: { Emax: 4700, Emin: 0, humidity_class: "SH" }
    # R 144: { DN: 50, Q3: 25, Q1: 0.313 }
  computedParameters?: Record<string, { expression: string; value: unknown }>
    # R 60: { vmin: { expression: "(Emax-Emin)/Y", value: 0.47 },
    #          DR:   { expression: "(Emax-Emin)/(2*Z)", value: 0.783 } }
```

### InstrumentSample

A physical unit provided by the applicant. Linked to a specific model.

```yaml
instrumentSample:
  id: string
  familyId: string                # FK → InstrumentModelFamily
  modelId: string                 # FK → InstrumentModel.id (within family.groups)
  serialNumber: string
  selectionType?: 'full' | 'partial' | 'humidity' | 'digital' | 'reference'
  selectionJustification?: string
  additionalTests?: string[]
  created: string
  modified: string
```

### Application

Manufacturer/applicant declaration. Links to an InstrumentModelFamily and declares
samples.

```yaml
application:
  id: string
  standardId: string
  applicationNumber: string
  dateOfApplication: string
  status: ApplicationStatus       # state machine

  applicant: { company, address, contactPerson?, email?, phone? }
  authorisedRepresentative?: { name, address }
  noConcurrentApplication?: boolean

  instrumentModelFamilyId: string  # FK → InstrumentModelFamily
  declaredSamples: Array<{ modelId: string; serialNumbers: string[] }>

  manufacturerId: string
  dimensions: Record<string, unknown>
  documentation: ApplicationDocument[]
  scheme?: 'A' | 'B'
  issuingAuthorityId?: string

  created: string
  modified: string
```

### TestRequest

IA commissions a TL to perform specific tests on specific samples.

```yaml
testRequest:
  id: string
  standardId: string
  applicationId: string
  requestingAuthorityId: string   # FK → Organization (IA)
  assignedLaboratoryId: string    # FK → Organization (TL)
  sampleIds: string[]             # FK → InstrumentSample[]
  testProcedures: string[]        # e.g., ["2.10.1", "2.10.2"]
  testScope: 'full' | 'partial' | 'humidity' | 'digital'
  testReportId?: string           # FK → TestReport (set when completed)
  status: TestRequestStatus       # state machine
  created: string
  modified: string
```

### TestReport

TL's results. Contains shared context and form instances.

```yaml
testReport:
  id: string
  standardId: string
  applicationId: string
  testRequestId: string           # FK → TestRequest
  sampleId: string                # FK → InstrumentSample
  laboratoryId: string

  sharedContext: TestReportSharedContext
  dimensions: Record<string, unknown>
  requiredForms: string[]
  formInstances: string[]         # FK → FormInstance[]
  forms?: TestReportFormRef[]

  status: TestReportStatus        # state machine
  evaluator: string
  created: string
  modified: string
```

### TestReportSharedContext

Generic bags whose keys are defined per standard in `dimensions.yaml`.

```yaml
testReportSharedContext:
  declared: Record<string, unknown>
    # Populated from family/group/model on report creation.
    # R 60 keys: applicationNumber, typeDesignation, accuracy_class, nLC, Emax, ...
    # R 144 keys: applicationNumber, typeDesignation, accuracy_class, DN, Q3, ...

  equipment?: Record<string, unknown>
    # Entered once by TL, shared across forms.
    # R 60 keys: forceGeneratingSystem, indicatingInstrument

  computed: Record<string, unknown>
    # Derived from test data progressively.
    # R 60 keys: conversionFactorF, dmin, dmax, testTemperatures
```

### EvaluationReport

IA's consolidation of all TL TestReports plus own examinations.

```yaml
evaluationReport:
  id: string
  standardId: string
  applicationId: string
  testReportIds: string[]
  authorityId: string
  reportNumber: string

  synopsis: { fulfilsAllRequirements: boolean; remarks?: string }
  summary: EvaluationSummaryEntry[]
  examinationFormInstances: string[]   # IA's own Section 5 examination forms
  reportFormInstances: string[]        # Section 4 administrative forms

  formDeterminations: FormDetermination[]
  overallDecision: ApprovalDecision
  status: EvaluationReportStatus       # state machine
  created: string
  modified: string
```

### Certificate

Derived from the InstrumentModelFamily and evaluation results.

```yaml
certificate:
  id: string
  standardId: string
  certificateNumber: string
  instrumentModelFamilyId: string      # FK → InstrumentModelFamily

  classifications: CertificateClassification[]
    # Auto-derived from family.groups via dimension schema
    # Each group → one certificate column

  result: CertificateResult
  status: CertificateStatus            # state machine
  revisions: CertificateRevision[]
  # ... (full structure in types.ts)
```

## State Machines

Every workflow entity has a defined lifecycle. Transitions are guarded and audited.

### Application

```
SUBMITTED → UNDER_REVIEW → ACCEPTED
         ↘ WITHDRAWN      ↘ REJECTED → SUBMITTED (resubmit)
```

| From | To | Guard | Actor |
|---|---|---|---|
| — | SUBMITTED | Required fields filled | Applicant |
| SUBMITTED | UNDER_REVIEW | — | IA |
| SUBMITTED | WITHDRAWN | — | Applicant |
| UNDER_REVIEW | ACCEPTED | instrumentModelFamilyId set, documentation complete | IA |
| UNDER_REVIEW | REJECTED | — | IA |
| REJECTED | SUBMITTED | — | Applicant |

### TestRequest

```
DRAFT → SUBMITTED → ACCEPTED → IN_PROGRESS → COMPLETED
                   ↘ REJECTED
  DRAFT/SUBMITTED/ACCEPTED ↘ CANCELLED
```

| From | To | Guard | Actor |
|---|---|---|---|
| — | DRAFT | — | IA |
| DRAFT | SUBMITTED | TL assigned, samples selected, procedures selected | IA |
| SUBMITTED | ACCEPTED | — | TL |
| SUBMITTED | REJECTED | — | TL |
| ACCEPTED | IN_PROGRESS | Draft TestReport created | TL |
| IN_PROGRESS | COMPLETED | testReportId set | TL |

### TestReport

```
DRAFT → SUBMITTED → UNDER_REVIEW → ACCEPTED
                                   ↘ REJECTED
```

### EvaluationReport

```
DRAFT → UNDER_REVIEW → ACCEPTED
                      ↘ DRAFT (revision)
```

### Certificate

```
PENDING_REGISTRATION → ACTIVE → EXPIRED | WITHDRAWN | UNDER_INVESTIGATION
                                                        ↘ SUSPENDED → ACTIVE | WITHDRAWN
```

## Dimension Schema (OCP Configuration)

Each standard declares its parameter schemas in `data/{standard}/dimensions.yaml`.
This is the key mechanism that makes the workflow general.

### Schema Structure

```yaml
standard: oiml-r60
version: 1

# Group classification — defines ClassificationGroup.classification keys
group_classification:
  fields:
    - name: accuracy_class
      type: enum
      values: [A, B, C, D]
      required: true
      label: Accuracy class
    - name: nLC
      type: integer
      required: true
      label: Max number of load cell intervals
    # ...

# Model parameters — defines InstrumentModel.parameters keys
model_parameters:
  fields:
    - name: Emax
      type: number
      unit: "kg or t"
      required: true
    # ...

# Computed parameters — derived from group + model
computed_parameters:
  - name: vmin
    expression: "(Emax - Emin) / Y"
    params: [Emax, Emin, Y]
  # ...

# Shared context declared — populates TestReportSharedContext.declared
shared_context_declared:
  - source: application
    path: applicationNumber
  - source: group.classification
    path: accuracy_class
  - source: model.parameters
    path: Emax
  # ...

# Shared context computed — populates TestReportSharedContext.computed
shared_context_computed:
  - name: conversionFactorF
    source_form: "r60-3/table-6.3"
    derivation: "declared_by_evaluator"
    consumed_by: ["r60-3/table-6.5", "r60-3/table-6.6", ...]

# Certificate classification — maps groups to certificate table columns
certificate_classification:
  - name: accuracy_class
    source: group.classification
  - name: Emax_range
    source: derived
    derivation: "join(models[*].parameters.Emax, ' / ')"
  # ...
```

### How the Dimension Schema Drives the System

| Consumer | What it reads from `dimensions.yaml` |
|---|---|
| **Group editor UI** | `group_classification.fields` → renders form fields |
| **Model editor UI** | `model_parameters.fields` → renders form fields |
| **Computed params** | `computed_parameters` → computes and stores derived values |
| **Shared context population** | `shared_context_declared` → maps entity graph → declared bag |
| **Shared context propagation** | `shared_context_computed` → form save → computed bag |
| **Certificate generation** | `certificate_classification` → maps groups → classification data |
| **Sample selection** | `sample_selection` → algorithm ID + config |

### Adding a New Standard

```
1. Create data/{standard}/dimensions.yaml    — declare parameters
2. Create data/{standard}/forms/*.yaml        — declare form schemas
3. Done. No TypeScript changes needed.
```

## Form Data Binding

Form fields bind to the entity graph instead of storing duplicate values.

### Field Categories

| Category | Source | Stored in FormInstance? | Editable? |
|---|---|---|---|
| Bound | Resolved from entity graph | No | No (read-only) |
| Shared computed | TestReport.sharedContext.computed | No | Read-only for consumers |
| User-entered | Entered by TL/IA | Yes | Yes |

### Binding Declaration

```yaml
# In a form field definition:
- name: application_no
  type: string
  binding:
    source: application
    path: applicationNumber
  readonly: true

- name: emax
  type: number
  binding:
    source: model
    path: parameters.Emax
  readonly: true

- name: conversion_factor_f
  type: number
  binding:
    source: testReport
    path: sharedContext.computed.conversionFactorF
```

### Binding Sources

| Source | What it resolves from |
|---|---|
| `application` | Application entity |
| `modelFamily` | InstrumentModelFamily entity |
| `group` | ClassificationGroup (resolved from sample → model → group) |
| `model` | InstrumentModel (resolved from sample → model) |
| `sample` | InstrumentSample entity |
| `testRequest` | TestRequest entity |
| `testReport` | TestReport entity (including sharedContext paths) |
| `siblingForm` | Another FormInstance in the same TestReport |

### FormContext Assembly

The FormContext is assembled by walking the entity graph:

```
FormInstance.testReportId → TestReport
  → TestReport.testRequestId → TestRequest → Application
    → Application.instrumentModelFamilyId → InstrumentModelFamily
  → TestReport.sampleId → InstrumentSample
    → resolveModelPath(family, sample.modelId) → group + model
  → Manufacturer lookup via family.manufacturerId
  → sibling FormInstances via TestReport.formInstances
```

## Sample Selection

Standard-specific algorithms select which physical units are tested and how.

### Registry Pattern

```typescript
type SampleSelectionFn = (
  family: InstrumentModelFamily,
  declared: Array<{ modelId: string; serialNumbers: string[] }>
) => InstrumentSample[]

const sampleSelectionRegistry = new Map<string, SampleSelectionFn>()
```

Each standard registers its algorithm. R 60 implements Annex D (severity-based
selection with capacity range rules). Other standards register their own.

### Selection Types

| Type | Meaning |
|---|---|
| `full` | Full evaluation test required |
| `partial` | Only specific additional tests |
| `humidity` | Humidity test sample |
| `digital` | Additional digital/electronic tests |
| `reference` | Reference sample (e.g., for span stability) |

## Entity-Form Integration Points

```
Workflow Entity          Form Integration
──────────────          ────────────────
Application             Application form (applicant info, documentation checklist)
InstrumentModelFamily   Family editor (groups, models, computed parameters)
InstrumentSample        Sample editor (serial numbers, selection justification)
TestRequest             Request form (TL assignment, test procedures, instructions)
TestReport              Form instance container + shared context
EvaluationReport        Section 4 admin forms + Section 5 examination forms
Certificate             Cover page + classification table (derived)
```

## Traceability

The full traceability chain from SMART_REQS 01 extends through the workflow:

```
Certificate
  └→ EvaluationReport
       └→ TestReport[]
            └→ FormInstance[]
                 └→ Form (schema)
                      └→ ConformanceTest
                           └→ Requirement
```

Every pass/fail determination in a Certificate traces through the evaluation to
specific test results in specific forms, which trace to conformance tests and
normative requirements.

## IndexedDB Stores

```
instrumentModelFamilies   { key: id, indexes: [manufacturerId, standardId] }
instrumentSamples         { key: id, indexes: [familyId, modelId, serialNumber] }
testRequests              { key: id, indexes: [applicationId, assignedLaboratoryId,
                                               requestingAuthorityId, status,
                                               testReportId, standardId] }
testReports               { key: id, indexes: [applicationId, laboratoryId, status,
                                               standardId, testRequestId, sampleId] }
evaluationReports         { key: id, indexes: [applicationId, authorityId, standardId] }
applications              { key: id, indexes: [manufacturerId, status, standardId,
                                               instrumentModelFamilyId] }
certificates              { key: id, indexes: [standardId] }
```

## Relationship to Other SMART_REQS

| SMART_REQS | Relationship |
|---|---|
| 01 (Architecture) | Workflow is Layer 6 above the five-layer entity chain |
| 02 (Requirements) | Workflow traces certificate → evaluation → test → requirement |
| 03 (Forms) | Workflow binds form fields to entity context |
| 05 (Evaluation) | EvaluationReport consolidates form evaluation results |
| 06 (YAML Schema) | `dimensions.yaml` is a new YAML schema type for workflow config |
| 07 (Calculation) | Computed parameters use the calculation primitive |
| 09 (Table) | MPE lookup tables consumed via dimension schema references |
