import { expect, type Page, test } from '@playwright/test'

// The legal guarantees of the consent window (GDPR, TDDDG §25), checked in a browser that has
// never answered it. Google Tag Manager is stubbed: nothing ever reaches Google. The test CMS
// runs with the fake container GTM-E2ETEST (tests/e2e/sanity/fixtureCms.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const GOOGLE = /googletagmanager\.com|google-analytics\.com|\/gtm\.js/
const YOUTUBE = /youtube(-nocookie)?\.com/

/** Records every request to Google or YouTube, and stubs GTM with an empty script. */
async function watchThirdParties(page: Page) {
  const requests: string[] = []
  page.on('request', (request) => {
    if (GOOGLE.test(request.url()) || YOUTUBE.test(request.url())) requests.push(request.url())
  })
  await page.route(GOOGLE, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '/* GTM stub */' }),
  )
  await page.route(YOUTUBE, (route) => route.fulfill({ contentType: 'text/html', body: '' }))
  return requests
}

/** Clicks a link without following it: the page (and its dataLayer) stays to be read. */
async function clickWithoutLeaving(page: Page, selector: string) {
  await page.evaluate(() =>
    document.addEventListener('click', (click) => click.preventDefault(), { capture: true }),
  )
  await page.locator(selector).first().click()
}

const consentWindow = (page: Page) => page.locator('#consent-banner')
const analyticsCookies = async (page: Page) =>
  (await page.context().cookies()).filter(({ name }) => name.startsWith('_ga'))
const dataLayer = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(JSON.stringify((window as { dataLayer?: unknown[] }).dataLayer ?? [])),
  )

