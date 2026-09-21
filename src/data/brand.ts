/**
 * The www brand config — the identity values the site injects into the
 * house shell's header, mobile overlay, and footer (one brand object
 * passed to every Base mount, TODO.public track 02). They were the
 * package's baked defaults until 0.2.0 moved them out; the sign-in
 * target is the federation's identity service, exactly what the layout
 * passed before the injection contract existed. The shape is the
 * package's BrandConfig (@oimlsmart/site-shell/config).
 */
import type { BrandConfig } from '@oimlsmart/site-shell/config'
import { SITE } from './site-meta'

export const BRAND: BrandConfig = {
  brandName: SITE.title,
  logoLight: `${SITE.url}/smart-logo-light.svg`,
  logoDark: `${SITE.url}/smart-logo-dark.svg`,
  homeHref: `${SITE.url}/`,
  signInHref: 'https://id.oimlsmart.org/',
  themeColor: '#004996',
}
