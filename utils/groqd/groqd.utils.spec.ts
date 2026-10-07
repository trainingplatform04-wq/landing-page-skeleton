import { describe, expect, it } from 'vitest'

import { offerCardFragment, q, richTextField } from './groqd.utils'

describe('q', () => {
  it('builds plain GROQ from TypeScript', () => {
    const query = q.star.filterByType('offer').project(offerCardFragment)

    expect(query.query).toContain('*[_type == "offer"]')
    expect(query.query).toContain('"slug": slug.current')
  })
})

describe('richTextField', () => {
  it('adds the linked offer and the image URL to the rich text', () => {
    const [groq] = richTextField('body')

    expect(groq).toContain('body[]{ ...')
    expect(groq).toContain('"offerSlug": reference->slug.current')
    expect(groq).toContain('"url": asset->url')
  })

  it('accepts Portable Text blocks and keeps their fields', () => {
    const [, parser] = richTextField('body')
    const blocks = [{ _type: 'block', _key: 'b1', style: 'normal', children: [] }]

    expect(parser.parse(blocks)).toEqual(blocks)
    expect(parser.parse(null)).toBeNull()
    expect(() => parser.parse([{ style: 'normal' }])).toThrow()
  })
})
