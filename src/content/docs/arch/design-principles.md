# Design Principles

Six principles shape every decision in the OIML SMART information model.

## 1. Code has no data

All domain knowledge lives in YAML files — never in code. The codebase is a pure evaluation engine: it parses YAML, evaluates expressions, and renders forms. MPE tables, test procedures, acceptance criteria — everything is declared in data. Adding a new OIML standard means writing YAML schemas, not writing code.

## 2. Declarative (Open-Closed Principle)

Everything is declared, never programmed. The system is open for extension — adding a new standard requires only YAML data — but closed for modification — the engine code doesn't change. The `dimensions.yaml` mechanism makes the entire workflow configurable per standard.

## 3. Closed under reference

Every identifier must resolve to a declared entity. No dangling references, no implicit knowledge, no stringly-typed lookups. The validation pipeline catches unresolved identifiers at build time, enabling static analysis and type-safe TypeScript generation from the YAML schemas.

## 4. MECE — Mutually Exclusive, Collectively Exhaustive

Every domain concept has exactly one canonical definition point. Calculations and Tables are first-class primitives specifically to enforce this: the load-cell-error formula `E = (I − I_ref) / f` is defined once and referenced by every form that needs it. No duplication, no divergence.

## 5. Traceability

Every evaluation result traces back through the full chain:

**Requirement → ConformanceTest → Form → FormInstance → Evaluation**

No orphan results — every pass/fail determination is grounded in a normative requirement with computed evidence showing exactly what was measured and compared against what threshold.

## 6. MMEL-Compatible (via Primmel)

YAML structures map 1:1 to Primmel (and through Primmel, to MMEL — the Multi-Modal Modelling Language developed jointly by Ribose and BSI). This ensures the digital specifications are semantically equivalent to their paper counterparts, enabling future interoperability and exchange between national metrology bodies. See [About → Technology](/about/technology.html) for context.

Next: [supported standards](/docs/arch/standards.html).
