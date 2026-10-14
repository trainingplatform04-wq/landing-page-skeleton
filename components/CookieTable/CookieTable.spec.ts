import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import { COOKIES } from '~/constants/cookies.constants'

import CookieTable from './CookieTable.vue'

describe('CookieTable', () => {
  it('lists the cookies of the inventory, statistics only with a GTM container', async () => {
    const wrapper = await mountSuspended(CookieTable)
    const names = wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())

    const expected = COOKIES.filter(({ category }) => category !== 'statistics').map(
      ({ name }) => name,
    )
    expect(names).toEqual(expected)
  })

  it('reopens the consent window', async () => {
    const wrapper = await mountSuspended(CookieTable)

    expect(wrapper.find('[data-consent="settings"]').exists()).toBe(true)
  })
})
