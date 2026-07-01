
<PageHero
  eyebrow="Reference · YAML schemas"
  title="YAML schema reference"
  lede="Reference documentation for every YAML file type in a SMART Recommendation. Use this when authoring new Recommendations or building tooling that consumes SMART data."
/>


<DraftCallout />

## Where schemas live

The canonical YAML schemas are maintained in the smart application repository
under `data/`. They are the authoritative declarations of every entity type
in a SMART Recommendation.

For the typescript types generated from these schemas, see the [Type
Definitions](/docs/ref/type-definitions.html) page. For the formal
specification, see [YAML Schema Specification](/docs/specifications/yaml-schema-specification.html).

## Per-schema documentation

The schemas are part of the working pilot implementation. Each file describes a
different aspect of a SMART Recommendation:

| Schema file | Purpose |
| --- | --- |
| `standard.yaml` | Identity, value model, terminology |
| `dimensions.yaml` | Classification axes, parameterization |
| `rc.yaml` | Requirements class schema |
| `cc.yaml` | Conformance test class schema |
| `form.yaml` | Form schema, field declarations |
| `entities.yaml` | Runtime entity graph |
| `formulas.yaml` | AsciiMath formula library |
| `tables.yaml` | Table primitive definitions |
| `terminology.yaml` | Defined terms and cross-references |
| `enums.yaml` | Shared enumerations |
| `navigation.yaml` | App navigation entries |
| `calculation-context.yaml` | Calculation binding context |

## How schemas relate

```
standard.yaml
  ├── identity (id, urn, year)
  ├── enums (declared once, referenced everywhere)
  ├── terminology (terms referenced by URN)
  └── value-model (calculations + tables)

dimensions.yaml
  └── axes referenced by requirements, tests, forms

rc.yaml
  └── requirements (criterion types: tiered, threshold, qualitative)

cc.yaml
  └── tests (variables, steps, criteria, result_forms)

form.yaml
  ├── fields (direct, calculated, metadata, verdict)
  └── pass_if (OCL expression)

entities.yaml
  └── runtime graph (Application → Certificate chain)
```

The build pipeline validates that every cross-reference resolves. Add a new
requirement and the build tells you whether its `targets`, `applicability_filter`,
`lookup`, `calculation`, and `term:` references are valid.

## Working example — R 60

The pilot implementation of R 60 lives at `data/oiml-r60/` in the smart
application repository. Key fields in the R 60 standard:

```yaml
id: oiml-r60
shortName: "R 60"
fullName: "Metrological regulation for load cells"
year: 2021
urn: "urn:oiml:recommendation:r60:2021"

enums:
  accuracy_class:
    type: string
    values: [A, B, C, D]
  output_type:
    type: string
    values: [analog, digital]
```

The full R 60 `standard.yaml` includes the value model (calculations, tables,
terminology) and is the entry point for the entire Recommendation.

## Where to read more

- [Developer guide — Identity & Dimensions](/docs/guides/identity-dimensions.html)
- [Developer guide — Provision Data Model](/docs/guides/provision-data-model.html)
- [Formal spec — YAML Schema Specification](/docs/specifications/yaml-schema-specification.html)
- [Adding a Standard](/docs/workflow/adding-a-standard.html)