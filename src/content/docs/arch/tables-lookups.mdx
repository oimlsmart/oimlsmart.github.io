---
title: 'Tables & Lookups'
shortTitle: 'Tables'
---

The Table primitive is the second cross-cutting primitive (along with [Calculations](/docs/arch/computation-engine)). It encodes the multi-dimensional lookup tables that pervade OIML Recommendations — most notably the Maximum Permissible Error (MPE) tables.

## Why a primitive

In a traditional test report, MPE lookups are done by hand: the operator reads the load, looks up the corresponding MPE for the accuracy class, and copies it into the form. This is slow and error-prone.

In SMART, the MPE table is declared once as a **Table** entity and referenced by every form that needs an MPE value. The engine performs the lookup automatically.

## Table kinds

A Table can be one of three kinds:

- **Tiered table** — a discrete mapping from a classification (e.g. accuracy class) to a value or set of values. Indexed by enumeration.
- **Scalar table** — a continuous mapping from a single numeric input to an output. Supports interpolation.
- **Range table** — a piecewise mapping from numeric ranges to values. Supports interpolation within ranges and extrapolation rules at boundaries.

## Example: R 60 MPE table

The OIML R 60 MPE table maps (accuracy class, load range) → maximum permissible error. As a SMART Table:

```yaml
kind: range
inputs:
  - name: accuracy_class
    type: enumeration
    values: [A, B, C]
  - name: load_range
    type: numeric
    unit: kg
output:
  name: mpe
  unit: e (verification scale interval)
ranges:
  - when: { accuracy_class: A, load_range: [0, 500] }
    value: 0.5
  - when: { accuracy_class: A, load_range: [500, 1000] }
    value: 1.0
  # ...
```

Any form that needs the MPE for a given load simply declares `lookup: r60_mpe_table` and binds its inputs. The engine resolves it at runtime.
