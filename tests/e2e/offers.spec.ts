import { expect, test } from '@playwright/test'

// Offers from the test CMS (tests/e2e/sanity/fixtures.ts).
test.describe('Offers', () => {
  test('lists the ordered offers first, then the others by title', async ({ page }) => {
    await page.goto('/angebote')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Angebote')
    // The card titles (the page title is the `h1`).
    const titles = page.locator('main div[data-slot="title"]')
    await expect(titles).toHaveText(['Kraftgruppe', 'Online-Coaching', 'Personal Training'])
  })

  test('lists only the offers of the active language', async ({ page }) => {
    await page.goto('/en/offers')

    await expect(page.locator('main')).toContainText('Strength group')
    await expect(page.locator('main')).not.toContainText('Online-Coaching')
  })

  test('opens an offer from the list', async ({ page }) => {
    await page.goto('/angebote')
    // The whole card is the link (an overlay above the title): click where a visitor would.
    await page.locator('main').getByText('Kraftgruppe', { exact: true }).click({ force: true })

    await expect(page).toHaveURL(/\/angebote\/kraftgruppe$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kraftgruppe')
    await expect(page.getByText('Preis: 25,00 €')).toBeVisible()
  })
})
