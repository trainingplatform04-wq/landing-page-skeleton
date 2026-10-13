import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleAuthor from './ArticleAuthor.vue'

describe('ArticleAuthor', () => {
  it('presents the author and links more articles by first name', async () => {
    const wrapper = await mountSuspended(ArticleAuthor, {
      props: {
        author: {
          name: 'Jonas Weber',
          firstName: 'Jonas',
          role: 'Nutrition coach',
          bio: 'Food that fits a busy calendar.',
          photo: { url: '/jonas.jpg', alt: 'Portrait' },
        },
        magazineTo: '/en/magazine',
      },
    })

    expect(wrapper.text()).toContain('Geschrieben von')
    expect(wrapper.find('h2').text()).toBe('Jonas Weber')
    expect(wrapper.text()).toContain('Nutrition coach')
    expect(wrapper.text()).toContain('Food that fits a busy calendar.')
    expect(wrapper.find('img').attributes('alt')).toBe('Jonas Weber')
    const more = wrapper.find('a')
    expect(more.text()).toBe('Mehr von Jonas')
    expect(more.attributes('href')).toBe('/en/magazine')
  })

  it('leaves out the role, the bio and the photo when missing', async () => {
    const wrapper = await mountSuspended(ArticleAuthor, {
      props: { author: { name: 'Lena', firstName: 'Lena' }, magazineTo: '/magazin' },
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.findAll('p')).toHaveLength(1)
  })
})
