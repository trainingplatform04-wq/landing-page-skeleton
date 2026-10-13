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

const consentWindow = (page: Page) => page.locator('#cc-main .cm')
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
    const layer = JSON.stringify(await dataLayer(page))
    expect(layer).toContain('"ad_storage":"denied"')
    expect(layer).toContain('"ad_user_data":"denied"')
    expect(layer).toContain('"analytics_storage":"granted"')

    await clickWithoutLeaving(page, '[data-track="cta_click"]')
    await expect
      .poll(async () => JSON.stringify(await dataLayer(page)))
      .toContain('"event":"cta_click"')
  })

  test('"Cookie settings" in the footer lets the visitor withdraw', async ({ page }) => {
    await watchThirdParties(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await expect(consentWindow(page)).toBeHidden()

    await page
      .getByRole('contentinfo')
      .getByRole('button', { name: 'Cookie-Einstellungen' })
      .click()
    const settings = page.locator('#cc-main .pm')
    await expect(settings).toBeVisible()
    await settings.getByRole('button', { name: 'Alle ablehnen' }).click()
    await expect(settings).toBeHidden()

    await clickWithoutLeaving(page, '[data-track="cta_click"]')
    await page.waitForTimeout(500)
    expect(JSON.stringify(await dataLayer(page))).not.toContain('"event":"cta_click"')
    expect(await analyticsCookies(page)).toEqual([])
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
    for (const name of [
      'cc_cookie',
      'nuxt-color-mode',
      '_ga',
      '_ga_*',
      'VISITOR_INFO1_LIVE',
      'YSC',
    ])
      await expect(table.getByText(name, { exact: true })).toBeVisible()
  })
})
