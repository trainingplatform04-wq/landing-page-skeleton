import { describe, expect, it } from 'vitest'

import { richTextField } from './groqd.utils'

describe('richTextField', () => {
  it('accepts Portable Text blocks and keeps their fields', () => {
    const [, parser] = richTextField('body')
    const blocks = [{ _type: 'block', _key: 'b1', style: 'normal', children: [] }]

    expect(parser.parse(blocks)).toEqual(blocks)
    expect(parser.parse(null)).toBeNull()
    expect(() => parser.parse([{ style: 'normal' }])).toThrow()
  })
})
