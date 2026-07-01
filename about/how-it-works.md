---
title: How it works
description: 'OIML SMART uses a layered architecture: a shared core ontology provides the foundation, domain ontologies extend it per Recommendation, and structured requirements and conformance tests build on top.'
eyebrow: 'About · 03'
---

<PageHero />



<DraftCallout />
## Layered Architecture

Each layer builds on the one below it. The core ontology defines shared concepts, domain ontologies add Recommendation-specific classes, and requirements and tests add concrete verifiable provisions.

- **OIML Core Ontology** — shared vocabulary across all OIML Recommendations: certification lifecycle, test parameters, document structure, and common metrological concepts. Defined independently; feature-equivalent to IEC-ISO SMART Core where applicable.
- **Domain Ontologies** — per-standard or per-related-standard-group ontologies. Each International Recommendation defines its own domain classes and instances (e.g. R 60 load cell concepts, R 144 gas meter concepts) that build on the Core Ontology.
- **Requirements** — machine-readable requirements classes with structured acceptance criteria — tiered, threshold, and qualitative — parameterized by instrument classification. Explicit dependency chains link requirements to conformance tests and test report forms.
- **Conformance Tests** — structured test procedures linked to requirements. Test report forms contain embedded computation declarations that auto-calculate field values based on the subject's classification.

## From source to application

A SMART Recommendation follows a three-stage pipeline from authoring to runtime:

1. **Source data (YAML).** Subject matter experts author the Recommendation as structured YAML files — requirements classes, conformance test definitions, form schemas with calculation declarations, and terminology entries. This is the single source of truth, maintained in version control alongside the published PDF.
2. **Generated modules (TypeScript).** A build pipeline converts YAML source into TypeScript modules — type-safe data structures that can be imported directly by the application. Requirements become typed objects, forms become executable schemas, and calculations become evaluable expressions.
3. **Runtime evaluation.** The application loads generated modules, instantiates requirements for a specific instrument under test, and evaluates them against measurement data. Results are recorded as structured test report instances that can be exported, signed, and submitted.

## Requirements Model

Each International Recommendation is decomposed into machine-readable **requirements classes**. A requirements class groups related requirements that apply to a specific category of instrument — for example, an accuracy class or a measurement principle.

- **Tiered criteria** — graded acceptance levels (e.g. Class I, II, III) with per-tier thresholds that vary by instrument classification.
- **Threshold criteria** — numeric limits (maximum permissible errors, operating ranges) parameterized by dimension context such as accuracy class and load range.
- **Qualitative criteria** — descriptive requirements (construction, marking, documentation) with structured accept/reject semantics.

Requirements are parameterized by **dimensions** — the classification axes of the instrument (e.g. accuracy class, measurement range, operating temperature). The same requirement template produces different acceptance criteria for different dimensional contexts through a process called *specialization*.

## Calculation Engine

Test report forms contain embedded **calculation declarations** — instructions that tell the platform how to calculate field values automatically. This replaces manual spreadsheet formulas and lookup table recreation.

- **Table lookups** — interpolate values from multi-dimensional lookup tables defined in the Recommendation. For example, maximum permissible errors as a function of load and accuracy class.
- **Numeric expressions** — arithmetic expressions that reference other form fields, constants, and computed values. Supports conditional logic and rounding rules.
- **Pass/fail logic** — compare measured values against computed limits and produce explicit pass/fail verdicts with traceability to the originating requirement.

Calculations are written in the embedded expression language (AsciiMath for arithmetic, OCL for boolean conditions) — see the [expression language reference](/docs/arch/expression-language.html).

## Certification Workflow

The platform supports the full OIML-CS lifecycle:

1. Manufacturer submits application → Issuing Authority reviews.
2. IA commissions Test Laboratory, selects samples and tests.
3. TL captures results with shared instrument context.
4. Forms auto-calculate via embedded computations.
5. IA consolidates results → issues certificate.

Every step is captured as structured data with full traceability from certificate back to the originating requirement. Read the [workflow overview](/docs/workflow/overview.html) for the end-to-end picture.
