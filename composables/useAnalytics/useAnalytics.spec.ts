import { describe, expect, it } from 'vitest'

import { useAnalytics } from './useAnalytics'

// Sending to GTM after consent is proven in a browser (tests/e2e/consent.spec.ts).
describe('useAnalytics', () => {
  it('does nothing without a GTM container (no data layer, no error)', () => {
    const analytics = useAnalytics()

    expect(() => analytics.track('share', { method: 'copy' })).not.toThrow()
    expect('dataLayer' in window).toBe(false)
  })
})
