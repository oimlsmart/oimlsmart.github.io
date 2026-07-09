---
title: Conformance tests
description: 'Conformance tests are the procedures that verify requirements. Each test declares its variables, procedure steps, and result forms. The cross- reference graph links tests back to the requirements they verify.'
eyebrow: 'Guide · 08 of 13'
---


## Test anatomy

```yaml
identifier: measurement-error-mdlo
urn: "urn:oiml:test:r60:measurement-error-mdlo"
name: "Measurement error (MDLO procedure)"

targets:
  - urn:oiml:requirement:r60:mpe
  - urn:oiml:requirement:r60:repeatability

variables:
  - name: load
    type: numeric
    unit: kg
    role: input   # value applied by the test
  - name: indication
    type: numeric
    unit: kg
    role: measured   # value read from the instrument
  - name: error
    type: numeric
    unit: kg
    role: derived   # value computed by the form

procedure:
  - step: 1
    description: "Apply preload (110% of Max), hold for 1 minute, return to zero."
  - step: 2
    description: "Wait for stability (no indication change for 30 seconds)."
  - step: 3
    description: "Apply loads from minimum to maximum in at least 5 steps."
  - step: 4
    description: "At each step, record indication. Repeat for decreasing load."

result_forms:
  - urn:oiml:form:r60:measurement-error-mdlo

environment:
  temperature: { value: 20, unit: C, tolerance: 2 }
  humidity:    { value: 50, unit: pct, tolerance: 10 }
  vibration:   "negligible"

ref: "R 60 §4.4.1"
```

## The cross-reference graph

Every test declares which requirements it targets. This forms a
many-to-many graph: a single test can verify multiple requirements, and a
single requirement may be verified by multiple tests.

```
urn:oiml:test:r60:measurement-error-mdlo  ──→  urn:oiml:requirement:r60:mpe
                                          ──→  urn:oiml:requirement:r60:repeatability

urn:oiml:test:r60:creep                   ──→  urn:oiml:requirement:r60:creep
                                          ──→  urn:oiml:requirement:r60:zero_return
```

The build pipeline validates that every `targets` reference resolves to a
declared `Requirement` URN. No dangling references, no implicit knowledge.

## Variables

Test variables are typed quantities. Three roles:

- **`input`** — values applied by the test (loads, temperatures).
- **`measured`** — values read from the instrument under test.
- **`derived`** — values computed from inputs and measurements (errors, ratios).

Variables flow into the result form's field bindings. The form's pass/fail
expression can reference any variable.

## Procedure steps

Procedure steps are written for the test laboratory operator. They're
displayed in the test execution UI and included in the test report PDF.
Steps can include:

- Time bounds (`hold for 1 minute`).
- Conditional logic (`if temperature > 30°C, ...`).
- Repeated sub-procedures (cycles).

## Environment

The `environment` block declares the reference conditions for the test.
The test laboratory records actual ambient conditions in the FormInstance;
deviations from reference are flagged in the report.

## Result forms

A test typically produces one or more test report forms. Each form captures
one set of measurements against one or more acceptance criteria. The wiring:

```yaml
result_forms:
  - urn:oiml:form:r60:measurement-error-mdlo
```

See the [Test Report Forms guide](/docs/guides/test-report-forms.html) for
the form schema.

## Test class grouping

Tests are grouped under a `ConformanceTestClass` (CC) — analogous to a
requirements class. A CC typically groups tests by topic:
measurement-error, repeatability, creep, temperature-effects, etc.

```yaml
# conformance/cc.yaml
class_identifier: r60-metrological
urn: "urn:oiml:cctest:r60:metrological"
name: "R 60 Metrological tests"
tests:
  - urn:oiml:test:r60:measurement-error-mdlo
  - urn:oiml:test:r60:repeatability
  - urn:oiml:test:r60:creep
  - urn:oiml:test:r60:temperature-effects
```

## Next

[Test Report Forms](/docs/guides/test-report-forms.html) shows how test variables become structured form fields with embedded calculations.
