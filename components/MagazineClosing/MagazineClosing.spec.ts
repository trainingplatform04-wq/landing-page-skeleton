import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import MagazineClosing from './MagazineClosing.vue'

describe('MagazineClosing', () => {
  it('shows the title, the text and the button to the contact page', async () => {
    const wrapper = await mountSuspended(MagazineClosing, {
      props: {
        title: 'Ready?',
        text: 'Your first session is free.',
        cta: { label: 'Request a free trial', to: '/en/contact', external: false },
      },
    })

    expect(wrapper.find('h2').text()).toBe('Ready?')
    expect(wrapper.text()).toContain('Your first session is free.')
    expect(wrapper.find('a').attributes('href')).toBe('/en/contact')
  })

  it('renders nothing without a title and a button', async () => {
    const wrapper = await mountSuspended(MagazineClosing, { props: { text: 'Alone' } })

    expect(wrapper.find('[data-section="magazine-closing"]').exists()).toBe(false)
  })
})
