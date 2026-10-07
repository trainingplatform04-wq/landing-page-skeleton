import { expect, test } from '@playwright/test'

// German at `/…`, English at `/en/…`, every URL translated. Assertions read the
// server-rendered HTML, so hreflang must be right before the browser takes over.
test.describe('Internationalization & SEO', () => {
  test('serves German at the root with complete alternate links', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
      'href',
      /\/en$/,
    )
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('links an offer to its translation at its own slug', async ({ page }) => {
    await page.goto('/angebote/personal-training')

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/angebote\/personal-training$/,
    )
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
      'href',
      /\/en\/offers\/personal-coaching$/,
    )
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en/offers/personal-coaching',
    )
  })

  test('switches language to the translated URL of the same page and back', async ({ page }) => {
    await page.goto('/angebote/personal-training')
    await page.getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en\/offers\/personal-coaching$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    // The layout stays mounted across the switch: its menu must follow the language.
    const nav = page.getByRole('navigation', { name: 'Main navigation' }).first()
    await expect(nav.getByRole('link', { name: 'Offers' })).toHaveAttribute('href', '/en/offers')

    await page.getByRole('link', { name: 'Deutsch' }).click()
    await expect(page).toHaveURL(/\/angebote\/personal-training$/)
  })

  test('never links an offer to a language it is not translated into', async ({ page }) => {
    await page.goto('/angebote/online-coaching')

    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveCount(0)
    const english = page.getByRole('link', { name: 'English' })
    await expect(english).toHaveAttribute('data-i18n-disabled')
    await expect(english).toHaveAttribute('aria-disabled', 'true')
    await expect(english).toHaveAttribute('tabindex', '-1')
  })

  test('never stores a language the offer is not translated into', async ({ page }) => {
    await page.goto('/angebote/online-coaching')
    await page.getByRole('link', { name: 'English' }).dispatchEvent('click')

    // A stored `en` would send this German browser from `/` to `/en`.
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
  })

  test('is a 404 when a slug is requested in the wrong language', async ({ page }) => {
    const response = await page.goto('/en/offers/personal-training')

    expect(response?.status()).toBe(404)
  })

  test('translates page paths and the menu', async ({ page }) => {
    await page.goto('/kontakt')

    await expect(page.locator('h1')).toHaveText('Kontakt')
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' }).first()
    await expect(nav.getByRole('link', { name: 'FAQ' })).toHaveAttribute('href', '/faq')

    await page.getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en\/contact$/)
    await expect(page.locator('h1')).toHaveText('Contact')
  })
})
