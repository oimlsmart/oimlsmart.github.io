# Form Data Binding

A form's fields don't exist in isolation — they bind to a context made up of the Form schema, the ConformanceTest, the InstrumentSample, and the TestReport. Resolving these bindings is what lets the engine evaluate calculations and pass/fail verdicts.

## The binding context

When a `FormInstance` is created, the engine assembles its **binding context**:

| Source | Provides |
| --- | --- |
| Form schema | Field definitions, calculation declarations, `pass_if` expression |
| ConformanceTest | Test variables, acceptance criteria |
| InstrumentSample → ClassificationGroup | Dimension values (accuracy class, load range, etc.) |
| TestReport | Shared context (ambient conditions, operator, date) |
| Standard | Tables, calculations, terminology |

## Resolution rules

A field's value can come from:

1. **Direct entry** — the TL types it in.
2. **Computation** — declared in the field's `calculation` block; resolved via topological order over other fields.
3. **Table lookup** — declared in the field's `lookup` block; resolved by binding the table's inputs from the context.
4. **Context reference** — bound to a value from the parent TestReport or ClassificationGroup (e.g. ambient temperature, accuracy class).

The engine validates at build time that every field has exactly one resolution source — no ambiguous bindings, no missing sources.

## Why this matters

Because bindings are explicit and validated, the engine can statically guarantee that a populated FormInstance will evaluate successfully. There are no "runtime surprises" where a calculation references a missing field.
