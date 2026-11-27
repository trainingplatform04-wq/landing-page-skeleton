import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { q } from '~/utils/groqd/groqd.utils'
import { mountComposable, thrownBy } from '~~/tests/helpers/mountComposable'

import { useCmsQuery } from './useCmsQuery'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const titlesQuery = q
  .parameters<{ locale: string; slug: string }>()
  .star.filterByType('faqItem')
  .project({ question: z.string() })

describe('useCmsQuery', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it("sends the query with the visitor's language and returns the checked answer", async () => {
    fetchMock.mockResolvedValue([{ question: 'Yoga' }])
    const titles = await mountComposable(
      () => useCmsQuery('titles', titlesQuery, { slug: 'yoga' }),
      {
        route: '/en',
      },
    )

    expect(titles).toEqual([{ question: 'Yoga' }])
    expect(fetchMock).toHaveBeenCalledWith(titlesQuery.query, { locale: 'en', slug: 'yoga' })
  })

  it('answers 503 when the CMS fails or sends an unexpected shape', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network failure'))
    expect(await thrownBy(() => useCmsQuery('titles', titlesQuery, { slug: 'a' }))).toMatchObject({
      status: 503,
    })

    clearNuxtData()
    fetchMock.mockResolvedValueOnce([{ question: 42 }])
    expect(await thrownBy(() => useCmsQuery('titles', titlesQuery, { slug: 'b' }))).toMatchObject({
      status: 503,
    })
  })

  it('returns null instead when the content is optional', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))
    const titles = await mountComposable(() =>
      useCmsQuery('titles', titlesQuery, { slug: 'c' }, { optional: true }),
    )

    expect(titles).toBeNull()
  })
})
