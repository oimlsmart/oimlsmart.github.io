# Forms

Forms are Layer 3 of the SMART entity model. A **Form** is a structured data capture template linked to one or more ConformanceTests; a **Field** is the smallest unit of data the form captures.

## What makes a SMART form different

Traditional OIML test report forms are PDFs or spreadsheets. SMART forms are executable schemas:

- Each **field** is typed (numeric, enumeration, boolean, calculated).
- Each field declares its **measurement kind** — the quantity, unit, and dimension context it captures.
- **Calculated fields** carry embedded computation declarations (see [Computation Engine](/docs/arch/computation-engine)) that the platform evaluates automatically.
- Each form declares a **`pass_if`** expression (in [OCL](/docs/arch/expression-language)) that aggregates field-level pass/fail into an overall form verdict.

## Field kinds

- **Direct (measured) fields** — values the test laboratory enters from instrument readings.
- **Derived (calculated) fields** — values the platform computes from other fields, constants, or table lookups.
- **Metadata fields** — context such as ambient temperature, operator, sample identifier.
- **Verdict fields** — pass/fail results per requirement criterion, computed by evaluating the criterion against measured and derived values.

## Form lifecycle at runtime

1. **Instantiate** — create a `FormInstance` from the schema, bound to a specific `ConformanceTest` and `TestReport`.
2. **Populate** — TL enters measured values and metadata.
3. **Derive** — the engine evaluates calculated fields in topological order.
4. **Evaluate** — the engine applies the `pass_if` expression to produce the overall form verdict.
5. **Trace** — each evaluation result is linked back through the form to the originating requirement.

The result is a fully auditable, machine-readable test report.
