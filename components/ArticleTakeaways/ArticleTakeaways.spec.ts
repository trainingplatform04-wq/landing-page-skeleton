import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleTakeaways from './ArticleTakeaways.vue'

describe('ArticleTakeaways', () => {
  it('lists the key points under "At a glance"', async () => {
    const wrapper = await mountSuspended(ArticleTakeaways, {
      props: { items: ['About 1.6 g per kilo.', 'Three or four meals.'] },
    })

    expect(wrapper.find('h2').text()).toBe('Auf einen Blick')
    expect(wrapper.findAll('li').map((item) => item.text())).toEqual([
      'About 1.6 g per kilo.',
      'Three or four meals.',
    ])
  })

  it('renders nothing without points', async () => {
    const wrapper = await mountSuspended(ArticleTakeaways, { props: { items: [] } })

    expect(wrapper.find('[data-section="article-takeaways"]').exists()).toBe(false)
  })
})
