---
title: The OIML SMART ontology
description: 'The OWL ontology layer is what makes SMART Recommendations interoperable — across Recommendations, across national boundaries, and across the broader standards-development ecosystem.'
eyebrow: Semantic layer
---




## Three layers

```
Domain ontology (per Recommendation)
   ↓ extends
OIML Core ontology
   ↓ imports
SMART Core ontology
```

- **SMART Core** — concepts shared with every SMART standardization programme worldwide (OIML SMART, IEC-ISO SMART, BSI SMART). Imports QUDT, OML, and VIM.
- **OIML Core** — OIML-specific concepts shared across every Recommendation: Recommendation, Requirement, ConformanceTest, Form, Certificate, IssuingAuthority.
- **Domain** — per-Recommendation concepts (R 60: LoadCell, AccuracyClass; R 144: DiaphragmGasMeter, FlowRateClass).

## What the ontology enables

- **Cross-Recommendation queries** — "show me every requirement that references a force-measurement concept."
- **Reasoning** — infer that R 60 Class A is equivalent to R 76 Class I (where the mapping is declared).
- **External interoperability** — third-party tools can query OIML SMART data via SPARQL.

## Browsing

The SMART application includes an interactive ontology browser that
visualizes the class hierarchy, shows instances, and lets users run
semantic queries. The browser is available at
[the app sign-in](/app/) under the
"Ontology" navigation entry.

Each entity has a dedicated detail page (e.g. `/docs/ontology/<slug>.html`)
with:

- Its label, description, and source.
- Parent class and subclasses.
- Instances (for enumerated classes).
- Properties (for object/data properties).

## Authoring

The domain ontology lives in `data/<standard>/ontology.ttl` (Turtle
format). The build pipeline validates the syntax, imports upper layers,
extracts terminology into `terminology.yaml`, and generates TypeScript
modules for runtime use.

See the developer guide on [Ontology Architecture](/docs/guides/ontology)
for the authoring workflow.

## Cross-references

- [Technology overview](/about/technology) — Primmel, Metanorma, Relaton, LutaML.
- [Architecture overview](/docs/arch/overview) — how the ontology fits in the six-layer model.
- [Terminology guide](/docs/guides/terminology) — terms and cross-refs.
