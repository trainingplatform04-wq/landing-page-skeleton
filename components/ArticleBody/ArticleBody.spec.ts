import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleBody from './ArticleBody.vue'

const body = [
  {
    _type: 'block',
    _key: 'b0',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: 's', text: 'Intro.', marks: [] }],
  },
]

describe('ArticleBody', () => {
  it('shows the table of contents twice (sidebar and closed mobile disclosure)', async () => {
    const wrapper = await mountSuspended(ArticleBody, {
      props: { toc: [{ id: 'how-much', text: 'How much' }], body },
    })

    expect(wrapper.findAll('[data-toc-link]')).toHaveLength(2)
    const details = wrapper.find('details')
    expect(details.attributes('open')).toBeUndefined()
    expect(details.find('summary').text()).toBe('In diesem Artikel')
  })

  it('has no table of contents without headings', async () => {
    const wrapper = await mountSuspended(ArticleBody, { props: { toc: [], body } })

    expect(wrapper.find('[data-toc-link]').exists()).toBe(false)
    expect(wrapper.find('details').exists()).toBe(false)
  })

  it('ends with the share row; the native share button waits for the browser', async () => {
    const wrapper = await mountSuspended(ArticleBody, { props: { toc: [], body } })

    expect(wrapper.text()).toContain('Artikel teilen')
    expect(wrapper.find('[data-share-copy]').text()).toBe('Link kopieren')
    expect(wrapper.find('[data-share-native]').attributes('hidden')).toBeDefined()
  })
})
