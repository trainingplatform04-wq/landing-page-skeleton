import { describe, expect, it } from 'vitest'

import { isAnalyticsEvent, trackParams } from './analytics.utils'

describe('trackParams', () => {
  it('turns the data-track-* attributes into event parameters', () => {
    const dataset = { track: 'cta_click', trackLabel: 'Book', trackOfferSlug: 'yoga', other: 'x' }

    expect(trackParams(dataset)).toEqual({ label: 'Book', offerSlug: 'yoga' })
  })
})

describe('isAnalyticsEvent', () => {
  it('knows only the events of the GTM container', () => {
    expect(isAnalyticsEvent('cta_click')).toBe(true)
    expect(isAnalyticsEvent('page_view')).toBe(false)
    expect(isAnalyticsEvent(undefined)).toBe(false)
  })
})
