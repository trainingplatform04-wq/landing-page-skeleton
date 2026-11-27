import { expect, test } from '@playwright/test'

// Built from the test CMS when building for production (pnpm build:e2e): the dev
// server never reads the CMS for the sitemap.
test.describe('Sitemap', () => {
  test.skip(!process.env.CI, 'The sitemap is built from the CMS at build time: run with CI=1')

  test('lists published pages with their translated alternates', async ({ request }) => {
    const german = await (await request.get('/__sitemap__/de-DE.xml')).text()

    expect(german).toMatch(/<loc>[^<]*\/<\/loc>/)
    expect(german).toMatch(/<loc>[^<]*\/kontakt<\/loc>/)
    expect(german).toMatch(
      /<loc>[^<]*\/ueber-uns<\/loc>[\s\S]*?hreflang="en-US" href="[^"]*\/en\/about"/,
    )
  })

  test('never lists a language a page is not published in', async ({ request }) => {
    const english = await (await request.get('/__sitemap__/en-US.xml')).text()

    expect(english).toMatch(/<loc>[^<]*\/en\/about<\/loc>/)
    expect(english).not.toContain('/en/faq')
  })
})
