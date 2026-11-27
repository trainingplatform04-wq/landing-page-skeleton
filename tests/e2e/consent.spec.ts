import { expect, type Page, test } from '@playwright/test'

// The legal guarantees of the consent window (GDPR, TDDDG §25), checked in a browser that has
// never answered it. Google Tag Manager is stubbed: nothing ever reaches Google. The test CMS
// runs with the fake container GTM-E2ETEST (tests/e2e/sanity/fixtureCms.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const GOOGLE = /googletagmanager\.com|google-analytics\.com|\/gtm\.js/

/** Records every request to Google, and stubs GTM with an empty script. */
async function watchThirdParties(page: Page) {
  const requests: string[] = []
  page.on('request', (request) => {
    if (GOOGLE.test(request.url())) requests.push(request.url())
  })
  await page.route(GOOGLE, (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '/* GTM stub */' }),
  )
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

  test('stores a colour scheme only once the visitor picks one, for a year', async ({ page }) => {
    const colorCookie = async () =>
      (await page.context().cookies()).find(({ name }) => name === 'color-mode')
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle ablehnen' }).click()
    await page.waitForTimeout(500)
    expect(await colorCookie()).toBeUndefined()

    await page.getByRole('button', { name: /Zum (dunklen|hellen) Modus wechseln/ }).click()

    await expect.poll(async () => (await colorCookie())?.value).toMatch(/^(dark|light)$/)
    const yearFromNow = Date.now() / 1000 + 360 * 24 * 60 * 60
    expect((await colorCookie())?.expires).toBeGreaterThan(yearFromNow)
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
      // A direct visit: a tracked link is activated before the visitor has answered. The window
      // covers the page, so the click is dispatched on the link itself, and not followed (a
      // static link would reload the page and forget the event).
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      await page.evaluate(() =>
        document.addEventListener('click', (click) => click.preventDefault(), { capture: true }),
      )
      await page.getByRole('link', { name: 'Mehr über mich' }).first().dispatchEvent('click')
      await page.getByRole('button', { name: button }).click()
      await page.waitForTimeout(1000)
      const layer: Array<Record<string, unknown>> = await dataLayer(page)
      await context.close()
      return layer
    }

    const accepted = await answer('Alle akzeptieren')
    const gtmAt = accepted.findIndex((entry) => entry.event === 'gtm.js')
    const clickAt = accepted.findIndex((entry) => entry.event === 'cta_click')
    expect(gtmAt).toBeGreaterThanOrEqual(0)
    expect(clickAt).toBeGreaterThan(gtmAt)
    expect(accepted[clickAt]).toMatchObject({ label: 'Mehr über mich' })

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
    await page.goto('/ueber-uns')
    await page.goto('/faq')
    await page.waitForTimeout(500)
    expect(requests).toEqual([])
  })

  test('the privacy page lists every cookie of the inventory', async ({ page }) => {
    await page.goto('/datenschutz')
    await page.getByRole('button', { name: 'Alle ablehnen' }).click()

    const table = page.getByRole('table')
    for (const name of ['cc_cookie', 'color-mode', '_ga', '_ga_*', 'VISITOR_INFO1_LIVE', 'YSC'])
      await expect(table.getByText(name, { exact: true })).toBeVisible()
  })
})
