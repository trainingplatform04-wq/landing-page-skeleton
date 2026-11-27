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

  test('switches language to the translated URL of the same page and back', async ({ page }) => {
    await page.goto('/ueber-uns')
    await page.getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en\/about$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    // The layout stays mounted across the switch: its menu and footer must follow the language.
    const nav = page.getByRole('navigation', { name: 'Main navigation' }).first()
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about')
    const legal = page.getByRole('contentinfo').getByRole('navigation')
    await expect(legal.getByRole('link', { name: 'Imprint' })).toHaveAttribute(
      'href',
      '/en/imprint',
    )

    await page.getByRole('link', { name: 'Deutsch' }).click()
    await expect(page).toHaveURL(/\/ueber-uns$/)
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
