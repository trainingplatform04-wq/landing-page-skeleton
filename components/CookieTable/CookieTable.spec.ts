import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'

import CookieTable from './CookieTable.vue'

describe('CookieTable', () => {
  it('lists the cookies of the inventory, statistics only with a GTM container', async () => {
    const wrapper = await mountSuspended(CookieTable)
    const names = wrapper.findAll('tbody tr td:first-child').map((cell) => cell.text())

    expect(names).toEqual(['cc_cookie', 'color-mode', 'VISITOR_INFO1_LIVE', 'YSC'])
  })

  it('reopens the consent window', async () => {
    const wrapper = await mountSuspended(CookieTable)

    expect(wrapper.find('[data-consent="settings"]').text()).toBe('Cookie-Einstellungen')
  })
})
