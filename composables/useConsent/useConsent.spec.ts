import { describe, expect, it } from 'vitest'

import { useConsent } from './useConsent'

describe('useConsent', () => {
  it('allows nothing optional until the visitor has answered', () => {
    const consent = useConsent()

    expect(consent.state.value).toEqual({ decided: false, statistics: false, externalMedia: false })
    expect(consent.allows('statistics').value).toBe(false)
    expect(consent.allows('externalMedia').value).toBe(false)
  })

  it("records the visitor's choice per category", () => {
    const consent = useConsent()

    consent.record({ statistics: false, externalMedia: true })

    expect(consent.state.value).toEqual({ decided: true, statistics: false, externalMedia: true })
    expect(consent.allows('externalMedia').value).toBe(true)
    expect(consent.allows('statistics').value).toBe(false)
  })
})
