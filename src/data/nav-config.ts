/**
 * The nav definition lives in @oimlsmart/site-shell (the ONE definition
 * of the federation header's dropdowns and standalone links — every
 * site's header renders the shell's copy). This file re-exports it so
 * the front door's contract tests read the same list the header
 * renders. Never a second copy: the components-registry drift of
 * 2026-08 (the vocab logo) showed the hand-synced copy's failure mode.
 */
export {
  NAV_DROPDOWNS,
  NAV_ITEMS,
  NAV_STANDALONE,
  isLinkActive,
  isDropdownActive,
} from '@oimlsmart/site-shell/data/nav-config.ts'
export type {
  NavBadge,
  NavLink,
  NavDropdownConfig,
  NavStandaloneLink,
  NavItem,
} from '@oimlsmart/site-shell/data/nav-config.ts'
