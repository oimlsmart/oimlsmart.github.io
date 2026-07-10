# 28 — Audit: criterion operator registry (true OCP)

**Status:** ✓ implemented
**Type:** architectural improvement
**Audit finding:** `evaluateMatch()` uses a `switch` statement over operator strings

## Finding

The current `evaluateMatch` in `lab-selection.service.ts`:

```ts
switch (match.operator) {
  case 'always_pass': return true
  case 'has_capability': ...
  case 'capability_from_field': ...
  case 'capability_covers_value': ...
  case 'capability_prefix_match': ...
  default: return true  // forward-compatible
}
```

This violates OCP: adding a new operator means editing the function
(the `switch` is closed-for-modification only by convention; in
practice every new operator requires touching this code).

## Proposal

Replace the switch with a **registry of operator handlers**:

```ts
// src/lib/lab-selection-operators.ts
import type { Lab, LabRankingContext, MatchSpec } from './lab-selection.service'

export type MatchEvaluator = (
  match: MatchSpec,
  lab: Lab,
  context: LabRankingContext,
) => boolean

const operators = new Map<string, MatchEvaluator>()

export function registerMatchOperator(name: string, fn: MatchEvaluator): void {
  operators.set(name, fn)
}

export function getMatchOperator(name: string): MatchEvaluator | undefined {
  return operators.get(name)
}

// Built-in operators — registered on module load
registerMatchOperator('always_pass', () => true)
registerMatchOperator('has_capability', (match, lab) => {
  if (!match.required_capability) return true
  return new Set(lab.capabilities ?? []).has(match.required_capability)
})
// ... etc
```

In `evaluateMatch`:

```ts
function evaluateMatch(match: MatchSpec, lab: Lab, context: LabRankingContext): boolean {
  const op = getMatchOperator(match.operator)
  if (!op) return true  // unknown → forward-compatible pass
  return op(match, lab, context)
}
```

## Why this is better

- **Open for extension**: a plugin/extension module can `registerMatchOperator('new_op', fn)` without editing the service
- **Closed for modification**: the service file doesn't change when operators are added
- **Testable in isolation**: each operator's behavior can be tested against the registry
- **Discoverable**: `Array.from(operators.keys())` lists what's available

## Trade-offs

**Pros**
- True OCP — adding operators doesn't touch existing code
- Plugin-ready (future: standards-specific operator packs)
- Each operator is a small, single-purpose function

**Cons**
- More moving parts (map + register function + handlers file)
- Harder to read at a glance (must jump between handler and registry)
- Order of registration matters if names collide (last-wins)

For 5 operators, the switch is fine. The registry earns its keep once we cross
~10 operators or want plugin-style extensions (e.g., a "calibration traceability"
operator pack that only some standards use).

## Acceptance criteria

- [ ] Operator registry exists
- [ ] All 5 existing operators ported to registry pattern
- [ ] `evaluateMatch` looks up via registry, falls back to pass
- [ ] Existing tests still pass
- [ ] New test: registering a custom operator from a test works without service edits
