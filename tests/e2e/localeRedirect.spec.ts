import { expect, test } from '@playwright/test'

// nuxt.config.ts → i18n.detectBrowserLanguage: false. One URL per language, never a redirect.
test.describe('No redirect by browser language (English browser)', () => {
  test.use({ locale: 'en-US' })

  test('serves the German home page at the root', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.request().redirectedFrom()).toBeNull()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
  })

  test('reaches English through the language switcher', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  })
})
