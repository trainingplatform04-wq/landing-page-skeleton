import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleToc from './ArticleToc.vue'

describe('ArticleToc', () => {
  it('links every heading by its id', async () => {
    const wrapper = await mountSuspended(ArticleToc, {
      props: {
        items: [
          { id: 'how-much', text: 'How much protein you need' },
          { id: 'shopping', text: 'Your shopping list' },
        ],
      },
    })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('In diesem Artikel')
    const links = wrapper.findAll('a')
    expect(links.map((link) => [link.attributes('href'), link.text()])).toEqual([
      ['#how-much', 'How much protein you need'],
      ['#shopping', 'Your shopping list'],
    ])
  })
})