test.describe('Consent', () => {
  test('asks first; nothing optional loads before an answer', async ({ page }) => {
    const requests = await watchThirdParties(page)
    await page.goto('/')

    await expect(consentWindow(page)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Datenschutz' }).first()).toBeVisible()
    await page.waitForTimeout(1000)
    expect(requests).toEqual([])
    expect(await analyticsCookies(page)).toEqual([])
  })

  test('an answer given before the JavaScript has loaded is kept and applied', async ({ page }) => {
    await watchThirdParties(page)
    let release: () => void = () => {}
    const loaded = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/_nuxt/**/*.js', async (route) => {
      await loaded
      await route.continue()
    })
    await page.goto('/', { waitUntil: 'commit' })

    await page.getByRole('button', { name: 'Alle ablehnen' }).click()
    release()

    await expect(consentWindow(page)).toBeHidden()
    const stored = (await page.context().cookies()).find(({ name }) => name === 'cc_cookie')
    expect(decodeURIComponent(stored?.value ?? '')).toContain('"categories":["necessary"]')
  })

  test('an event made before the answer is sent after "Accept all", never after "Reject all"', async ({
    browser,
  }) => {
    const answer = async (button: 'Alle akzeptieren' | 'Alle ablehnen') => {
      const context = await browser.newContext({ locale: 'de-DE' })
      const page = await context.newPage()
      await watchThirdParties(page)
      // A direct visit: the offer page sends offer_view before the visitor has answered.
      await page.goto('/angebote/personal-training')
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: button }).click()
      await page.waitForTimeout(1000)
      const layer: Array<Record<string, unknown>> = await dataLayer(page)
      await context.close()
      return layer
    }

    const accepted = await answer('Alle akzeptieren')
    const gtmAt = accepted.findIndex((entry) => entry.event === 'gtm.js')
    const offerAt = accepted.findIndex((entry) => entry.event === 'offer_view')
    expect(gtmAt).toBeGreaterThanOrEqual(0)
    expect(offerAt).toBeGreaterThan(gtmAt)
    expect(accepted[offerAt]).toMatchObject({ offer: 'personal-training' })

    expect(await answer('Alle ablehnen')).toEqual([])
  })

  test('"Reject all" is as easy as "Accept all": same size, side by side', async ({ page }) => {
    await page.goto('/')
    const accept = page.getByRole('button', { name: 'Alle akzeptieren' })
    const reject = page.getByRole('button', { name: 'Alle ablehnen' })
    await expect(reject).toBeVisible()

    const [a, r] = await Promise.all([accept.boundingBox(), reject.boundingBox()])
    expect(Math.round(a!.height)).toBe(Math.round(r!.height))
    expect(Math.abs(a!.width - r!.width)).toBeLessThan(4)
    expect(await accept.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await reject.evaluate((el) => getComputedStyle(el).backgroundColor),
    )
  })

  test('after "Reject all", nothing loads, also after reloading', async ({ page }) => {
    const requests = await watchThirdParties(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle ablehnen' }).click()
    await expect(consentWindow(page)).toBeHidden()

    await page.reload()
    await page.waitForTimeout(1000)
    await expect(consentWindow(page)).toBeHidden()
    expect(requests).toEqual([])
    expect(await analyticsCookies(page)).toEqual([])
  })

  test('after "Accept all", GTM loads with ads denied, and events are sent', async ({ page }) => {
    const requests = await watchThirdParties(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()

    await expect.poll(() => requests.some((url) => url.includes('GTM-E2ETEST'))).toBe(true)
    const entries: Array<Record<string, unknown>> = await dataLayer(page)
    const consentAt = entries.findIndex((entry) => entry[0] === 'consent' && entry[1] === 'default')
    const gtmAt = entries.findIndex((entry) => entry.event === 'gtm.js')
    // GTM's first event already sees the visitor's consent: its Google tag is never blocked.
    expect(consentAt).toBeGreaterThanOrEqual(0)
    expect(consentAt).toBeLessThan(gtmAt)
    expect(entries[consentAt]![2]).toMatchObject({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })

    await clickWithoutLeaving(page, '[data-track="cta_click"]')
    await expect
      .poll(async () => JSON.stringify(await dataLayer(page)))
      .toContain('"event":"cta_click"')
  })

  test('"Cookie settings" in the footer withdraws: cookies deleted, nothing from Google afterwards', async ({
    page,
  }) => {
    const requests = await watchThirdParties(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await expect(consentWindow(page)).toBeHidden()
    // What GA4 would have set after consent (the stub sets nothing): withdrawal must delete it.
    const { hostname } = new URL(page.url())
    await page.context().addCookies([
      { name: '_ga', value: 'GA1.1.1', domain: hostname, path: '/' },
      { name: '_ga_TEST', value: 'GS1.1.1', domain: hostname, path: '/' },
    ])

    await page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Cookie-Einstellungen' })
      .click()
    const settings = page.locator('#cc-main .pm')
    await expect(settings).toBeVisible()
    await Promise.all([
      page.waitForEvent('load'),
      settings.getByRole('button', { name: 'Alle ablehnen' }).click(),
    ])

    expect(await analyticsCookies(page)).toEqual([])
    requests.length = 0
    await page.goto('/angebote')
    await page.goto('/faq')
    await page.waitForTimeout(500)
    expect(requests).toEqual([])
  })

  test('external media: videos load directly once allowed, never before', async ({ page }) => {
    const requests = await watchThirdParties(page)
    await page.goto('/en/magazine/protein-without-powder')
    await expect(page.locator('iframe')).toHaveCount(0)
    expect(requests.filter((url) => YOUTUBE.test(url))).toEqual([])

    await page.getByRole('button', { name: 'Accept all' }).click()

    await expect(
      page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]'),
    ).toHaveCount(1)
  })

  test('the privacy page lists every cookie of the inventory', async ({ page }) => {
    await page.goto('/datenschutz')
    await page.getByRole('button', { name: 'Alle ablehnen' }).click()

    const table = page.getByRole('table')
    for (const name of ['cc_cookie', 'color-mode', '_ga', '_ga_*', 'VISITOR_INFO1_LIVE', 'YSC'])
      await expect(table.getByText(name, { exact: true })).toBeVisible()
  })
})
