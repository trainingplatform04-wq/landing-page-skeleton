import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import type { PostCard } from '~/types/content.types'

import ArticleRelated from './ArticleRelated.vue'

const card = (id: string): PostCard => ({
  id,
  title: `Article ${id}`,
  excerpt: 'Excerpt',
  to: `/en/magazine/article-${id}`,
  date: '1 Sep 2026',
  dateTime: '2026-09-01T06:00:00Z',
  readingTime: '1 min read',
})

describe('ArticleRelated', () => {
  it('shows "Keep reading" with a card per article; the third hides on tablets', async () => {
    const wrapper = await mountSuspended(ArticleRelated, {
      props: { posts: [card('a'), card('b'), card('c')] },
    })

    expect(wrapper.find('h2').text()).toBe('Weiterlesen')
    expect(wrapper.findAll('article')).toHaveLength(3)
    expect(wrapper.find('a').attributes('href')).toBe('/en/magazine/article-a')
    expect(wrapper.findAll('article')[2]!.element.parentElement?.className).toContain('md:hidden')
  })

  it('renders nothing without other articles', async () => {
    const wrapper = await mountSuspended(ArticleRelated, { props: { posts: [] } })

    expect(wrapper.find('[data-section="article-related"]').exists()).toBe(false)
  })
})
