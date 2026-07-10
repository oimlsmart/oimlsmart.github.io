# 26 — Audit: structural Lab type instead of importing TestLaboratory

**Status:** implemented in this PR (was an audit finding)
**Type:** architectural improvement
**Where:** `src/lib/lab-selection.service.ts`

## Finding

The original `smart/browser/src/services/lab-selection.service.ts` imports the full
`TestLaboratory` type, which has 20+ optional fields (accreditation, contact info,
IA endorsement, etc.). The service only reads `lab.capabilities`.

This couples the service to the persistence layer and forces the test fixtures to
construct deep objects just to satisfy the type.

## What I did

Introduced a structural `Lab` type local to the service:

```ts
export interface Lab {
  capabilities?: string[]
  [key: string]: unknown
}
```

`rankLabs<L extends Lab>()` is now generic on the input — the caller passes
whatever lab type they have (TestLaboratory, a test fixture, a partial). The
service uses only what it actually needs.

## Trade-offs

**Pros**
- Service is decoupled from the persistence layer
- Tests can use minimal fixtures
- Easier to understand what the service actually depends on
- Forward-compatible: if TestLaboratory shape changes, this service is unaffected

**Cons**
- The structural type loses some compile-time safety (a typo'd field name doesn't error)
- `filterTestLaboratories<L extends Lab & { kind?: string }>` is slightly more verbose

## Pattern for future migrations

When porting other services from smart/browser, apply the same pattern:
1. Identify what the service actually reads from each input
2. Define a local structural type with ONLY those fields
3. Make the function generic `<L extends StructuralType>`
4. Test fixtures use the structural type
