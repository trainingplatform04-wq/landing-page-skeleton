import { describe, expect, it } from 'vitest'

import {
  type MapContext,
  toBusiness,
  toCta,
  toImage,
  toOfferCard,
  toRichText,
  toSeo,
  unpublishedSeo,
} from './content.utils'

const context: MapContext = {
  locale: 'en',
  language: 'en-US',
  localePath: (route) =>
    typeof route === 'string' ? `/en/${route}` : `/en/offers/${route.params.slug}`,
}

const link = {
  kind: 'route' as const,
  route: 'contact',
  href: null,
  offerSlug: null,
  offerLanguage: null,
}

describe('toImage', () => {
  it('keeps an image only when it has a file', () => {
    expect(toImage({ alt: 'A coach', url: 'https://cdn/x.jpg' })).toEqual({
      url: 'https://cdn/x.jpg',
      alt: 'A coach',
    })
    expect(toImage({ alt: 'No file', url: null })).toBeUndefined()
    expect(toImage(null)).toBeUndefined()
  })
})

describe('toCta', () => {
  it('turns the editor link into a ready button', () => {
    expect(toCta({ label: 'Write to us', link }, context)).toEqual({
      label: 'Write to us',
      to: '/en/contact',
      external: false,
    })
  })

  it('drops a button whose target cannot be shown', () => {
    expect(toCta({ label: 'Old', link: { ...link, route: 'nope' } }, context)).toBeUndefined()
    expect(toCta(null, context)).toBeUndefined()
  })
})

describe('toSeo', () => {
  it('prefers the editor SEO fields, then the page own text', () => {
    expect(
      toSeo(
        { title: 'Offers in Berlin', description: null, noIndex: null, image: null },
        { title: 'Offers', description: 'All offers.' },
      ),
    ).toEqual({
      title: 'Offers in Berlin',
      description: 'All offers.',
      image: undefined,
      noIndex: false,
    })
  })

  it('hides an unpublished page from search engines', () => {
    expect(unpublishedSeo('About')).toEqual({ title: 'About', noIndex: true })
  })
})

describe('toRichText', () => {
  it('resolves links and leaves a link without target as plain text', () => {
    const blocks = [
      {
        _type: 'block',
        _key: 'b1',
        markDefs: [
          { ...link, _type: 'link', _key: 'm1' },
          { ...link, _type: 'link', _key: 'm2', route: 'nope' },
        ],
      },
    ]

    expect(toRichText(blocks, context)[0]?.markDefs).toEqual([
      { _type: 'link', _key: 'm1', href: '/en/contact', external: false },
      { _type: 'link', _key: 'm2', href: undefined, external: false },
    ])
  })

  it('is empty without text', () => {
    expect(toRichText(null, context)).toEqual([])
  })
})

describe('toOfferCard', () => {
  it('links the offer and formats its price for the visitor', () => {
    expect(
      toOfferCard(
        { id: 'o1', title: 'Yoga', summary: 'Calm.', slug: 'yoga', image: null, price: 25 },
        context,
      ),
    ).toEqual({
      id: 'o1',
      title: 'Yoga',
      summary: 'Calm.',
      to: '/en/offers/yoga',
      image: undefined,
      price: '€25.00',
    })
  })
})

describe('toBusiness', () => {
  it('prepares the address lines and a dialable phone link', () => {
    expect(
      toBusiness({
        name: 'Landing Page',
        email: 'hi@example.com',
        phone: '+49 30 1234567',
        address: { street: 'Torstraße 1', postalCode: '10119', city: 'Berlin', country: 'DE' },
        socials: null,
      }),
    ).toEqual({
      name: 'Landing Page',
      email: 'hi@example.com',
      phone: { label: '+49 30 1234567', href: 'tel:+49301234567' },
      addressLines: ['Torstraße 1', '10119 Berlin'],
      socials: [],
    })
  })
})
