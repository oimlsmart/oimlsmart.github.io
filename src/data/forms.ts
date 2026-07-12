export const FORM_IDS = {
  LOAD_CELL_ERRORS: 'load-cell-errors',
  REPEATABILITY: 'repeatability',
  HUMIDITY_CH: 'humidity-ch',
} as const

export const DEFAULT_DISPATCH_FORMS: readonly string[] = [
  FORM_IDS.LOAD_CELL_ERRORS,
  FORM_IDS.REPEATABILITY,
  FORM_IDS.HUMIDITY_CH,
] as const
