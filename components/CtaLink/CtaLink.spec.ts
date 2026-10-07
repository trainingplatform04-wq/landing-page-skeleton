import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import CtaLink from './CtaLink.vue'

describe('CtaLink', () => {
  it('links a page of the site in the same tab', async () => {
    const wrapper = await mountSuspended(CtaLink, {
      props: { cta: { label: 'Contact', to: '/kontakt', external: false } },
    })

    const link = wrapper.find('a')
    expect(link.text()).toBe('Contact')
    expect(link.attributes('href')).toBe('/kontakt')
    expect(link.attributes('target')).toBeUndefined()
  })

  it('opens an external website in a new tab, but not an email address', async () => {
    const website = await mountSuspended(CtaLink, {
      props: { cta: { label: 'Book', to: 'https://booking.example.com', external: true } },
    })
    const email = await mountSuspended(CtaLink, {
      props: { cta: { label: 'Write', to: 'mailto:hi@example.com', external: true } },
    })

    expect(website.find('a').attributes('target')).toBe('_blank')
    expect(email.find('a').attributes('target')).toBeUndefined()
  })
})
