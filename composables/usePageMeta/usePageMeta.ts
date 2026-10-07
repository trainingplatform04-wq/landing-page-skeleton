import type { Seo } from '~/types/content.types'

/** The page's title, description, share image and indexing rule in the `<head>`. */
export function usePageMeta(seo: Seo) {
  useSeoMeta({
    title: seo.title,
    ogTitle: seo.title,
    description: seo.description,
    ogDescription: seo.description,
    ogImage: seo.image,
    robots: seo.noIndex ? 'noindex, nofollow' : undefined,
  })
}
