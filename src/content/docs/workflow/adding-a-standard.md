# Adding a Standard

Adding a new OIML Recommendation to the SMART platform is a data-only task. No engine code changes.

## Step-by-step

1. **Scaffold the directory.** Create `data/<recommendation-slug>/` (e.g. `data/oiml-r76/`).

2. **Author the value model.** Write `standard.yaml` — Calculations, Tables, and Terminology entries referenced by requirements and forms. This is where shared domain constants live.

3. **Declare dimensions.** Write `dimensions.yaml` — the classification axes for this Recommendation (e.g. accuracy class, maximum load). These dimensions parameterize requirements and forms.

4. **Author requirements.** Write one `rc.yaml` (requirements class) and one or more per-topic requirement files (e.g. `metrological-requirements.yaml`, `construction-requirements.yaml`).

5. **Author conformance tests.** Write `cc.yaml` and one or more per-test files. Each test declares its variables, procedure, and result forms.

6. **Author forms.** One YAML file per form. Forms reference Calculations and Tables from the value model.

7. **Validate.** Run the build pipeline — it validates every YAML file against the JSON Schemas in `data/schemas/`, and validates every cross-reference (every identifier must resolve to a declared entity).

8. **Generate TypeScript.** The build pipeline emits typed modules into `browser/src/data/generated/`. The application picks them up automatically on next reload.

## Common pitfalls

- **Missing dimension values.** If a Requirement specializes on accuracy class but you forget to include class C, the validation pipeline flags it.
- **Circular calculation dependencies.** The build pipeline detects cycles in the calculation graph and refuses to generate.
- **Unresolved references.** Every `lookup`, `targets`, `result_form`, etc. must point to an entity that exists. The build pipeline catches dangling references.

## Reference

- [YAML Schema](/docs/ref/yaml-schema) — formal schemas for each file type.
- [Type Definitions](/docs/ref/type-definitions) — TypeScript types generated from the schemas.
