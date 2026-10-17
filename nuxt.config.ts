import { DEFAULT_LOCALE, LOCALES } from './constants/i18n.constants'
import { ROUTE_PATHS } from './constants/routes.constants'
import {
  SANITY_API_HOST,
  SANITY_API_VERSION,
  SANITY_PERSPECTIVE,
} from './constants/sanity.constants'

/** A deployable build is impossible without these. Contract: docs/deployment/DEPLOYMENT.md */
const REQUIRED_BUILD_ENV = [
  'NUXT_PUBLIC_SANITY_PROJECT_ID',
  'NUXT_PUBLIC_SANITY_DATASET',
  'NUXT_PUBLIC_SITE_URL',
  'NUXT_SITE_ENV',
] as const

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/robots',
    '@nuxtjs/sanity',
    // Before @nuxtjs/sitemap: it fills the sitemap from Sanity when building.
    '~/modules/sitemap',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
    '@nuxt/scripts',
  ],

  // Flat project layout (components/, pages/, … at the root) instead of Nuxt 4's app/ directory.
  srcDir: '.',

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // Site identity used by SEO, robots and sitemap (nuxt-site-config).
  // Overridden at runtime by NUXT_PUBLIC_SITE_URL, NUXT_PUBLIC_SITE_NAME and
  // NUXT_SITE_ENV. Only NUXT_SITE_ENV=production is indexable by search engines.
  site: {
    name: 'Landing Page',
  },

  colorMode: {
    // One storage for the site's preferences: a cookie, like the consent. It holds `system` (follow
    // the device) until the visitor uses the header switch; the module's head script applies it
    // before the first paint.
    storage: 'cookie',
    storageKey: 'color-mode',
  },

  icon: {
    // Icons come only from the bundle: never a runtime request to api.iconify.design (privacy).
    fallbackToApi: false,
  },

  runtimeConfig: {
    public: {
      // URL of the EU form service the contact form posts to (NUXT_PUBLIC_CONTACT_FORM_ACTION).
      // Empty: the contact page offers an email link instead of the form.
      contactFormAction: '',
      // Google Tag Manager container of this environment (NUXT_PUBLIC_GTM_ID). Empty: no
      // statistics at all, and the consent window does not offer them (docs/analytics/GTM.md).
      gtmId: '',
      // Defaults only, overridden by NUXT_PUBLIC_SANITY_PROJECT_ID / _DATASET.
      sanity: {
        projectId: '',
        dataset: '',
        // Only the E2E suite overrides these (its fixture CMS). Never set them in deployments.
        apiHost: SANITY_API_HOST,
        useProjectHostname: true,
      },
    },
  },

  routeRules: {
    '/**': {
      headers: {
        // No script-src: Nuxt inlines its payload. The contact form sends in the background,
        // so no form ever posts to another site.
        'Content-Security-Policy': [
          "form-action 'self'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "object-src 'none'",
        ].join('; '),
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    },
  },

  features: {
    // The stylesheet is inlined in each page's HTML: no separate request blocks the first paint.
    inlineStyles: true,
  },

  experimental: {
    // Links prefetch the next page when hovered or touched, not when visible: a phone doesn't
    // download every linked page's code while the current one loads.
    defaults: { nuxtLink: { prefetchOn: { interaction: true, visibility: false } } },
  },

  // Built assets ship pre-compressed (brotli, gzip): the Node server (E2E) then
  // serves the same transfer sizes as Vercel, which compresses on its own.
  nitro: { compressPublicAssets: true },

  compatibilityDate: '2026-09-01',

  typescript: {
    // The Studio is its own workspace with its own tsconfig (`pnpm typecheck` runs both).
    tsConfig: { exclude: ['../studio'] },
    // Files imported by this config use type-only `~/` imports (erased at runtime).
    nodeTsConfig: { exclude: ['../studio'], compilerOptions: { paths: { '~/*': ['../*'] } } },
  },

  hooks: {
    // Preload only the entry chunk (it imports the rest): preloading every chunk puts dozens of
    // requests ahead of the first paint on phones.
    'build:manifest'(manifest) {
      for (const chunk of Object.values(manifest)) {
        if (!chunk.isEntry) chunk.preload = false
      }
    },
    // Fail fast (dev server and production build alike): never run bound to a
    // missing project or silently fall back to the wrong dataset.
    'nitro:build:before'() {
      const missing = REQUIRED_BUILD_ENV.filter((name) => !process.env[name])
      if (!missing.length) return
      throw new Error(
        `Missing required env: ${missing.join(', ')}. See docs/deployment/DEPLOYMENT.md`,
      )
    },
  },

  i18n: {
    locales: LOCALES.map(({ code, language, name }) => ({
      code,
      language,
      name,
      file: `${code}.json`,
    })),
    defaultLocale: DEFAULT_LOCALE,
    // German at `/…`, English at `/en/…`, every path translated (constants/routes.constants.ts).
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    pages: ROUTE_PATHS,
    // No redirect by browser language: `/` is German, `/en` English, the switcher in the header
    // (one URL per language, as Google recommends; no extra round trip before the home page).
    detectBrowserLanguage: false,
    // Absolute URLs for canonical and hreflang links.
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    // @nuxtjs/i18n writes `lang`, canonical, hreflang and og:locale, and leaves out a language
    // an offer or article isn't translated into (`useSetI18nParams`).
    // The magazine's filter and page are part of its canonical URL: each view is its own page.
    experimental: { strictSeo: { canonicalQueries: ['page', 'category'] } },
  },

  sitemap: {
    // Only published pages, offers and articles (modules/sitemap.ts), with their translations.
    excludeAppSources: true,
  },

  image: {
    // Vercel Image Optimization in deployments (our deploy builds with NITRO_PRESET=vercel
    // inside GitHub Actions, where auto-detection would see "GitHub" and pick IPX,
    // which breaks remote URLs on Vercel). IPX locally and in E2E (node-server).
    provider: process.env.NITRO_PRESET === 'vercel' ? 'vercel' : 'ipx',
    domains: ['cdn.sanity.io'],
    quality: 80,
  },

  sanity: {
    apiVersion: SANITY_API_VERSION,
    perspective: SANITY_PERSPECTIVE,
    useCdn: true,
  },
})
