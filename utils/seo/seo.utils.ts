import type { BusinessData } from '~/utils/groqd/groqd.utils'

/** The business as structured data (`LocalBusiness`), for nuxt-schema-org. */
export function toLocalBusiness(business: BusinessData, url: string) {
  return {
    name: business.name,
    url,
    email: business.email,
    telephone: business.phone ?? undefined,
    address: business.address
      ? {
          streetAddress: business.address.street ?? undefined,
          postalCode: business.address.postalCode ?? undefined,
          addressLocality: business.address.city ?? undefined,
          addressCountry: business.address.country ?? undefined,
        }
      : undefined,
    sameAs: (business.socials ?? []).map((social) => social.url),
  }
}
