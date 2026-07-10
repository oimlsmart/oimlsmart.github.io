# 25 — Audit: visual regression baseline via Chromatic or Playwright snapshots

**Status:** proposal
**Type:** test infrastructure
**Audit finding:** every visual change is verified by eye; no baseline to detect drift

## Finding

Current testing covers:
- Component behavior (vitest + vue-test-utils)
- Service correctness (vitest on pure functions)
- E2E (proposed in TODO.astro/23)

But none of this catches:
- "The hero spacing on the home page shifted by 4px"
- "Login button color is darker than spec"
- "Mobile layout breaks under 380px width"
- "Dark mode has unreadable text contrast"

These are visual regressions that humans catch (sometimes) during review.

## Proposal

Add a visual regression layer using one of:

### Option A: Chromatic (SaaS, paid for OSS at scale)

- Publishes storybook stories + snapshots to chromatic.com
- Detects visual diffs across browsers + viewports
- Free for OSS up to 5K snapshots/month
- Requires Storybook setup

### Option B: Playwright snapshot tests (recommended)

- Reuse the Playwright setup from TODO.astro/23
- Each E2E test takes a screenshot at key states
- Snapshot diffing with `expect(screenshot).toMatchSnapshot('name.png')`
- Stored in git, diffed on PR

### Option C: Percy / Similar SaaS

- Like Chromatic but for general screenshots, not Storybook
- Free tier limited

**Recommendation: Option B (Playwright snapshots).** Reuses existing infra, no SaaS dependency, snapshots live in the repo.

## What to snapshot

Priority pages:
1. `/` (home)
2. `/login/`
3. `/app/` (launcher)
4. `/recommendations/r60/`
5. `/library/r60/`
6. `/docs/`
7. `/blog/`

For each, capture:
- Desktop (1440×900)
- Mobile (375×667)
- Dark mode (1440×900)
- Light mode (1440×900)

8 pages × 4 viewports = 32 baseline snapshots. CI runs same config, diffs against baseline, fails PR if delta > threshold.

## Trade-offs

**Pros**
- Catches visual regressions before they ship
- Documents the visual spec implicitly (snapshots are the spec)
- PR review becomes: "is this delta intentional?"

**Cons**
- 32 PNGs in the repo (~few MB)
- False positives when fonts/animation timing differs
- Requires maintenance when intentional changes happen (update snapshots)

## Acceptance criteria

- [ ] Playwright snapshot tests added for the 7 priority pages
- [ ] 4 viewports/modes per page captured
- [ ] CI workflow runs snapshots; PRs fail on unreviewed diff
- [ ] Snapshot update is documented (one command for intentional changes)
