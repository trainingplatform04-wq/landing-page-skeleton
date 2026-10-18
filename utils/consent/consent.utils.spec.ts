import { describe, expect, it } from 'vitest'

import { consentQueueScript, consentTranslation } from './consent.utils'

const t = (key: string) => `[${key}]`
const links = { privacy: '/datenschutz', imprint: '/impressum' }

describe('consentTranslation', () => {
  it('offers one section per category and names statistics only when offered', () => {
    const texts = consentTranslation(t, ['necessary', 'externalMedia'], links)

    expect(texts.consentModal?.description).toBe('[consent.descriptionNoStatistics]')
    expect(texts.preferencesModal.sections.map((section) => section.linkedCategory)).toEqual([
      undefined,
      'necessary',
      'externalMedia',
    ])
    expect(texts.consentModal?.footer).toContain('href="/datenschutz"')
  })

  it('describes statistics with a GTM container', () => {
    const texts = consentTranslation(t, ['necessary', 'statistics', 'externalMedia'], links)

    expect(texts.consentModal?.description).toBe('[consent.description]')
  })
})

describe('consentQueueScript', () => {
  it('queues the answer of a consent button clicked before the app runs', () => {
    expect(consentQueueScript('__consentQueue')).toContain(
      "window.__consentQueue.push(button.getAttribute('data-consent'))",
    )
  })
})
