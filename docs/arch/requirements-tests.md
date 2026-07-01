# Requirements & Conformance Tests

The first two layers of the SMART entity model: the *normative provisions* a Recommendation makes, and the *test procedures* used to verify them.

## Layer 1 — Requirements

A **RequirementClass** groups related requirements that apply to a specific category of instrument — for example, an accuracy class or a measurement principle. Each **Requirement** declares:

- An **obigation level** (shall / should / may / will).
- An **acceptance criterion** of one of three types:
  - *Tiered criteria* — graded acceptance levels (e.g. Class I, II, III) with per-tier thresholds.
  - *Threshold criteria* — numeric limits parameterized by dimension context (accuracy class, load range, etc.).
  - *Qualitative criteria* — descriptive requirements (construction, marking, documentation) with accept/reject semantics.
- **Applicability filters** — the dimension contexts under which the requirement applies.

## Layer 2 — Conformance Tests

A **ConformanceTestClass** defines a category of test (e.g. "measurement error", "repeatability", "temperature drift"). A **ConformanceTest** declares:

- The **variables** it produces (typed, with units).
- The **procedure steps** (ordered, possibly parameterized).
- The **acceptance criteria** (typically referencing a Requirement).
- The **result forms** that capture the measurements.

The link from `ConformanceTest` to `Requirement` is many-to-many: a single test may verify several requirements, and a single requirement may be verified by several tests. This explicit dependency graph is what enables full [traceability](/docs/arch/design-principles.html#_5-traceability).

See the [workflow → form data binding](/docs/workflow/form-data-binding.html) page for how fields in a form resolve to test variables and ultimately to requirement criteria.
