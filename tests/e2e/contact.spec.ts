import { expect, test } from '@playwright/test'

// The form sends in the background to the form service (the test CMS stands in for it,
// tests/e2e/sanity/server.ts) and a toast thanks the visitor.
test.describe('Contact', () => {
  test('shows the business facts', async ({ page }) => {
    await page.goto('/kontakt')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kontakt')
    await expect(page.locator('main')).toContainText('Torstraße 1')
  })

  test('says what is missing before sending', async ({ page }) => {
    await page.goto('/en/contact')
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Please fill this in').first()).toBeVisible()
    await expect(page.getByText('Please agree so we can answer you')).toBeVisible()
  })

  test('sends the message and thanks the visitor, without leaving the page', async ({ page }) => {
    await page.goto('/en/contact')

    await page.getByLabel('Name').fill('Ada')
    await page.getByLabel('Email').fill('ada@example.com')
    await page.getByLabel('Message').fill('Hello')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Send' }).click()

    await expect(
      page.getByText('Thank you! We will get back to you shortly.', { exact: true }),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/en\/contact$/)
    await expect(page.getByLabel('Message')).toHaveValue('')
  })

  test('uses the thank-you message written in the CMS', async ({ page }) => {
    await page.goto('/kontakt')

    await page.getByLabel('Name').fill('Ada')
    await page.getByLabel('E-Mail').fill('ada@example.com')
    await page.getByLabel('Nachricht').fill('Hallo')
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Senden' }).click()

    await expect(page.getByText('Danke, bis bald!', { exact: true })).toBeVisible()
  })
})
