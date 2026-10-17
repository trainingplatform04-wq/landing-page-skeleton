import { expect, test } from '@playwright/test'

import { DEFAULT_LOCALE, LOCALES } from '../../constants/i18n.constants'
import { ROUTE_PATHS } from '../../constants/routes.constants'

// Runs against the local production build in CI and against every deployment
// (PLAYWRIGHT_BASE_URL). It must prove that *our app* answered: an auth wall,
// an SSO redirect or a platform error page also returns 200 without console errors.
// Every page without a slug, in every language: it renders (empty while unpublished) whatever
// the CMS holds. Slugs belong to editors, so those pages are not listed.
const ROUTES = Object.values(ROUTE_PATHS)
  .filter((paths) => !Object.values(paths).some((path) => path.includes('[slug]')))
  .flatMap((paths) =>
    LOCALES.map(({ code }) => {
      if (code === DEFAULT_LOCALE) return paths[code]
      return paths[code] === '/' ? `/${code}` : `/${code}${paths[code]}`
    }),
  )

test.describe('Smoke', () => {
  for (const route of ROUTES) {
    test(`${route} serves the app without errors, warnings or hydration mismatches`, async ({
      page,
      baseURL,
    }) => {
      const errors: string[] = []

      page.on('console', (msg) => {
        const text = msg.text()
        if (msg.type() === 'error' || text.includes('[Vue warn]') || text.includes('Hydration')) {
          errors.push(`[${msg.type().toUpperCase()}] ${text}`)
        }
      })
      page.on('response', (response) => {
        if (response.status() >= 500)
          errors.push(`[NETWORK] ${response.status()} ${response.url()}`)
      })

      const response = await page.goto(route)
      await page.waitForLoadState('load')

      // 1. Still on our host: no redirect to an auth wall / SSO / another origin.
      expect(new URL(page.url()).host).toBe(new URL(baseURL ?? '').host)
      // 2. The document itself succeeded.
      expect(response?.status()).toBe(200)
      // 3. It is our app that rendered, not a platform or error page.
      await expect(page.locator('html')).toHaveAttribute('lang', /^(en-US|de-DE)$/)
      await expect(page.locator('header nav[aria-label]').first()).toBeVisible()
      await expect(page.locator('[data-slot="statusCode"]')).toHaveCount(0)

      expect(errors).toEqual([])
    })
  }
})
