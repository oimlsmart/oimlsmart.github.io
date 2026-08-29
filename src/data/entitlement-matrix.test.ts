import { describe, it, expect } from 'vitest'
import {
  ENTITLEMENT_MATRIX,
  MEMBER_CATEGORIES,
  SOFTWARE_REPOS,
  UPSELL_NARRATIVES,
} from './entitlement-matrix'

describe('entitlement matrix (TODO.promotion/09)', () => {
  it('every service row covers every member category exactly once', () => {
    for (const s of ENTITLEMENT_MATRIX) {
      for (const c of MEMBER_CATEGORIES) {
        expect(s.cells[c.id], `${s.id} missing cell for ${c.id}`).toBeDefined()
      }
      expect(Object.keys(s.cells).sort()).toEqual(
        MEMBER_CATEGORIES.map((c) => c.id).sort(),
      )
    }
  })

  it('the member taxonomy is the corrected model, in order', () => {
    expect(MEMBER_CATEGORIES.map((c) => c.id)).toEqual([
      'member-state',
      'corresponding-member',
      'ia-tl',
      'utilizer-associate',
      'applicant-public',
    ])
  })

  it('proposed cells are only the SST row’s two extrapolations', () => {
    const proposed = ENTITLEMENT_MATRIX.flatMap((s) =>
      MEMBER_CATEGORIES.filter((c) => s.cells[c.id].proposed).map(
        (c) => `${s.id}/${c.id}`,
      ),
    )
    expect(proposed).toEqual([
      'sst-simulation/member-state',
      'sst-simulation/corresponding-member',
    ])
  })

  it('every member category uses the hosted OIML-CS SMART Platform', () => {
    const row = ENTITLEMENT_MATRIX.find((s) => s.id === 'cs-smart-platform')!
    for (const c of MEMBER_CATEGORIES) {
      expect(row.cells[c.id].marks).toContain('use')
    }
  })

  it('the SMART Platform self-host entitlement attaches to the Member State only', () => {
    const row = ENTITLEMENT_MATRIX.find((s) => s.id === 'smart-platform-software')!
    expect(row.cells['member-state'].marks).toEqual(['self-host', 'streaming'])
    expect(row.cells['corresponding-member'].marks).toEqual(['upsell'])
    for (const c of ['ia-tl', 'utilizer-associate', 'applicant-public'] as const) {
      expect(row.cells[c].marks).not.toContain('self-host')
    }
  })

  it('the three upsell narratives are present', () => {
    expect(UPSELL_NARRATIVES.map((n) => n.id)).toEqual([
      'cm-to-ms',
      'body-to-ms',
      'utilizer-associate',
    ])
  })

  it('the software-availability block never claims an absent license', () => {
    for (const r of SOFTWARE_REPOS) {
      expect(r.license).not.toMatch(/^open source$/)
      // Private repos are cited, never linked (lychee would 404 them).
      if (r.visibility === 'private') expect(r.href).toBeUndefined()
    }
  })
})
