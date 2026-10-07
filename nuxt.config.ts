import { DEFAULT_LOCALE, LOCALES } from './constants/i18n.constants'
import { ROUTE_PATHS } from './constants/routes.constants'
import { SANITY_API_VERSION } from './constants/sanity.constants'

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
    // Before @nuxtjs/sitemap: it gives the sitemap the published pages and offers.
    '~/modules/sitemap',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
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

  runtimeConfig: {
    public: {
      // URL of the EU form service the contact form posts to (NUXT_PUBLIC_CONTACT_FORM_ACTION).
      // Empty: the contact page offers an email link instead of the form.
      contactFormAction: '',
      // Defaults only, overridden by NUXT_PUBLIC_SANITY_PROJECT_ID / _DATASET.
      sanity: {
        projectId: '',
        dataset: '',
        // The real Sanity API. Only the E2E suite overrides these, to read fixture
        // content from a local GROQ server (playwright.config.ts). Never set them in deployments.
        apiHost: 'https://api.sanity.io',
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

  compatibilityDate: '2026-09-01',

  typescript: {
    // The Studio is its own workspace with its own tsconfig (`npm run typecheck` runs both).
    tsConfig: { exclude: ['../studio'] },
    // Files imported by this config use type-only `~/` imports (erased at runtime).
    nodeTsConfig: { exclude: ['../studio'], compilerOptions: { paths: { '~/*': ['../*'] } } },
  },

  hooks: {
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
    // German at `/…`, English at `/en/…`, every URL translated: page paths are declared
    // once in constants/routes.constants.ts; offers own their last segment.
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    pages: ROUTE_PATHS,
    // Visiting `/` redirects once to the browser language (e.g. `/en`); the choice is
    // remembered in the `i18n_redirected` cookie so the switcher always wins.
    // Deep links are never redirected.
    detectBrowserLanguage: {
      redirectOn: 'root',
    },
    // Absolute URLs for canonical and hreflang links.
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    // @nuxtjs/i18n writes `lang`, canonical, hreflang and og:locale itself, and leaves out
    // a language an offer has no translation in (set by `useSetI18nParams`).
    experimental: { strictSeo: true },
  },

  sitemap: {
    // Only published pages and offers (modules/sitemap.ts), with their language versions.
    excludeAppSources: true,
  },

  image: {
    // Vercel Image Optimization in deployments (our deploy builds with NITRO_PRESET=vercel
    // inside GitHub Actions, where auto-detection would see "GitHub" and pick IPX,
    // which breaks remote URLs on Vercel). IPX locally and in E2E (node-server).
    provider: process.env.NITRO_PRESET === 'vercel' ? 'vercel' : 'ipx',
    domains: ['cdn.sanity.io'],
    format: ['avif', 'webp'],
    quality: 80,
  },

  sanity: {
    apiVersion: SANITY_API_VERSION,
    // Public site, no token: read published content only ('raw' includes drafts → 403).
    perspective: 'published',
    useCdn: true,
  },
})
