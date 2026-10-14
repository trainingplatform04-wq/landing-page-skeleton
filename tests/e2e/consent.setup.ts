import { expect, test as setup } from '@playwright/test'

import { REJECTED_STATE } from './consent.state.ts'

// Every other test starts with consent answered ("Reject all"), as a returning visitor: the
// consent window would otherwise cover the page. tests/e2e/consent.spec.ts starts empty.
setup('answer the consent window', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Alle ablehnen' }).click()
  await expect(page.locator('#consent-banner')).toBeHidden()
  await page.context().storageState({ path: REJECTED_STATE })
})
