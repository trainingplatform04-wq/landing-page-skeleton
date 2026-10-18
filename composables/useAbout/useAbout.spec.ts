import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { closing, croppedImage, cta, image, noSeo } from '~~/tests/helpers/cmsData'
import { mountComposable, thrownBy } from '~~/tests/helpers/mountComposable'

import { useAbout } from './useAbout'

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }))
mockNuxtImport('useSanity', () => () => ({ fetch: fetchMock }))

const page = {
  label: 'About me',
  title: "Hi, I'm your coach",
  description: 'Since 2010 I have helped people get stronger.',
  image: image('https://cdn.example/about.jpg', 'Coach with a client'),
  closing: closing(
    'Ready for your first session?',
    'Write to me.',
    cta('Request a free trial', 'contact'),
  ),
  seo: noSeo,
}

describe('useAbout', () => {
  beforeEach(() => {
    clearNuxtData()
    fetchMock.mockReset()
  })

  it('shows the page of the active language with its picture and closing band', async () => {
    fetchMock.mockResolvedValue(page)
    const view = await mountComposable(useAbout, { route: '/en/about' })

    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { locale: 'en' })
    expect(view).toMatchObject({
      label: 'About me',
      title: "Hi, I'm your coach",
      description: 'Since 2010 I have helped people get stronger.',
      image: { url: 'https://cdn.example/about.jpg', alt: 'Coach with a client' },
      closing: { title: 'Ready for your first session?', cta: { label: 'Request a free trial' } },
      seo: { title: "Hi, I'm your coach", image: 'https://cdn.example/about.jpg', noIndex: false },
    })
  })

  it('shares the picture as the editor cropped it', async () => {
    fetchMock.mockResolvedValue({
      ...page,
      image: croppedImage('https://cdn.example/about.jpg', 'Coach with a client'),
    })
    const view = await mountComposable(useAbout, { route: '/en/about' })

    expect(view.seo.image).toBe('https://cdn.example/about.jpg?rect=250,0,500,500')
  })

  it('leaves out the picture and the closing band the editor did not fill in', async () => {
    fetchMock.mockResolvedValue({
      ...page,
      image: null,
      closing: closing(null, 'Alone', null),
    })
    const view = await mountComposable(useAbout, { route: '/about' })

    expect(view.image).toBeUndefined()
    expect(view.closing).toBeUndefined()
  })

  it('renders empty, out of search engines, while the page is unpublished', async () => {
    fetchMock.mockResolvedValue(null)
    const view = await mountComposable(useAbout, { route: '/about' })

    expect(view).toMatchObject({ title: 'About', seo: { noIndex: true } })
  })

  it('is a 503 when the CMS fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network failure'))

    expect(await thrownBy(useAbout)).toMatchObject({ status: 503 })
  })
})
