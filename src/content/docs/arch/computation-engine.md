---
title: 'Computation Engine'
shortTitle: 'Computation'
---

The Computation Engine is the runtime that evaluates calculation declarations embedded in form fields. It is one of the two cross-cutting primitives (along with [Tables](/docs/arch/tables-lookups)) that enforce MECE — calculations are defined once and referenced everywhere.

## Calculation primitive

A **Calculation** is a typed, named, reusable computation. It declares:

- **Inputs** — typed references to other fields, constants, or context values.
- **Expression** — an [AsciiMath](/docs/arch/expression-language) arithmetic expression over the inputs.
- **Output type** — the quantity and unit the result is expressed in.
- **Rounding rules** — significant digits, decimal places, or explicit OIML rounding conventions.

For example, the load-cell relative error formula `E = (I − I_ref) / f` is a single Calculation referenced by every form that needs to compute relative error.

## Evaluation order

Calculations are evaluated in topological order — if Calculation B depends on Calculation A, A is evaluated first. The build pipeline validates that the dependency graph is acyclic.

## Numeric safety

The engine:

- Tracks units through every operation (via [UnitsML](/about/technology#unitsml)).
- Validates dimension compatibility before evaluation.
- Reports unit mismatches at build time, not runtime.
- Applies rounding only at the field boundary, not intermediate computations.
