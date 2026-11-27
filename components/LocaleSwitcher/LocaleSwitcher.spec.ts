import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import LocaleSwitcher from './LocaleSwitcher.vue'

describe('LocaleSwitcher', () => {
  it('links the same page in the other language', async () => {
    const wrapper = await mountSuspended(LocaleSwitcher, { route: '/kontakt' })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]?.text()).toBe('EN')
    expect(links[0]?.attributes()).toMatchObject({
      href: '/en/contact',
      hreflang: 'en-US',
      lang: 'en-US',
      'aria-label': 'English',
    })
  })

  it('offers German on an English page', async () => {
    const wrapper = await mountSuspended(LocaleSwitcher, { route: '/en/contact' })

    expect(wrapper.find('a').attributes('href')).toBe('/kontakt')
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Change language')
  })
})
