import { expect, test } from '@playwright/test'

// nuxt.config.ts → i18n.detectBrowserLanguage: redirect once on `/`, remember the choice.
test.describe('Browser language detection (English browser)', () => {
  test.use({ locale: 'en-US' })

  test('redirects the root to the browser language', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  })

  test('never redirects deep links', async ({ page }) => {
    await page.goto('/kontakt')

    await expect(page).toHaveURL(/\/kontakt$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
  })

  test('remembers a language chosen with the switcher over the browser language', async ({
    page,
  }) => {
    await page.goto('/en')
    await page.getByRole('link', { name: 'Deutsch' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.goto('/')

    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
  })
})
