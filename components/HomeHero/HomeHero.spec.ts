import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import HomeHero from './HomeHero.vue'

describe('HomeHero', () => {
  it('shows the title, the text and the button', async () => {
    const wrapper = await mountSuspended(HomeHero, {
      props: {
        title: 'Train smarter',
        text: 'Personal coaching.',
        cta: { label: 'See the offers', to: '/en/offers', external: false },
      },
    })

    expect(wrapper.find('h1').text()).toBe('Train smarter')
    expect(wrapper.text()).toContain('Personal coaching.')
    expect(wrapper.find('a[href="/en/offers"]').text()).toBe('See the offers')
  })

  it('shows the image with its alternative text', async () => {
    const wrapper = await mountSuspended(HomeHero, {
      props: { title: 'Hi', image: { url: 'https://cdn.sanity.io/x.jpg', alt: 'A coach' } },
    })

    expect(wrapper.find('img').attributes('alt')).toBe('A coach')
  })
})
