import { createClient } from '@sanity/client'
import { makeSafeQueryRunner } from 'groqd'
import { defineNuxtModule } from 'nuxt/kit'
import { z } from 'zod'

// Relative imports: Nuxt loads this file before the `~/` alias exists.
import { DEFAULT_LOCALE, LOCALES } from '../constants/i18n.constants'
import { PAGE_TYPES, ROUTE_PATHS, type RouteName } from '../constants/routes.constants'
import {
  SANITY_API_HOST,
  SANITY_API_VERSION,
  SANITY_PERSPECTIVE,
} from '../constants/sanity.constants'
import { q } from '../utils/groqd/groqd.utils'

interface SitemapEntry {
  loc: string
  lastmod: string
  alternatives: Array<{ hreflang: string; href: string }>
}

/** Published pages, each with the languages it exists in. */
const sitemapQuery = q.project((root) => ({
  pages: root.star
    .filterByType(...Object.values(PAGE_TYPES))
    .filterRaw('defined(language) && seo.noIndex != true')
    .project({
      type: ['_type', z.string()],
      language: z.string().nullable(),
      updatedAt: ['_updatedAt', z.string()],
    }),
}))

const ROUTE_OF_PAGE_TYPE = Object.fromEntries(
  Object.entries(PAGE_TYPES).map(([route, type]) => [type, route as RouteName]),
)

/** `/kontakt`, `/en/contact`: the path of a route in a language. */
function pathOf(route: RouteName, language: string) {
  const path = ROUTE_PATHS[route][language as keyof (typeof ROUTE_PATHS)[RouteName]]
  if (language === DEFAULT_LOCALE) return path
  return path === '/' ? `/${language}` : `/${language}${path}`
}

/** hreflang links for the languages a page exists in, plus `x-default` (German). */
function alternativesOf(versions: Array<{ language: string; path: string }>) {
  const links = versions.flatMap(({ language, path }) => {
    const locale = LOCALES.find(({ code }) => code === language)
    return locale ? [{ hreflang: locale.language, href: path }] : []
  })
  const fallback = versions.find(({ language }) => language === DEFAULT_LOCALE)
  return fallback ? [...links, { hreflang: 'x-default', href: fallback.path }] : links
}

async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  const client = createClient({
    projectId: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NUXT_PUBLIC_SANITY_DATASET,
    apiHost: process.env.NUXT_PUBLIC_SANITY_API_HOST || SANITY_API_HOST,
    useProjectHostname: process.env.NUXT_PUBLIC_SANITY_USE_PROJECT_HOSTNAME !== 'false',
    apiVersion: SANITY_API_VERSION,
    perspective: SANITY_PERSPECTIVE,
    // At build time: the freshest content, not the CDN's cache.
    useCdn: false,
  })
  const runQuery = makeSafeQueryRunner((query, { parameters }) => client.fetch(query, parameters))
  const { pages } = await runQuery(sitemapQuery)

  const published = pages.flatMap(({ type, language, updatedAt }) => {
    const route = ROUTE_OF_PAGE_TYPE[type]
    return route && language ? [{ route, language, updatedAt }] : []
  })
  return published.map(({ route, language, updatedAt }) => {
    const versions = published
      .filter((page) => page.route === route)
      .map((page) => ({ language: page.language, path: pathOf(route, page.language) }))
    return {
      loc: pathOf(route, language),
      lastmod: updatedAt,
      alternatives: alternativesOf(versions),
    }
  })
}

/**
 * Reads the published pages from Sanity when building for production, so
 * the sitemap lists them with their language versions. Its own client: a module runs before the
 * app exists, so `useCmsQuery` is not available. A CMS error fails the build instead of shipping
 * an empty sitemap. Never runs in dev, `nuxt prepare` or tests.
 */
export default defineNuxtModule({
  meta: { name: 'cms-sitemap' },
  setup(_options, nuxt) {
    let entries: SitemapEntry[] = []
    if (nuxt.options.sitemap) nuxt.options.sitemap.urls = () => entries

    nuxt.hook('nitro:config', async () => {
      if (nuxt.options.dev || nuxt.options._prepare || nuxt.options.test) return
      entries = await fetchSitemapEntries()
    })
  },
})
