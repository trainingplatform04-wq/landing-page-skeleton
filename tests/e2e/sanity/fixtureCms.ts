/** Where the fixture CMS (server.ts) listens, and the env that points the web app at it. */
export const SANITY_MOCK_PORT = 3999

export const SANITY_MOCK_URL = `http://127.0.0.1:${SANITY_MOCK_PORT}`

export const FIXTURE_CMS_ENV = {
  NUXT_PUBLIC_SANITY_API_HOST: SANITY_MOCK_URL,
  NUXT_PUBLIC_SANITY_USE_PROJECT_HOSTNAME: 'false',
  // The EmailJS stand-in (server.ts): fake ids, nothing reaches EmailJS.
  NUXT_PUBLIC_EMAILJS_SERVICE_ID: 'service_e2e',
  NUXT_PUBLIC_EMAILJS_TEMPLATE_ID: 'template_e2e',
  NUXT_PUBLIC_EMAILJS_PUBLIC_KEY: 'key_e2e',
  NUXT_PUBLIC_EMAILJS_API_HOST: SANITY_MOCK_URL,
  // A fake container: the consent tests stub googletagmanager.com, nothing reaches Google.
  NUXT_PUBLIC_GTM_ID: 'GTM-E2ETEST',
}
