---
title: Generated TypeScript types
description: 'Type-safe interfaces that the runtime application uses to consume SMART Recommendation data. Generated from the YAML schemas by the build pipeline; mirror the source-of-truth at smart/browser/src/data/types/.'
eyebrow: 'Reference · TypeScript types'
---

<PageHero />


<DraftCallout />

## Top-level types

The type system is organized by domain. Each type corresponds to a YAML
schema and is consumed by the application's Vue components.

| Type | File | Purpose |
| --- | --- | --- |
| `Standard` | `standard.ts` | Standard identity, value model, terminology |
| `Dimension` | `standard.ts` | Classification axis |
| `Term` | `standard.ts` | Defined term with cross-reference |
| `RequirementClass` | `requirement.ts` | Grouping of related requirements |
| `Requirement` | `requirement.ts` | Normative provision |
| `AcceptanceCriterion` | `requirement.ts` | Tiered, threshold, or qualitative |
| `ConformanceTestClass` | `conformance.ts` | Grouping of related tests |
| `ConformanceTest` | `conformance.ts` | Test procedure |
| `Form` | `form.ts` | Test report form schema |
| `FormField` | `form.ts` | Field declaration |
| `FormInstance` | `form.ts` | Runtime measurements |
| `EvaluationResult` | `evaluation.ts` | Verdict with evidence |
| `Application` | `application.ts` | Manufacturer certification request |
| `Certificate` | `certificate.ts` | Issued OIML certificate |
| `OntologyEntity` | `ontology.ts` | OWL class, property, instance |

## Core shapes

### `Standard`

```ts
interface Standard {
  id: string
  shortName: string
  fullName: string
  year: number
  urn: string
  doctype: 'international-recommendation' | 'international-document'
  enums: Record<string, EnumDefinition>
  terminology: Term[]
  // ... value model
}
```

### `Requirement`

```ts
interface Requirement {
  identifier: string
  urn: string
  name: string
  obligation: 'shall' | 'should' | 'may' | 'will'
  statement: string
  dimensions: string[]
  acceptance_criteria: AcceptanceCriterion | AcceptanceCriterion[]
  applicability?: ApplicabilityFilter
  ref?: string
}
```

### `AcceptanceCriterion`

```ts
type AcceptanceCriterion =
  | TieredCriterion
  | ThresholdCriterion
  | QualitativeCriterion

interface TieredCriterion {
  type: 'tiered'
  variable: string
  tiers: Array<{
    range: { min: number; max: number }
    limit: Limit
  }>
}

interface ThresholdCriterion {
  type: 'threshold'
  limit: Limit | { calc: string; inputs: Record<string, any> }
}

interface QualitativeCriterion {
  type: 'qualitative'
  checklist: string[]
}
```

### `ConformanceTest`

```ts
interface ConformanceTest {
  identifier: string
  urn: string
  name: string
  targets: string[]   // requirement URNs
  variables: TestVariable[]
  procedure: TestStep[]
  result_forms: string[]  // form URNs
  environment?: EnvironmentSpec
  ref?: string
}
```

### `Form` & `FormField`

```ts
interface Form {
  identifier: string
  urn: string
  test: string
  fields: FormField[]
  pass_if: string  // OCL expression
}

type FormField =
  | DirectField
  | CalculatedField
  | MetadataField
  | VerdictField

interface CalculatedField {
  name: string
  kind: 'calculated'
  calculation?: string
  lookup?: { table: string; inputs: Record<string, string> }
  inputs?: Record<string, string>
}
```

### `EvaluationResult`

```ts
interface EvaluationResult {
  form_instance_urn: string
  form_urn: string
  criterion_urns: string[]
  field_results: FieldResult[]
  verdict: 'pass' | 'fail' | 'conditional'
  evidence: EvidenceChain
}

interface EvidenceChain {
  measurements: Record<string, number>
  computed: Record<string, number>
  limits: Record<string, number>
  requirement_refs: string[]
}
```

## Where the types live

The generated types are produced by the build pipeline:

```
data/<standard>/  ─────────►  browser/src/data/types/
   YAML source                TypeScript output
```

The build is incremental — only changed types are regenerated. Adding a field
to `requirements/metrological.yaml` updates the corresponding `Requirement`
interface and all consumers are notified at compile time.

## Accessing the types in application code

```ts
import type { Standard, Requirement, Form } from '@/data/types'

function loadStandard(id: string): Standard {
  // ... return the standard matching id
}
```

## Customization patterns

The types support several extension patterns:

- **Computed fields**: a `CalculatedField` can reference any other field or constant.
- **Multi-tier criteria**: a `Requirement` can carry an array of `AcceptanceCriterion` when multiple thresholds apply.
- **Cross-references**: `targets`, `result_forms`, `lookup`, `calculation` — all are URNs validated at build time.

## Where to read more

- [YAML Schema Reference](/docs/ref/yaml-schema.html) — the schemas these types are generated from.
- [Developer guide — Provision Data Model](/docs/guides/provision-data-model.html).
- [Formal spec — System Architecture](/docs/specifications/system-architecture.html).