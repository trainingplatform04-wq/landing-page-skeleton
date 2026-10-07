import { expect, test } from '@playwright/test'

// Runs against the local production build in CI and against every deployment
// (PLAYWRIGHT_BASE_URL). It must prove that *our app* answered: an auth wall,
// an SSO redirect or a platform error page also returns 200 without console errors.
// Every page of the site: it renders (empty while unpublished) whatever the CMS holds.
// Offer URLs belong to editors, so they are not listed.
const ROUTES = [
  '/',
  '/en',
  '/angebote',
  '/en/offers',
  '/faq',
  '/en/faq',
  '/kontakt',
  '/en/contact',
  '/impressum',
  '/en/imprint',
  '/datenschutz',
  '/en/privacy',
]

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
