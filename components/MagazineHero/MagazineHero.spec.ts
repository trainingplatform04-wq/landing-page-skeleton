import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import MagazineHero from './MagazineHero.vue'

describe('MagazineHero', () => {
  it('shows the label, the page title as the h1 and the intro', async () => {
    const wrapper = await mountSuspended(MagazineHero, {
      props: { label: 'Magazine', title: 'Know-how', intro: 'From our coaches.' },
    })

    expect(wrapper.find('section').attributes('data-section')).toBe('magazine-hero')
    expect(wrapper.find('p').text()).toBe('Magazine')
    expect(wrapper.find('h1').text()).toBe('Know-how')
    expect(wrapper.text()).toContain('From our coaches.')
  })
})
