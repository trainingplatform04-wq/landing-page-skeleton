import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import AboutHero from './AboutHero.vue'

describe('AboutHero', () => {
  it('shows the label, the only h1 and the description', async () => {
    const wrapper = await mountSuspended(AboutHero, {
      props: { label: 'About me', title: "Hi, I'm your coach", description: 'Since 2010.' },
    })

    expect(wrapper.find('[data-section="about-hero"]').exists()).toBe(true)
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe("Hi, I'm your coach")
    expect(wrapper.text()).toContain('About me')
    expect(wrapper.text()).toContain('Since 2010.')
  })

  it('loads the picture first, with its alternative text and a fixed size', async () => {
    const wrapper = await mountSuspended(AboutHero, {
      props: { title: 'Hi', image: { url: 'https://cdn.sanity.io/x.jpg', alt: 'A coach' } },
    })
    const image = wrapper.find('img')

    expect(image.attributes('alt')).toBe('A coach')
    expect(image.attributes('fetchpriority')).toBe('high')
    expect(image.attributes('width')).toBe('1120')
    expect(image.attributes('height')).toBe('480')
  })

  it('shows only the title without a picture, a label or a description', async () => {
    const wrapper = await mountSuspended(AboutHero, { props: { title: 'Hi' } })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('p').exists()).toBe(false)
    expect(wrapper.find('h1').text()).toBe('Hi')
  })
})
