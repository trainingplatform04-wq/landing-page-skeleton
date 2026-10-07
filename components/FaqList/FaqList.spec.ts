import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import { text } from '~~/tests/helpers/cmsData'

import FaqList from './FaqList.vue'

describe('FaqList', () => {
  it('lists the questions as an accordion', async () => {
    const wrapper = await mountSuspended(FaqList, {
      props: {
        items: [
          { id: 'f1', question: 'Is there a trial session?', answer: text('Yes.') },
          { id: 'f2', question: 'Where?', answer: text('In Berlin.') },
        ],
      },
    })

    const questions = wrapper.findAll('button').map((button) => button.text())
    expect(questions).toEqual(['Is there a trial session?', 'Where?'])
  })
})
