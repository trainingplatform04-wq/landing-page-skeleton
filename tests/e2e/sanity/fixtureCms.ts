/** Where the fixture CMS (server.ts) listens, and the env that points the web app at it. */
export const SANITY_MOCK_PORT = 3999

export const SANITY_MOCK_URL = `http://127.0.0.1:${SANITY_MOCK_PORT}`

export const FIXTURE_CMS_ENV = {
  NUXT_PUBLIC_SANITY_API_HOST: SANITY_MOCK_URL,
  NUXT_PUBLIC_SANITY_USE_PROJECT_HOSTNAME: 'false',
  // The form service stand-in (server.ts); also allowed by the CSP of the E2E build.
  NUXT_PUBLIC_CONTACT_FORM_ACTION: `${SANITY_MOCK_URL}/form`,
}
