import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import TestimonialList from './TestimonialList.vue'

describe('TestimonialList', () => {
  it('shows each quote with its author', async () => {
    const wrapper = await mountSuspended(TestimonialList, {
      props: {
        testimonials: [
          { id: 't1', quote: 'Finally pain-free.', author: 'Anna' },
          { id: 't2', quote: 'Great coach.', author: 'Ben' },
        ],
      },
    })

    expect(wrapper.findAll('blockquote').map((quote) => quote.text())).toEqual([
      '“Finally pain-free.”',
      '“Great coach.”',
    ])
    expect(wrapper.text()).toContain('Anna')
  })
})
