import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it } from 'vitest'

import { CONSENT_COOKIE, CONSENT_REVISION } from '~/constants/consent.constants'

import ConsentBanner from './ConsentBanner.vue'

const storeChoice = (revision: number) => {
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ revision }))}; path=/`
}

afterEach(() => {
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0`
})

describe('ConsentBanner', () => {
  it('asks on a first visit, as a labelled dialog with the privacy and imprint links', async () => {
    const wrapper = await mountSuspended(ConsentBanner)

    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(wrapper.find(`#${dialog.attributes('aria-labelledby')}`).text()).toBe(
      'Ihre Privatsphäre',
    )
    expect(wrapper.find(`#${dialog.attributes('aria-describedby')}`).exists()).toBe(true)
    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual([
      '/datenschutz',
      '/impressum',
    ])
  })

  it('gives "Reject all" exactly the weight of "Accept all"', async () => {
    const wrapper = await mountSuspended(ConsentBanner)

    const accept = wrapper.find('[data-consent="accept-all"]')
    const reject = wrapper.find('[data-consent="reject-all"]')
    expect(accept.text()).toBe('Alle akzeptieren')
    expect(reject.text()).toBe('Alle ablehnen')
    expect(reject.classes()).toEqual(accept.classes())
    expect(wrapper.find('[data-consent="settings"]').text()).toBe('Einstellungen')
  })

  it('does not mention statistics without a GTM container, but names YouTube', async () => {
    const wrapper = await mountSuspended(ConsentBanner)

    const description = wrapper.find('#consent-description').text()
    expect(description).not.toContain('Google Analytics')
    expect(description).not.toContain('Tag Manager')
    expect(description).toContain('YouTube')
  })

  it('is not shown once the visitor has chosen for the current revision', async () => {
    storeChoice(CONSENT_REVISION)
    const wrapper = await mountSuspended(ConsentBanner)

    expect(wrapper.find('#consent-banner').exists()).toBe(false)
  })

  it('asks again after a revision', async () => {
    storeChoice(CONSENT_REVISION - 1)
    const wrapper = await mountSuspended(ConsentBanner)

    expect(wrapper.find('#consent-banner').exists()).toBe(true)
  })
})
