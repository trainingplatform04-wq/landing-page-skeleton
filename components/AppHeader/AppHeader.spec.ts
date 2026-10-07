import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import AppHeader from './AppHeader.vue'

const props = {
  siteName: 'Landing Page',
  homePath: '/',
  navigation: [
    { label: 'Angebote', to: '/angebote' },
    { label: 'FAQ', to: '/faq' },
  ],
}

describe('AppHeader', () => {
  it('links the site name to the home page', async () => {
    const wrapper = await mountSuspended(AppHeader, { props })

    expect(wrapper.find('a[href="/"]').text()).toContain('Landing Page')
  })

  it('renders a labelled main navigation with the given links', async () => {
    const wrapper = await mountSuspended(AppHeader, { props })

    const links = wrapper
      .find('nav[aria-label="Hauptnavigation"]')
      .findAll('a')
      .map((link) => [link.text(), link.attributes('href')])
    expect(links).toEqual([
      ['Angebote', '/angebote'],
      ['FAQ', '/faq'],
    ])
  })
})
