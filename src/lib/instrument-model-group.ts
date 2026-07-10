// ─────────────────────────────────────────────────────────────────────
// Instrument Model Group — structural type + merit comparison.
//
// Migrated from smart/browser/src/data/types/instrument-model-group.ts.
// The original imported the generated InstrumentModelGroup type and a
// compareGroupMerit helper. Here both live in one file with a structural
// type capturing only what sample-selection actually reads.
// ─────────────────────────────────────────────────────────────────────

/**
 * Structural input — what sample-selection reads from a model group.
 * The full InstrumentModelGroup record (in smart/browser) has many more
 * fields (humidityClass, construction, manufacturer, etc.); these are
 * the only ones the selection algorithm needs.
 */
export interface InstrumentModelGroup {
  id: string
  groupLabel: string
  accuracyClass: 'A' | 'B' | 'C' | 'D'
  /** Maximum number of verification intervals. */
  n_LC: number
  /** Ratio of (Emax - Emin) to vmin. */
  Y: number
  /** Ratio of (Emax - Emin) to (2 × DR). */
  Z: number
}

/**
 * Compare two groups by metrological merit per R 60-2 §2.4 ranking:
 * higher accuracyClass > higher n_LC > higher Y.
 * Returns negative if a is "more severe" (better to test), positive
 * if b is, 0 if equal.
 *
 * Accuracy class ranking: A < B < C < D in severity (D is least accurate).
 * Note: original code treats A as rank 0, D as rank 3 — meaning A is
 * LEAST severe. The compare function is consistent with that.
 */
export function compareGroupMerit(a: InstrumentModelGroup, b: InstrumentModelGroup): number {
  const classRank: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
  const aRank = classRank[a.accuracyClass] ?? 99
  const bRank = classRank[b.accuracyClass] ?? 99
  if (aRank !== bRank) return aRank - bRank
  if (b.n_LC !== a.n_LC) return b.n_LC - a.n_LC
  return b.Y - a.Y
}
