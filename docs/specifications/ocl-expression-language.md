<div class="page-hero">
  <span class="eyebrow">Formal Specification · SMART_REQS 04</span>
  <h1>OCL Expression Language</h1>
  <p class="lede">OCL constraint language reference for the SMART platform.</p>
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

This document specifies the complete OCL (Object Constraint Language) expression
language used in SMART YAML data files. Every computation, derivation, evaluation rule,
and pass/fail condition is expressed in this language. The language uses a YAML-like
key-value data access model where variable names correspond to YAML field names.

## Design Goals

1. **Unambiguous.** Every expression has a single parse tree.
2. **YAML-native.** Variable names are YAML keys; property access is dot notation.
3. **Closed under reference.** Every identifier resolves to a declared entity.
4. **Type-aware.** Operators enforce type compatibility at evaluation time.
5. **Enclosed syntax.** OCL expressions in YAML are prefixed with `ocl{` and suffixed
   with `}` to distinguish them from prose strings.

## Enclosed Syntax Convention

In YAML files, OCL expressions appear as string values in designated fields:
`derivation`, `rule`, `pass_if`, `computation`, and `expression`. The `ocl{...}`
prefix makes the expression type explicit and prevents ambiguity with prose strings.

```yaml
# OCL expression (machine-evaluable)
derivation: "ocl{(indication_counts - initial_dmax_indication) / conversion_factor_f}"

# Prose description (human-readable)
condition: "|C_C(30 min)| ≤ 0.7 × |MPE|"
```

The OCL engine strips the `ocl{` prefix and `}` suffix before parsing. If the string
does not start with `ocl{`, it is treated as a prose value (not evaluated).

## Formal Grammar (EBNF)

```
Expression        ::= LetExpr | IfExpr | LogicalExpr

LetExpr           ::= 'let' Identifier (':' TypeExpr)? '=' Expression 'in' Expression

IfExpr            ::= 'if' Expression 'then' Expression
                      'else' Expression 'endif'

LogicalExpr       ::= ImplicationExpr

ImplicationExpr   ::= OrExpr ('implies' OrExpr)*

OrExpr            ::= XorExpr ('or' XorExpr)*

XorExpr           ::= AndExpr ('xor' AndExpr)*

AndExpr           ::= NotExpr ('and' NotExpr)*

NotExpr           ::= 'not' NotExpr | ComparisonExpr

ComparisonExpr    ::= AdditiveExpr (CompOp AdditiveExpr)?

CompOp            ::= '=' | '<>' | '!=' | '<' | '>' | '<=' | '>='

AdditiveExpr      ::= MultiplicativeExpr (('+' | '-') MultiplicativeExpr)*

MultiplicativeExpr ::= UnaryExpr (('*' | '/' | 'mod') UnaryExpr)*

UnaryExpr         ::= '-' UnaryExpr | PowerExpr

PowerExpr         ::= PostfixExpr ('^' PowerExpr)?

PostfixExpr       ::= PrimaryExpr PostfixOp*

PostfixOp         ::= PropertyAccess
                    | CollectionOp
                    | FunctionCall
                    | IndexAccess

PropertyAccess    ::= '.' Identifier

CollectionOp      ::= '->' ('forAll' | 'exists' | 'collect' | 'select'
                      | 'reject' | 'any') '(' LambdaExpr ')'
                    | '->' ('size' | 'sum' | 'average' | 'max' | 'min'
                      | 'first' | 'last' | 'flatten' | 'asSet'
                      | 'isEmpty' | 'notEmpty' | 'count')

FunctionCall      ::= '(' ArgList? ')'

IndexAccess       ::= '[' Expression ']'

LambdaExpr        ::= Identifier '|' Expression
                    | Identifier '=>' Expression

PrimaryExpr       ::= NumberLiteral
                    | StringLiteral
                    | BooleanLiteral
                    | ContextVar
                    | Identifier
                    | '(' Expression ')'
                    | CollectionLiteral

ContextVar        ::= '$self' | '$root' | '$parent'
                    | '$context' ('.' Identifier)*
                    | '$index'
                    | '$form' ('.' Identifier)*

NumberLiteral     ::= [0-9]+ ('.' [0-9]+)? (('e'|'E') ('+'|'-')? [0-9]+)?

StringLiteral     ::= "'" [^']* "'"

BooleanLiteral    ::= 'true' | 'false'

CollectionLiteral ::= 'Sequence' '{' ArgList? '}'
                    | 'Set' '{' ArgList? '}'

TypeExpr          ::= 'Integer' | 'Real' | 'String' | 'Boolean'
                    | 'Collection' '(' TypeExpr ')'
                    | Identifier

ArgList           ::= Expression (',' Expression)*

Identifier        ::= Letter (Letter | Digit | '_')*
```

