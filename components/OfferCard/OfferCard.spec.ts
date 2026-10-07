import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import OfferCard from './OfferCard.vue'

const offer = {
  id: 'o1',
  title: 'Personal training',
  summary: 'One to one.',
  to: '/angebote/personal-training',
}

describe('OfferCard', () => {
  it('links the offer page and shows its summary', async () => {
    const wrapper = await mountSuspended(OfferCard, { props: { offer } })

    expect(wrapper.find('a').attributes('href')).toBe('/angebote/personal-training')
    expect(wrapper.text()).toContain('Personal training')
    expect(wrapper.text()).toContain('One to one.')
  })

  it('shows the price and the image when the offer has them', async () => {
    const image = { url: 'https://cdn.sanity.io/x.jpg', alt: 'Gym' }
    const wrapper = await mountSuspended(OfferCard, {
      props: { offer: { ...offer, price: '60,00 €', image } },
    })

    expect(wrapper.text()).toContain('60,00 €')
    expect(wrapper.find('img').attributes('alt')).toBe('Gym')
  })
})
