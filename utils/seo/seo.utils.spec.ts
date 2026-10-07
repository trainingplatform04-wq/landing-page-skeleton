import { describe, expect, it } from 'vitest'

import { toLocalBusiness } from './seo.utils'

describe('toLocalBusiness', () => {
  it('describes the business for search engines', () => {
    const business = {
      name: 'Landing Page',
      email: 'hi@example.com',
      phone: '+49 30 1234567',
      address: { street: 'Torstraße 1', postalCode: '10119', city: 'Berlin', country: 'DE' },
      socials: [{ platform: 'instagram', url: 'https://instagram.com/example' }],
    }

    expect(toLocalBusiness(business, 'https://example.com')).toEqual({
      name: 'Landing Page',
      url: 'https://example.com',
      email: 'hi@example.com',
      telephone: '+49 30 1234567',
      address: {
        streetAddress: 'Torstraße 1',
        postalCode: '10119',
        addressLocality: 'Berlin',
        addressCountry: 'DE',
      },
      sameAs: ['https://instagram.com/example'],
    })
  })

  it('leaves out what the profile does not have', () => {
    const result = toLocalBusiness(
      { name: 'X', email: 'x@example.com', phone: null, address: null, socials: null },
      'https://example.com',
    )

    expect(result.telephone).toBeUndefined()
    expect(result.address).toBeUndefined()
    expect(result.sameAs).toEqual([])
  })
})
