import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import ArticleFaq from './ArticleFaq.vue'

describe('ArticleFaq', () => {
  it('shows every question closed, its answer inside', async () => {
    const wrapper = await mountSuspended(ArticleFaq, {
      props: {
        items: [
          { question: 'Is powder bad?', answer: 'No.' },
          { question: 'Vegetarian?', answer: 'Yes.' },
        ],
      },
    })

    expect(wrapper.find('h2').text()).toBe('Häufige Fragen')
    const rows = wrapper.findAll('details')
    expect(rows).toHaveLength(2)
    expect(rows.every((row) => row.attributes('open') === undefined)).toBe(true)
    expect(rows[0]!.find('summary').text()).toBe('Is powder bad?')
    expect(rows[0]!.find('p').text()).toBe('No.')
  })

  it('renders nothing without questions', async () => {
    const wrapper = await mountSuspended(ArticleFaq, { props: { items: [] } })

    expect(wrapper.find('[data-section="article-faq"]').exists()).toBe(false)
  })
})
