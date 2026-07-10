# 27 — Audit: type-safe criteria loading (drop `loadedStandards` magic)

**Status:** ✓ implemented
**Type:** architectural improvement
**Audit finding:** the original `getLabSelectionCriteria(standardId)` casts `loadedStandards` through `unknown` to read `lab_selection_criteria`

## Finding

The original code in smart/browser:

```ts
export function getLabSelectionCriteria(standardId: string): LabSelectionCriterion[] {
  const std = loadedStandards.find(s => s.id === standardId)
  return (std as unknown as { lab_selection_criteria?: LabSelectionCriterion[] }).lab_selection_criteria ?? []
}
```

The double cast through `unknown` is a code smell — it's how the original code
hid that the loaded-standards structure is untyped at runtime. The cost:
- No type safety on the YAML content
- Adding a new field to criteria YAML silently compiles even if the schema is wrong
- Tests can't easily mock the criteria source

## Proposal

Don't port `getLabSelectionCriteria` at all. Instead, make criteria an
explicit input to `rankLabs()` (which it already is) and provide a typed
loader that validates against the schema:

```ts
// src/lib/criteria-loader.ts
import type { LabSelectionCriterion } from './lab-selection.service'

/**
 * Load + validate lab-selection criteria for a standard.
 * Throws on schema violation — better to fail loudly than silently
 * use malformed data.
 */
export function loadLabSelectionCriteria(
  yaml: string,
  standardId: string,
): LabSelectionCriterion[] {
  const parsed = YAML.parse(yaml) as { standards?: Array<{ id: string; lab_selection_criteria?: LabSelectionCriterion[] }> }
  const std = parsed.standards?.find(s => s.id === standardId)
  const criteria = std?.lab_selection_criteria ?? []
  // Runtime validation: every criterion must have id + weight + match.operator
  for (const c of criteria) {
    if (!c.id || !c.weight || !c.match?.operator) {
      throw new Error(`Invalid criterion for ${standardId}: missing required field`)
    }
  }
  return criteria
}
```

## Trade-offs

**Pros**
- Caller has visibility into where criteria come from
- Validation at load time catches data errors early
- No magic cast through `unknown`
- Same function works for any data source (YAML file, API, fixture)

**Cons**
- Caller must explicitly load + pass criteria (1 extra line per call site)
- YAML parsing moves from import-time to call-time (negligible perf impact)

## Acceptance criteria

- [ ] `loadLabSelectionCriteria` exists with runtime validation
- [ ] `getLabSelectionCriteria` (if ported) delegates to it
- [ ] Test for malformed YAML throws
- [ ] Test for missing required fields throws
