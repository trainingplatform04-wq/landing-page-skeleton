import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { q } from '~/utils/groqd/groqd.utils'
import { mountComposable, thrownBy } from '~~/tests/helpers/mountComposable'

import { useCmsQuery } from './useCmsQuery'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const questionsQuery = q
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
    const questions = await mountComposable(
      () => useCmsQuery('questions', questionsQuery, { slug: 'yoga' }),
      {
        route: '/en',
      },
    )

    expect(questions).toEqual([{ question: 'Yoga' }])
    expect(fetchMock).toHaveBeenCalledWith(questionsQuery.query, { locale: 'en', slug: 'yoga' })
  })

  it('answers 503 when the CMS fails or sends an unexpected shape', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network failure'))
    expect(
      await thrownBy(() => useCmsQuery('questions', questionsQuery, { slug: 'a' })),
    ).toMatchObject({
      status: 503,
    })

    clearNuxtData()
    fetchMock.mockResolvedValueOnce([{ question: 42 }])
    expect(
      await thrownBy(() => useCmsQuery('questions', questionsQuery, { slug: 'b' })),
    ).toMatchObject({
      status: 503,
    })
  })

  it('returns null instead when the content is optional', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))
    const questions = await mountComposable(() =>
      useCmsQuery('questions', questionsQuery, { slug: 'c' }, { optional: true }),
    )

    expect(questions).toBeNull()
  })
})
