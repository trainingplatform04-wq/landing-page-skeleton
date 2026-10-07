import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import AppFooter from './AppFooter.vue'

const props = {
  siteName: 'Landing Page',
  year: 2026,
  legalLinks: { imprint: '/en/imprint', privacy: '/en/privacy' },
}

const business = {
  name: 'Studio Berlin',
  email: 'hi@example.com',
  phone: { label: '+49 30 1234567', href: 'tel:+49301234567' },
  addressLines: [],
  socials: [{ platform: 'instagram', url: 'https://instagram.com/example' }],
}

describe('AppFooter', () => {
  it('always links both legal pages', async () => {
    const wrapper = await mountSuspended(AppFooter, { route: '/en', props })

    const legal = wrapper.find('nav[aria-label="Legal"]').findAll('a')
    expect(legal.map((link) => [link.text(), link.attributes('href')])).toEqual([
      ['Imprint', '/en/imprint'],
      ['Privacy', '/en/privacy'],
    ])
  })

  it('shows the copyright with the site name and the note', async () => {
    const wrapper = await mountSuspended(AppFooter, {
      route: '/en',
      props: { ...props, note: 'Made in Berlin.' },
    })

    expect(wrapper.text()).toContain('2026 Landing Page')
    expect(wrapper.text()).toContain('Made in Berlin.')
  })

  it('shows the business contacts when the profile is filled in', async () => {
    const wrapper = await mountSuspended(AppFooter, { route: '/en', props: { ...props, business } })

    expect(wrapper.text()).toContain('2026 Studio Berlin')
    expect(wrapper.find('a[href="mailto:hi@example.com"]').exists()).toBe(true)
    expect(wrapper.find('a[href="tel:+49301234567"]').text()).toBe('+49 30 1234567')
    expect(wrapper.find('a[href="https://instagram.com/example"]').attributes('target')).toBe(
      '_blank',
    )
  })
})