## Operator Precedence (highest to lowest)

| Level | Operators | Associativity |
|-------|-----------|--------------|
| 1 | Primary, `$context.*`, literal | — |
| 2 | `.`, `->`, `()`, `[]` (postfix) | Left |
| 3 | `^` (power) | Right |
| 4 | `-` (unary), `not` | Right |
| 5 | `*`, `/`, `mod` | Left |
| 6 | `+`, `-` | Left |
| 7 | `=`, `<>`, `!=`, `<`, `>`, `<=`, `>=` | None |
| 8 | `and` | Left |
| 9 | `xor` | Left |
| 10 | `or` | Left |
| 11 | `implies` | Right |
| 12 | `if/then/else/endif` | — |
| 13 | `let/in` | — |

## Type System

### Primitive Types

| Type | Description | Examples |
|------|-------------|---------|
| `Integer` | Whole number | `0`, `30`, `50000` |
| `Real` | Floating-point number | `0.7`, `0.15`, `1.5` |
| `String` | Text value | `'pass'`, `'yes'` |
| `Boolean` | Truth value | `true`, `false` |
| `Collection(T)` | Ordered sequence of T | `Sequence{1, 2, 3}` |
| `Void` | No value (NaN, null) | — |

### Implicit Type Coercion

- `Integer` → `Real`: automatic in arithmetic expressions.
- `Boolean` → `String`: `'true'`/`'false'` when compared to strings.
- `Collection(T)` → `T`: automatic when `size = 1` and scalar expected (with warning).

### Type Rules

```
Real    op Real    → Real      (+, -, *, /, mod, ^)
Integer op Integer → Integer   (+, -, *, /, mod, ^)
Real    op Integer → Real      (+, -, *, /, mod, ^)
Integer op Real    → Real      (+, -, *, /, mod, ^)

Real    op Real    → Boolean   (=, <>, <, >, <=, >=)
String  op String  → Boolean   (=, <>, <, >, <=, >=)
Boolean op Boolean → Boolean   (and, or, xor, implies)
Boolean             Boolean    (not)

Collection(T) -> size    → Integer
Collection(T) -> sum    → T (where T: Integer | Real)
Collection(T) -> average → Real
Collection(T) -> max    → T (where T: Integer | Real)
Collection(T) -> min    → T (where T: Integer | Real)
Collection(T) -> first  → T
Collection(T) -> last   → T
Collection(T) -> collect(lambda: T → U) → Collection(U)
Collection(T) -> select(lambda: T → Boolean) → Collection(T)
Collection(T) -> reject(lambda: T → Boolean) → Collection(T)
Collection(T) -> forAll(lambda: T → Boolean) → Boolean
Collection(T) -> exists(lambda: T → Boolean) → Boolean
```

## Built-in Functions

### Mathematical

| Function | Signature | Description |
|----------|-----------|-------------|
| `abs` | `(Real) → Real` | Absolute value |
| `round` | `(Real, Integer?) → Real` | Round to n decimal places (default 0) |
| `floor` | `(Real) → Integer` | Floor |
| `ceil` | `(Real) → Integer` | Ceiling |
| `sqrt` | `(Real) → Real` | Square root |
| `pow` | `(Real, Real) → Real` | Exponentiation |

### Aggregate

| Function | Signature | Description |
|----------|-----------|-------------|
| `max` | `(Real, Real, ...) → Real` | Maximum of arguments |
| `min` | `(Real, Real, ...) → Real` | Minimum of arguments |
| `sum` | `(Collection<Real>) → Real` | Sum of collection |
| `mean` | `(Collection<Real>) → Real` | Arithmetic mean (alias: `avg`) |
| `count` | `(Collection) → Integer` | Element count (alias: `size`) |
| `every` | `(Collection<Boolean>) → Boolean` | All true? |
| `any` | `(Collection<Boolean>) → Boolean` | Any true? |
| `first` | `(Collection<T>) → T` | First element |
| `last` | `(Collection<T>) → T` | Last element |
| `flatten` | `(Collection<Collection<T>>) → Collection<T>` | Flatten nested |

### Table Lookup

| Function | Signature | Description |
|----------|-----------|-------------|
| `lookup_mpe` | `(Real load, String accuracyClass, Real pLC) → Real` | MPE from tier table |
| `lookup` | `(String table, keys...) → Real` | Generic table lookup |
| `compute` | `(String name, params...) → Real` | Call registered computation |

### Conditional

| Function | Signature | Description |
|----------|-----------|-------------|
| `if` | `(Boolean, T, T) → T` | Ternary (also via `if/then/else/endif`) |

