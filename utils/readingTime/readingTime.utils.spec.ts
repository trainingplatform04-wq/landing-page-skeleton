import { describe, expect, it } from 'vitest'

import { readingMinutes } from './readingTime.utils'

const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ')

describe('readingMinutes', () => {
  it('counts the words of paragraphs and blocks, 200 per minute, rounded up', () => {
    const body = [{ children: [{ text: words(150) }, { text: words(40) }] }, { text: words(20) }]

    expect(readingMinutes(body)).toBe(2)
  })

  it('is at least one minute, even for an empty article', () => {
    expect(readingMinutes([])).toBe(1)
    expect(readingMinutes([{ text: null, children: null }])).toBe(1)
  })
})
