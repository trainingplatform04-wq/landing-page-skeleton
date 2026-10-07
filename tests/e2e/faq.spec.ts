import { expect, test } from '@playwright/test'

// The FAQ page exists in German only (tests/e2e/sanity/fixtures.ts).
test.describe('FAQ page', () => {
  test('lists the questions of the active language', async ({ page }) => {
    await page.goto('/faq')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Häufige Fragen')
    await expect(page.getByText('Gibt es ein Probetraining?')).toBeVisible()
    await expect(page.getByText('Is there a trial session?')).toHaveCount(0)
  })

  test('renders without page text, out of search engines, where it is unpublished', async ({
    page,
  }) => {
    const response = await page.goto('/en/faq')

    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('FAQ')
    await expect(page.getByText('Is there a trial session?')).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