## Data Access Model

### YAML Key-Value Access

OCL expressions reference YAML data using the same names as YAML keys:

```yaml
# YAML declaration
fields:
  - name: temperature_readings
    type: array
    items:
      type: object
      fields:
        - name: temperature
          type: number
        - name: change_v
          type: number
```

```
# OCL access
temperature_readings->forAll(r | abs(r.change_v) <= abs($context.mpc))
temperature_readings->size()
temperature_readings[0].temperature
temperature_readings->collect(r | r.change_v)->max()
```

### Property Access (Dot Notation)

```
parent.child                  # Nested object property
readings[2].value             # Array element property
$context.accuracy_class       # Computation context field
$form.pass_fail.overall       # Form-level value
```

### Collection Access

```
readings->size()              # Count
readings->collect(r | r.v)    # Map to collection of values
readings->select(r | r.t > 20)# Filter
readings->forAll(r | r.ok)    # All satisfy predicate
readings->exists(r | r.ok)    # At least one satisfies
readings->max()               # Maximum (on numeric collection)
readings->min()               # Minimum
readings->sum()               # Sum
readings->average()           # Mean
readings->first()             # First element
readings->last()              # Last element
readings->asSet()             # Remove duplicates
readings->isEmpty()           # Boolean: empty?
readings->notEmpty()          # Boolean: non-empty?
```

### Context Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `$context.*` | Computation context fields | `$context.p_LC`, `$context.accuracy_class` |
| `$index` | Current loop index (0-based) in DATALIST iteration | `$index = 0` |
| `$self` | Current entity being evaluated | `$self.form_id` |
| `$root` | Root of the test report | `$root.forms['creep-dr']` |
| `$parent` | Parent scope in nested structures | `$parent.D_max` |
| `$form.*` | Other fields in the same form | `$form.pass_fail` |

### Cross-Form References

```
$root.forms['load-cell-info'].D_max      # D_max from header form
$root.forms['creep-dr'].overall_result   # Result of another form
$context.initial_dmax_indication          # Value from computation context
```

Cross-form references are resolved through the computation context. The `header`
form in `computation_context` declares which form provides shared values.

## Expression Examples (R 60 Domain)

### Derived field — load cell error
```yaml
derivation: "ocl{(avg_indication - reference_indication) / $context.conversion_factor_f}"
```

### Derived field — maximum creep change
```yaml
derivation: "ocl{creep_readings->collect(r | r.change_v)->max()}"
```

### Derived field — creep at specific time
```yaml
derivation: "ocl{creep_readings->select(r | r.time_minutes = 30)->first().change_v}"
```

### Derived field — barometric pressure effect (with index guard)
```yaml
derivation: "ocl{if $index = 0 then 0 else change_v / abs(pressure - prev(pressure)) endif}"
```

### Evaluated field — MPE check
```yaml
rule: "ocl{abs(error_EL) <= abs(mpe)}"
```

### Evaluated field — nested collection quantifier
```yaml
rule: "ocl{temperature_series->forAll(t | t.test_loads->forAll(l | l.within_mpe = 'yes'))}"
```

### Pass/fail — conjunction
```yaml
pass_if: "ocl{creep_30min_result = 'pass' and creep_20_30_result = 'pass' and dr_half_v_result = 'pass'}"
```

### Table lookup — MPE
```yaml
derivation: "ocl{lookup_mpe($context.D_max, $context.accuracy_class, $context.p_LC)}"
```

### Registered computation call
```yaml
derivation: "ocl{compute('maxAllowableSpanVariation', [$context.D_max, $context.accuracy_class, 1.0])}"
```

## Special Functions: prev() and index

### prev(field)

Returns the value of `field` from the previous element in a DATALIST iteration.
Equivalent to: `$parent.collection[$index - 1].field`.

For `$index = 0`, `prev()` returns `0` (or the identity element for the operation).

Only valid within DATALIST field derivation expressions.

### $index

The 0-based index of the current element within a DATALIST iteration.
Only valid within DATALIST field derivation expressions.

## Expression Validation

Every OCL expression must satisfy these rules before evaluation:

1. **All identifiers resolve.** Every variable name must be a declared field,
   context variable, or built-in function.
2. **Type compatibility.** Operators must receive operands of compatible types.
3. **No circular dependencies.** Derived fields must form a DAG (acyclic).
4. **Collection operations on collections.** `->` operators only on `Collection(T)` types.
5. **Lambda variables are scoped.** Lambda parameter names shadow outer variables
   within the lambda body.

The expression validator checks these rules at YAML load time (not at runtime),
producing errors that point to the specific expression and unresolved identifier.
