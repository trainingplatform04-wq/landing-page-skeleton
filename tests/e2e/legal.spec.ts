import { expect, test } from '@playwright/test'

// The test CMS has the imprint in German only, the privacy policy in both languages.
test.describe('Legal pages', () => {
  test('links both legal pages from the footer of every page', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')

    await expect(footer.getByRole('link', { name: 'Impressum' })).toHaveAttribute(
      'href',
      '/impressum',
    )
    await expect(footer.getByRole('link', { name: 'Datenschutz' })).toHaveAttribute(
      'href',
      '/datenschutz',
    )
  })

  test('links the legal pages in the language of the page', async ({ page }) => {
    await page.goto('/en')
    const footer = page.locator('footer')

    await expect(footer.getByRole('link', { name: 'Imprint' })).toHaveAttribute(
      'href',
      '/en/imprint',
    )
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/en/privacy',
    )
  })

  test('renders the imprint', async ({ page }) => {
    await page.goto('/impressum')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum')
    await expect(page.getByText('Angaben gemäß § 5 DDG')).toBeVisible()
  })
})
