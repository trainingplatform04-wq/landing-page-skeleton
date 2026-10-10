import { expect, test } from '@playwright/test'

// The magazine from the test CMS (tests/e2e/sanity/fixtures.ts): 14 German articles,
// newest first, alternating Training / Ernährung; "Mindset" has none.
test.describe('Magazine', () => {
  test('opens with the 3 newest articles, then 9 more and a second page', async ({ page }) => {
    await page.goto('/magazin')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Wissen, das dich weiterbringt.',
    )
    await expect(page.locator('[data-section="magazine-featured"] h2')).toHaveText([
      'Artikel 1',
      'Artikel 2',
      'Artikel 3',
    ])
    await expect(page.locator('[data-section="magazine-grid"] article')).toHaveCount(9)

    await page.locator('[data-section="magazine-grid"] a[href="/magazin?page=2"]').first().click()

    await expect(page).toHaveURL(/\/magazin\?page=2$/)
    await expect(page.locator('[data-section="magazine-featured"]')).toHaveCount(0)
    await expect(page.locator('[data-section="magazine-grid"] h2')).toHaveText([
      'Artikel 13',
      'Artikel 14',
    ])
  })

  test('filters by category and shows the empty state', async ({ page }) => {
    await page.goto('/magazin')
    const tabs = page.getByRole('navigation', { name: 'Artikelkategorien' })
    await tabs.getByRole('link', { name: 'Ernährung' }).click()

    await expect(page).toHaveURL(/\/magazin\?category=nutrition$/)
    await expect(page.locator('[data-section="magazine-featured"]')).toHaveCount(0)
    await expect(page.locator('[data-section="magazine-grid"] article')).toHaveCount(7)

    await tabs.getByRole('link', { name: 'Mindset' }).click()
    await expect(page.getByText('Noch keine Artikel in dieser Kategorie.')).toBeVisible()

    await page.getByRole('link', { name: 'Alle Artikel' }).click()
    await expect(page).toHaveURL(/\/magazin$/)
  })

  test('shows each card ready to read: author, date and reading time', async ({ page }) => {
    await page.goto('/en/magazine')

    const card = page.locator('[data-section="magazine-featured"] article').first()
    await expect(card).toContainText('Lena Hoffmann · 28 Sep 2026 · 1 min read')
    await expect(card.locator('a')).toHaveAttribute('href', '/en/magazine/article-1')
  })

  test('keeps the filter and the page in the canonical and hreflang URLs', async ({ page }) => {
    await page.goto('/magazin?category=training')

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/magazin\?category=training$/,
    )
    // The English version of the same view: the filter is the same in every language.
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
      'href',
      /\/en\/magazine\?category=training$/,
    )

    await page.goto('/magazin?page=2')
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/magazin\?page=2$/,
    )
  })

  test('answers 404 for an unknown category or a page past the last one', async ({ page }) => {
    expect((await page.goto('/magazin?category=yoga'))?.status()).toBe(404)
    expect((await page.goto('/magazin?page=9'))?.status()).toBe(404)
  })

  test('is in the menu of every page', async ({ page }) => {
    await page.goto('/en')
    await page.getByRole('link', { name: 'Magazine' }).first().click()

    await expect(page).toHaveURL(/\/en\/magazine$/)
  })

  test('wraps long German titles on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/magazin')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })
})
