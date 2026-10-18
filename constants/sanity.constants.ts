/** Pins GROQ semantics to a date (code-coupled, not an env var). Web app and Studio. */
export const SANITY_API_VERSION = '2026-09-01'

/** The real Sanity API; only the E2E suite points the site elsewhere (its fixture CMS). */
export const SANITY_API_HOST = 'https://api.sanity.io'

/** The public site reads published content only, with no token ('raw' would include drafts). */
export const SANITY_PERSPECTIVE = 'published'
