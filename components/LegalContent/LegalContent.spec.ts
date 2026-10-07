import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import { text } from '~~/tests/helpers/cmsData'

import LegalContent from './LegalContent.vue'

describe('LegalContent', () => {
  it('shows the title, the text and when it was last updated', async () => {
    const wrapper = await mountSuspended(LegalContent, {
      route: '/impressum',
      props: {
        title: 'Impressum',
        body: text('Angaben gemäß § 5 DDG'),
        updatedAt: '1. September 2026',
      },
    })

    expect(wrapper.find('h1').text()).toBe('Impressum')
    expect(wrapper.text()).toContain('Angaben gemäß § 5 DDG')
    expect(wrapper.text()).toContain('Stand: 1. September 2026')
  })

  it('leaves out the date when there is none', async () => {
    const wrapper = await mountSuspended(LegalContent, {
      route: '/impressum',
      props: { title: 'Impressum', body: [] },
    })

    expect(wrapper.text()).not.toContain('Stand')
  })
})
