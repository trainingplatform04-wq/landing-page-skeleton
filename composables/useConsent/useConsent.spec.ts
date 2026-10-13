import { describe, expect, it } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useConsent } from './useConsent'

describe('useConsent', () => {
  it('allows nothing optional until the visitor has answered', async () => {
    const consent = await mountComposable(useConsent)

    expect(consent.state.value).toEqual({ decided: false, statistics: false, externalMedia: false })
    expect(consent.allows('statistics').value).toBe(false)
    expect(consent.allows('externalMedia').value).toBe(false)
  })

  it("records the visitor's choice per category", async () => {
    const consent = await mountComposable(useConsent)

    consent.record({ statistics: false, externalMedia: true })

    expect(consent.state.value).toEqual({ decided: true, statistics: false, externalMedia: true })
    expect(consent.allows('externalMedia').value).toBe(true)
    expect(consent.allows('statistics').value).toBe(false)
  })
})
