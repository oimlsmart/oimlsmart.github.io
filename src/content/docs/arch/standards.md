# Supported Standards

The OIML SMART platform is designed so that adding a new International Recommendation is a data-only task — no engine code changes. Each Recommendation lives in its own directory under `data/` and follows the same structure.

## Currently modelled

- **[OIML R 60](https://www.oiml.org/en/files/pdf_r/r060-e21.pdf)** — *Metrological regulation for load cells* (2021). The pilot SMART Recommendation; the most complete model to date.
- **OIML R 129** — *Dynamic measuring instruments for the determination of mass road vehicles*.
- **OIML R 144** — *Gas meters*.

## In progress

Additional Recommendations are queued for modelling. The priority order is set by the OIML SMART programme committee based on member-state demand and OIML-CS coverage.

## Adding a new standard

The process for adding a new Recommendation is described in [Adding a Standard](/docs/workflow/adding-a-standard). In short:

1. Create a `data/<recommendation>/` directory.
2. Author `standard.yaml` (value model) and `dimensions.yaml` (classification axes).
3. Author requirements, conformance tests, and forms as separate YAML files.
4. Validate against the JSON Schemas in `data/schemas/`.
5. Generate TypeScript modules.

No engine code is touched.
