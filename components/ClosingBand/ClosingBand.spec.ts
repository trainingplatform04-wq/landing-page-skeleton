import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ClosingBand from './ClosingBand.vue'

describe('ClosingBand', () => {
  it('shows the title, the text and the button', async () => {
    const wrapper = await mountSuspended(ClosingBand, {
      props: {
        section: 'magazine-closing',
        title: 'Ready?',
        text: 'Your first session is free.',
        cta: { label: 'Request a free trial', to: '/en/contact', external: false },
      },
    })

    expect(wrapper.find('section').attributes('data-section')).toBe('magazine-closing')
    expect(wrapper.find('h2').text()).toBe('Ready?')
    expect(wrapper.text()).toContain('Your first session is free.')
    expect(wrapper.find('a').attributes('href')).toBe('/en/contact')
  })

  it('opens an external button in a new tab', async () => {
    const wrapper = await mountSuspended(ClosingBand, {
      props: {
        section: 'about-closing',
        cta: { label: 'Book', to: 'https://cal.example.com', external: true },
      },
    })

    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders nothing without a title and a button', async () => {
    const wrapper = await mountSuspended(ClosingBand, {
      props: { section: 'article-closing', text: 'Alone' },
    })

    expect(wrapper.find('section').exists()).toBe(false)
  })
})
