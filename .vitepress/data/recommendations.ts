/**
 * Catalogue of OIML Recommendations modelled in the SMART pilot.
 *
 * Adding a new Recommendation: append one entry. The home page,
 * Recommendations index, and any other consumer picks it up
 * automatically.
 */

import type { Recommendation } from '../types'

function recHref(number: string): string {
  return `/recommendations/${number.toLowerCase().replace(/\s+/g, '')}.html`
}

export const recommendations: readonly Recommendation[] = [
  {
    number: 'R 60',
    title: 'Load Cells',
    scope:
      'Metrological regulation for load cells used in nonautomatic weighing instruments. The pilot SMART Recommendation.',
    year: '2021',
    status: 'modelled',
    stats: { requirements: 42, tests: 18, forms: 12 },
    href: recHref('R 60'),
  },
  {
    number: 'R 129',
    title: 'Mass Road Vehicles',
    scope:
      'Dynamic measuring instruments for the determination of mass of road vehicles in motion.',
    year: '2000',
    status: 'modelled',
    stats: { requirements: 35, tests: 14, forms: 9 },
    href: recHref('R 129'),
  },
  {
    number: 'R 144',
    title: 'Gas Meters',
    scope:
      'Gas meters — diaphragm gas meters deployed for custody transfer and billing.',
    year: '2006',
    status: 'modelled',
    stats: { requirements: 28, tests: 11, forms: 8 },
    href: recHref('R 144'),
  },
] as const

/** Find a Recommendation by its number (e.g. "R 60"). Returns undefined if missing. */
export function findRecommendation(number: string): Recommendation | undefined {
  return recommendations.find((r) => r.number === number)
}
