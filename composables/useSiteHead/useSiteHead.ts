/**
 * Head tags shared by every page: the title template and Open Graph defaults. Call once,
 * from app.vue and error.vue. @nuxtjs/i18n adds `lang`, the canonical URL, the hreflang
 * links and og:locale itself (`strictSeo` in nuxt.config.ts).
 */
export function useSiteHead() {
  const site = useSiteConfig()

  useHead({ titleTemplate: (title) => (title ? `${title} · ${site.name}` : site.name) })
  useSeoMeta({ ogType: 'website', ogSiteName: site.name, twitterCard: 'summary_large_image' })
}
