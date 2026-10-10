import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import MagazineFeatured from './MagazineFeatured.vue'

const post = (id: string) => ({
  id,
  title: `Article ${id}`,
  excerpt: `Excerpt ${id}`,
  to: `/magazin/${id}`,
  date: '28. Sept. 2026',
  dateTime: '2026-09-28',
  readingTime: '2 Min. Lesezeit',
})

describe('MagazineFeatured', () => {
  it('shows the first article large and the next ones compact', async () => {
    const wrapper = await mountSuspended(MagazineFeatured, {
      props: { posts: [post('a'), post('b'), post('c')] },
    })

    expect(wrapper.findAll('article').map((card) => card.find('h2').text())).toEqual([
      'Article a',
      'Article b',
      'Article c',
    ])
    // Only the large card shows its excerpt.
    expect(wrapper.text()).toContain('Excerpt a')
    expect(wrapper.text()).not.toContain('Excerpt b')
  })

  it('renders nothing without articles', async () => {
    const wrapper = await mountSuspended(MagazineFeatured, { props: { posts: [] } })

    expect(wrapper.find('[data-section="magazine-featured"]').exists()).toBe(false)
  })
})
