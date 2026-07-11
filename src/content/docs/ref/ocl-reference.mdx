---
title: 'OCL Reference'
shortTitle: 'OCL'
---

A quick reference for the Object Constraint Language (OCL) expressions used in SMART form `pass_if` declarations and Requirement applicability filters. OCL is also the constraint language used by Primmel and MMEL.

## Core syntax

### Navigation

```txt
self.attribute_name          -- attribute access
self.association->size()     -- collection size
self.linked.field            -- chain through associations
```

### Quantifiers

```txt
self.items->forAll(x | x.value <= x.limit)         -- all must satisfy
self.items->exists(x | x.value > x.threshold)      -- at least one satisfies
self.items->select(x | x.kind = 'measured')        -- filter
self.items->reject(x | x.kind = 'metadata')        -- inverse filter
```

### Aggregations

```txt
self.items->collect(x | x.value)                   -- map to a collection of values
self.items->collect(x | x.value)->sum()            -- sum
self.items->collect(x | x.value)->max()            -- maximum
self.items->collect(x | x.value)->min()            -- minimum
self.items->collect(x | x.value)->avg()            -- average
```

### Conditionals

```txt
if self.accuracy_class = 'A' then
  self.error <= 0.5
else
  self.error <= 1.0
endif
```

### Boolean operators

```txt
A and B
A or B
A xor B
not A
A implies B
```

## Common patterns in SMART

### All measured values must be within MPE

```txt
context MeasurementErrorForm
inv WithinMPE:
  self.measurements->forAll(m | m.value <= m.mpe)
```

### At least one sample passes per requirement

```txt
context RequirementEvaluation
inv SamplePass:
  self.sample_results->exists(r | r.verdict = 'pass')
```

### Conditional applicability

```txt
context Requirement
inv Applicability:
  if self.classification.accuracy_class = 'A' then
    self.applies = true
  else
    self.applies = (self.classification.load_max <= 5000)
  endif
```

## Where OCL is used

- **Form `pass_if`** — the top-level boolean expression that produces a form verdict.
- **Requirement applicability** — declares under which dimension values a requirement applies.
- **State machine guards** — preconditions on transitions.
- **Primmel model constraints** — semantic invariants in the information model.
