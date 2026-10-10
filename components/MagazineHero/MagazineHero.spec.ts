import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import MagazineHero from './MagazineHero.vue'

describe('MagazineHero', () => {
  it('shows the kicker, the page title as the h1 and the intro', async () => {
    const wrapper = await mountSuspended(MagazineHero, {
      props: { kicker: 'Magazine', title: 'Know-how', intro: 'From our coaches.' },
    })

    expect(wrapper.find('[data-section="magazine-hero"]').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Know-how')
    expect(wrapper.text()).toContain('Magazine')
    expect(wrapper.text()).toContain('From our coaches.')
  })
})
