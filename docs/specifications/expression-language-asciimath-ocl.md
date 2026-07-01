<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 08</span>
  <h1>Expression Language — AsciiMath + OCL</h1>
  <p class="lede">The two expression languages used in SMART — AsciiMath for arithmetic, OCL for booleans.</p>
</div>


<div class="callout draft-notice">
<strong>DRAFT — Pilot programme</strong>
<p>
This document is part of the SMART_REQS specification set for the OIML SMART
pilot. It is a <strong>draft</strong> and may change without notice as the
pilot evolves. The current version is published from the OIML SMART
specification repository.
</p>
</div>


## Purpose

This document revises the expression language design from SMART_REQS 04. The system
now uses **two complementary languages** instead of a single OCL subset:

1. **AsciiMath + math.js** for arithmetic calculations (inputs → output)
2. **OCL** for boolean conditions and collection quantifiers (evaluation, pass/fail)

## Design Rationale

OCL is designed for constraints, not arithmetic. Using it for math expressions forces
unnatural syntax and misses the benefit of established math libraries. The split is:

| Layer | Language | Library | Purpose |
|-------|----------|---------|---------|
| **Calculations** | AsciiMath | math.js | Arithmetic: `E_L = (I - I_ref) / f` |
| **Conditions** | OCL | Custom engine | Boolean: `abs(error_EL) <= abs(mpe)` |
| **Pass/Fail** | OCL | Custom engine | Quantifiers: `readings->forAll(r \| r.ok)` |

### Why AsciiMath + math.js

1. **AsciiMath** is a human-readable math notation that renders to MathML for display
   and can be parsed by math.js for evaluation. One notation serves both purposes.
2. **math.js** is a mature JavaScript library (30M+ weekly downloads) supporting:
   - Expression parsing and evaluation with variable substitution
   - Unit conversions (kg to g, degC to K)
   - Matrix/collection operations
   - Custom functions and scope
3. **OCL** handles what math.js doesn't: boolean logic, collection quantifiers,
   cross-form references, and conditional evaluation.

## Where Each Language Is Used

### AsciiMath (math.js) — Calculation expressions

```yaml
# In calculations (standard.yaml)
- name: loadCellError
  inputs:
    - name: avgIndication
      type: number
      unit: counts
    - name: referenceIndication
      type: number
      unit: counts
    - name: conversionFactor
      type: number
      unit: "counts/v"
  output:
    name: error_EL
    type: number
    unit: v
  expression: "(avgIndication - referenceIndication) / conversionFactor"
```

The expression is plain math.js syntax. Variables are resolved from the calculation's
input bindings.

### OCL — Evaluation rules, conditions, pass/fail

```yaml
# In form field evaluation rules
- name: creep_30min_result
  measurement_method: evaluated
  evaluation:
    rule: "ocl{abs(max_creep_change_v) <= 0.7 * abs(mpe_at_dmax)}"
    condition: "|C_C(30 min)| ≤ 0.7 × |MPE|"

# In pass/fail
  pass_fail:
    pass_if: "ocl{creep_30min_result = 'pass' and creep_20_30_result = 'pass'}"

# In conformance test criteria
  acceptance_criteria:
    pass_if: "ocl{temperature_readings->forAll(r | r.within_mpc = 'yes')}"
```

## The `ocl{}` Prefix

All OCL expressions use the `ocl{}` prefix to distinguish them from math expressions:

- `derivation: "(indication - initial) / f"` → math.js expression (no prefix)
- `rule: "ocl{abs(error_EL) <= abs(mpe)}"` → OCL expression (prefixed)
- `pass_if: "ocl{all_results = 'pass'}"` → OCL expression (prefixed)

Calculation expressions do NOT use the `ocl{}` prefix — they're pure math.

## math.js Integration

### Scope Resolution

When evaluating a calculation expression, the engine creates a math.js scope from
the bound input values:

```typescript
import { evaluate } from 'mathjs'

const scope = {
  avgIndication: 10050,
  referenceIndication: 10000,
  conversionFactor: 2.0
}

const result = evaluate('(avgIndication - referenceIndication) / conversionFactor', scope)
// result = 25
```

### Custom Functions

math.js supports custom functions registered in the scope:

```typescript
import { create, all } from 'mathjs'
const math = create(all)

// Register lookup_mpe as a custom function
math.import({
  lookup_mpe: (load: number, accuracyClass: string, pLC: number) => {
    // MPE tier lookup logic
  }
}, { override: true })
```

### Unit Handling

math.js has built-in unit support:

```typescript
math.evaluate('5.2 kg + 300 g')  // 5.5 kg
math.evaluate('100 degC to degF') // 212 degF
```

This enables unit-aware calculations and automatic conversion.

## OCL Language (Revised Scope)

OCL now handles only:
1. **Boolean comparisons**: `=`, `<>`, `<`, `>`, `<=`, `>=`
2. **Logical operators**: `and`, `or`, `not`, `xor`, `implies`
3. **Collection quantifiers**: `->forAll(lambda)`, `->exists(lambda)`
4. **Collection filters**: `->select(lambda)`, `->collect(lambda)`, `->reject(lambda)`
5. **Collection aggregates**: `->size`, `->max`, `->min`, `->sum`, `->average`
6. **Context variables**: `$context.*`, `$index`, `$prev`, `$self`, `$root`
7. **Conditional**: `if/then/else/endif`
8. **Built-in functions**: `abs()`, `max()`, `min()` (for comparisons, not math)

Arithmetic operations (`+`, `-`, `*`, `/`) are still supported in OCL for threshold
expressions like `0.7 * abs(mpe)` — these are simple enough that math.js isn't needed.

## OCL Grammar (Revised)

```
Expression      ::= LogicalExpr

LogicalExpr     ::= ImplicationExpr
ImplicationExpr ::= OrExpr ('implies' OrExpr)*
OrExpr          ::= XorExpr ('or' XorExpr)*
XorExpr         ::= AndExpr ('xor' AndExpr)*
AndExpr         ::= NotExpr ('and' NotExpr)*
NotExpr         ::= 'not' NotExpr | ComparisonExpr
ComparisonExpr  ::= ArithmeticExpr (CompOp ArithmeticExpr)?
CompOp          ::= '=' | '<>' | '<' | '>' | '<=' | '>='
ArithmeticExpr  ::= MultiplicativeExpr (('+' | '-') MultiplicativeExpr)*
MultiplicativeExpr ::= UnaryExpr (('*' | '/') UnaryExpr)*
UnaryExpr       ::= '-' UnaryExpr | PostfixExpr
PostfixExpr     ::= PrimaryExpr (PropertyAccess | CollectionOp | IndexAccess)*
PrimaryExpr     ::= NumberLiteral | StringLiteral | BooleanLiteral
                 | ContextVar | Identifier | '(' Expression ')'
                 | IfExpr
```

OCL expressions within `rule:` and `pass_if:` fields may contain simple arithmetic
for threshold expressions but delegate complex computation to Calculation references.

## Form Field Expression Resolution

When a form field has `measurement_method: derived`:

1. If the field has a `calculation:` reference → resolve inputs, evaluate with math.js
2. If the field has a `derivation:` expression (no `ocl{}` prefix) → evaluate with math.js
3. If the field has a `derivation:` expression (with `ocl{}` prefix) → evaluate with OCL engine

When a form field has `measurement_method: evaluated`:

1. The `evaluation.rule` is always OCL (with `ocl{}` prefix)
2. OCL may reference derived field values computed by math.js in step 1

## Dependency Between Layers

```
User fills direct fields (measurements)
    ↓
math.js evaluates Calculation expressions → derived field values
    ↓
OCL evaluates boolean rules → pass/fail per field
    ↓
OCL evaluates pass_if → overall form result
```

The layers are strictly ordered: math → boolean → aggregate.
