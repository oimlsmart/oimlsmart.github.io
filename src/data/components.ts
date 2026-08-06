/**
 * The component registry lives in @oimlsmart/site-shell (the ONE
 * definition of the OIML SMART components — the index's grid and every
 * site's Components dropdown read the same list). This file re-exports
 * it so the front door's local import paths stay stable. Never a second
 * copy: the 2026-08 vocab-logo drift (the shell gained the slot, this
 * copy did not) is why the copy was removed.
 */
export { COMPONENTS } from '@oimlsmart/site-shell/data/components.ts'
export type { SmartComponent } from '@oimlsmart/site-shell/data/components.ts'
