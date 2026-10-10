import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import PostCard from './PostCard.vue'

const post = {
  id: 'p1',
  title: 'Strength training after 40',
  excerpt: 'Muscles respond to training at any age.',
  to: '/en/magazine/strength-training-after-40',
  category: 'Training',
  author: { name: 'Lena Hoffmann' },
  date: '28 Sep 2026',
  dateTime: '2026-09-28T06:00:00Z',
  readingTime: '2 min read',
}

describe('PostCard', () => {
  it('links the article and shows its category, excerpt and meta line', async () => {
    const wrapper = await mountSuspended(PostCard, { props: { post } })

    expect(wrapper.find('a').attributes('href')).toBe('/en/magazine/strength-training-after-40')
    expect(wrapper.find('h2').text()).toBe('Strength training after 40')
    expect(wrapper.text()).toContain('Training')
    expect(wrapper.text()).toContain('Muscles respond to training at any age.')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-09-28T06:00:00Z')
    expect(wrapper.text()).toContain('Lena Hoffmann · 28 Sep 2026 · 2 min read')
  })

  it('leaves the excerpt out of a compact card', async () => {
    const wrapper = await mountSuspended(PostCard, { props: { post, variant: 'compact' } })

    expect(wrapper.text()).not.toContain('Muscles respond')
  })

  it('shows the cover and the author photo when the article has them', async () => {
    const image = { url: 'https://cdn.sanity.io/cover.jpg', alt: 'A barbell' }
    const photo = { url: 'https://cdn.sanity.io/lena.jpg', alt: 'Lena Hoffmann' }
    const wrapper = await mountSuspended(PostCard, {
      props: { post: { ...post, image, author: { name: 'Lena Hoffmann', photo } } },
    })

    expect(wrapper.findAll('img').map((img) => img.attributes('alt'))).toEqual([
      'A barbell',
      'Lena Hoffmann',
    ])
  })
})
