# Instances & Evaluation

Layers 4 and 5: runtime data and the evaluation pipeline that produces verdicts.

## Layer 4 — Form Instances

A **FormInstance** is a runtime occurrence of a Form, populated by a Test Laboratory during a specific test. It references:

- Its **Form schema** (build-time declaration).
- Its **ConformanceTest** context.
- Its parent **TestReport**.
- The **InstrumentSample** under test.

Form instances live in IndexedDB in the browser (or in a server-side store for non-browser deployments). Each instance is a versioned, immutable-on-submit record.

## Layer 5 — Evaluation Results

The evaluation pipeline (described in the [architecture overview](/docs/arch/overview#data-flow)) processes a populated FormInstance against its schema and produces:

- A **FormDetermination** for each criterion — pass / fail / conditional, with computed evidence.
- An **EvaluationResult** aggregating all FormDeterminations for the form.
- Traceability links back through the schema to the originating Requirement.

The aggregation is bottom-up: field-level determinations feed form-level determinations, which feed test-level determinations, which feed the overall evaluation report.

## Why this matters

Because every result is grounded in a build-time Requirement declaration and accompanied by computed evidence, the entire evaluation pipeline is auditable. A reviewer (or an OIML-CS Utilizer) can trace any pass/fail verdict back to:

1. The measured values the TL entered.
2. The computations the engine performed.
3. The thresholds the criterion specified.
4. The normative Requirement that defined the criterion.
