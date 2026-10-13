import { expect, type Page, test } from '@playwright/test'

// The article page with the test CMS (tests/e2e/sanity/fixtures.ts): article 2 has every part
// ("protein-ohne-pulver" / "protein-without-powder"); the other articles have none of the extras.
/** The interactions start once ArticleEnhancer runs (it marks the current heading first). */
const enhanced = (page: Page) =>
  expect(page.locator('[data-toc-link][aria-current]').first()).toBeAttached()

const SECTIONS = [
  'article-hero',
  'article-takeaways',
  'article-body',
  'article-faq',
  'article-author',
  'article-related',
  'article-closing',
]

test.describe('Article', () => {
  test('renders every section in order, with the article as the only h1', async ({ page }) => {
    const response = await page.goto('/en/magazine/protein-without-powder')

    expect(response?.status()).toBe(200)
    const sections = page.locator('[data-section^="article-"]')
    await expect(sections).toHaveCount(SECTIONS.length)
    expect(await sections.evaluateAll((all) => all.map((node) => node.dataset.section))).toEqual(
      SECTIONS,
    )
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Article 2')
    await expect(page.locator('[data-section="article-takeaways"]')).toContainText(
      'About 1.6 g per kilo.',
    )
    await expect(page.locator('[data-section="article-author"]')).toContainText('Lena Hoffmann')
    await expect(page.locator('[data-section="article-related"] article')).toHaveCount(1)
  })

  test('tells search engines it is an article with questions', async ({ page }) => {
    await page.goto('/en/magazine/protein-without-powder')

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
    const graph = await page.locator('script[type="application/ld+json"]').allTextContents()
    const types = graph.join(' ')
    expect(types).toContain('"Article"')
    expect(types).toContain('"Question"')
    expect(types).toContain('Is powder bad?')
  })

  test('hides the takeaways and the questions on an article without them', async ({ page }) => {
    await page.goto('/magazin/artikel-1')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artikel 1')
    await expect(page.locator('[data-section="article-takeaways"]')).toHaveCount(0)
    await expect(page.locator('[data-section="article-faq"]')).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'In diesem Artikel' })).toHaveCount(0)
  })

  test('opens a question and the mobile table of contents without JavaScript', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 800 },
    })
    const page = await context.newPage()
    await page.goto('/en/magazine/protein-without-powder')

    await page.getByText('Is powder bad?').click()
    await expect(page.getByText('No.', { exact: true })).toBeVisible()

    await page.locator('summary', { hasText: 'In this article' }).click()
    await expect(
      page.locator('details').getByRole('link', { name: 'Your shopping list' }),
    ).toHaveAttribute('href', '#your-shopping-list')
    await context.close()
  })

  test('marks the heading being read and fills the progress bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/en/magazine/protein-without-powder')
    const toc = page.locator('aside').getByRole('navigation', { name: 'In this article' })
    await expect(toc.getByRole('link', { name: 'How much protein you need' })).toHaveAttribute(
      'aria-current',
      'location',
    )

    await page.locator('#your-shopping-list').scrollIntoViewIfNeeded()
    await page.mouse.wheel(0, 400)
    await expect(toc.getByRole('link', { name: 'Your shopping list' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    await expect(page.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0')
  })

  test('loads nothing from YouTube before the click, then the player', async ({ page }) => {
    const youtube: string[] = []
    page.on('request', (request) => {
      if (/youtube/.test(request.url())) youtube.push(request.url())
    })
    await page.goto('/en/magazine/protein-without-powder')
    await enhanced(page)
    await expect(page.locator('iframe')).toHaveCount(0)

    await page.getByRole('link', { name: 'Load video' }).click()

    await expect(
      page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]'),
    ).toHaveCount(1)
    expect(youtube.every((url) => url.includes('youtube-nocookie.com'))).toBe(true)
  })

  test('copies the link and confirms it', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/en/magazine/protein-without-powder')
    await enhanced(page)

    await page.getByRole('button', { name: 'Copy link' }).click()

    await expect(page.getByText('Link copied')).toBeVisible()
  })

  test('switches language to the translated article', async ({ page }) => {
    await page.goto('/magazin/protein-ohne-pulver')
    await enhanced(page)
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveAttribute(
      'href',
      /\/en\/magazine\/protein-without-powder$/,
    )

    await page.getByRole('link', { name: 'English' }).click()

    await expect(page).toHaveURL(/\/en\/magazine\/protein-without-powder$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Article 2')
  })

  test('is a 404 for an unknown article', async ({ page }) => {
    const response = await page.goto('/en/magazine/nope')

    expect(response?.status()).toBe(404)
  })

  test('cards of the magazine lead to the article', async ({ page }) => {
    await page.goto('/en/magazine')
    await page
      .locator('[data-section="magazine-featured"] a[href$="/protein-without-powder"]')
      .click()

    await expect(page).toHaveURL(/\/en\/magazine\/protein-without-powder$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Article 2')
  })
})
