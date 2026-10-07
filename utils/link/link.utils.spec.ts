import { describe, expect, it } from 'vitest'

import { type LocalePath, resolveLink, toTelHref } from './link.utils'

const localePath: LocalePath = (route) =>
  typeof route === 'string' ? `/en/${route}` : `/en/offers/${route.params.slug}`

const context = { localePath, locale: 'en' }

describe('resolveLink', () => {
  it('links a page of the site in the active language', () => {
    expect(resolveLink({ kind: 'route', route: 'contact' }, context)).toEqual({
      to: '/en/contact',
      external: false,
    })
  })

  it('never links an unknown page or a page that needs a slug', () => {
    expect(resolveLink({ kind: 'route', route: 'nope' }, context)).toBeNull()
    expect(resolveLink({ kind: 'route', route: 'offers-slug' }, context)).toBeNull()
  })

  it('links an offer only in its own language', () => {
    const offer = { kind: 'reference' as const, offerSlug: 'yoga' }
    expect(resolveLink({ ...offer, offerLanguage: 'en' }, context)).toEqual({
      to: '/en/offers/yoga',
      external: false,
    })
    expect(resolveLink({ ...offer, offerLanguage: 'de' }, context)).toBeNull()
  })

  it('allows https, mailto and tel addresses only', () => {
    expect(resolveLink({ kind: 'external', href: 'https://example.com' }, context)).toEqual({
      to: 'https://example.com',
      external: true,
    })
    expect(
      resolveLink({ kind: 'external', href: 'mailto:hi@example.com' }, context)?.external,
    ).toBe(true)
    expect(resolveLink({ kind: 'external', href: 'javascript:alert(1)' }, context)).toBeNull()
    expect(resolveLink({ kind: 'external', href: 'http://example.com' }, context)).toBeNull()
  })

  it('returns null without a link', () => {
    expect(resolveLink(null, context)).toBeNull()
  })
})

describe('toTelHref', () => {
  it('keeps only what a phone dials', () => {
    expect(toTelHref('+49 (0)30 123-45 67')).toBe('tel:+49301234567')
  })
})
