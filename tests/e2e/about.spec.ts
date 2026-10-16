import { expect, test } from '@playwright/test'

// The About page from the test CMS (tests/e2e/sanity/fixtures.ts): both languages, no picture.
test.describe('About page', () => {
  test('shows the label, the title and the description in German', async ({ page }) => {
    await page.goto('/ueber-uns')

    const hero = page.locator('[data-section="about-hero"]')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Hallo, ich bin Ihre Trainerin',
    )
    await expect(hero.getByText('Über mich')).toBeVisible()
    await expect(hero.getByText('Seit 2010 an Ihrer Seite.')).toBeVisible()
  })

  test('closes with a button to the contact page', async ({ page }) => {
    await page.goto('/en/about')

    const closing = page.locator('[data-section="about-closing"]')
    await expect(closing.getByRole('heading', { level: 2 })).toHaveText(
      'Ready for your first session?',
    )
    await closing.getByRole('link', { name: 'Request a free trial' }).click()

    await expect(page).toHaveURL(/\/en\/contact$/)
  })

  test('is in the main menu after the magazine', async ({ page }) => {
    await page.goto('/en')
    const menu = page.getByRole('navigation', { name: 'Main navigation' }).first()

    await expect(menu.getByRole('link')).toContainText(['Offers', 'Magazine', 'About', 'FAQ'])
    await menu.getByRole('link', { name: 'About' }).first().click()

    await expect(page).toHaveURL(/\/en\/about$/)
  })

  test('has one h1 and the translated address in the language switcher', async ({ page }) => {
    await page.goto('/en/about')

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.locator('link[rel="alternate"][hreflang="de-DE"]')).toHaveAttribute(
      'href',
      /\/ueber-uns$/,
    )
  })
})
