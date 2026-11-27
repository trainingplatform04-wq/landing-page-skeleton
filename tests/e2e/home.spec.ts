import { expect, test } from '@playwright/test'

// Content comes from the test CMS (tests/e2e/sanity/fixtures.ts).
test.describe('Home page', () => {
  test('renders the German home page from the CMS, with SEO tags', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Klüger trainieren, nicht härter',
    )
    await expect(page).toHaveTitle(/^Startseite · /)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Personal training in Berlin.',
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Startseite')
  })

  test('shows every section the editor filled in', async ({ page }) => {
    await page.goto('/')
    const main = page.locator('main')

    await expect(main.getByRole('heading', { name: 'Über mich' })).toBeVisible()
    await expect(main.getByText('Zertifizierte Trainerin')).toBeVisible()
    await expect(main.getByText('Gibt es ein Probetraining?')).toBeVisible()
    await expect(main.getByRole('link', { name: 'Alle Fragen' })).toHaveAttribute('href', '/faq')
    await expect(main.getByRole('link', { name: 'Schreiben Sie mir' })).toHaveAttribute(
      'href',
      '/kontakt',
    )
  })

  test('shows only the testimonials whose clients agreed to publication', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Endlich schmerzfrei trainieren.')).toBeVisible()
    await expect(page.getByText('Unpublished quote')).toHaveCount(0)
  })

  test('links the button to the page the editor picked, in each language', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Mehr über mich' }).first().click()
    await expect(page).toHaveURL(/\/ueber-uns$/)

    await page.goto('/en')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Train smarter, not harder')
    await expect(page.getByRole('link', { name: 'More about me' }).first()).toHaveAttribute(
      'href',
      '/en/about',
    )
  })
})

test.describe('Error pages', () => {
  test('answers 404 with a translated page for an unknown URL', async ({ page }) => {
    const response = await page.goto('/diese-seite-gibt-es-nicht')

    expect(response?.status()).toBe(404)
    await expect(page.getByText('Seite nicht gefunden')).toBeVisible()
  })
})
