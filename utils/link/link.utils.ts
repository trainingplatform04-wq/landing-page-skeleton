import { ROUTE_PATHS } from '~/constants/routes.constants'

/** `localePath` from @nuxtjs/i18n, passed in so these stay plain functions. */
export type LocalePath = (route: string | { name: string; params: { slug: string } }) => string

/** A link as the editor picked it in the Studio. */
interface LinkInput {
  kind?: 'route' | 'reference' | 'external' | null
  route?: string | null
  href?: string | null
  offerSlug?: string | null
  offerLanguage?: string | null
}

const SAFE_EXTERNAL_HREF = /^(https:\/\/|mailto:|tel:)/

/**
 * The address of a link: a page of the site, an offer in the active language, or an
 * https/mailto/tel address. `null` when it can't be shown (unknown page, offer not
 * published in this language, unsafe address).
 */
export function resolveLink(
  link: LinkInput | null,
  { localePath, locale }: { localePath: LocalePath; locale: string },
): { to: string; external: boolean } | null {
  if (link?.kind === 'route') {
    if (!link.route || !(link.route in ROUTE_PATHS) || link.route.endsWith('-slug')) return null
    return { to: localePath(link.route), external: false }
  }

  if (link?.kind === 'reference') {
    if (!link.offerSlug || link.offerLanguage !== locale) return null
    return {
      to: localePath({ name: 'offers-slug', params: { slug: link.offerSlug } }),
      external: false,
    }
  }

  if (link?.kind === 'external' && link.href && SAFE_EXTERNAL_HREF.test(link.href)) {
    return { to: link.href, external: true }
  }

  return null
}

/** A dialable `tel:` link: `+49 (0)30 123-45` → `tel:+493012345`. */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\(0\)/g, '').replace(/[^\d+]/g, '')}`
}
