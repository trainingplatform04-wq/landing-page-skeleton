import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useContactForm } from './useContactForm'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
mockNuxtImport('$fetch', () => post)

const FORM_SERVICE = 'https://forms.example.eu/f/abc'

const message = { name: 'Ada', email: 'ada@example.com', message: 'Hello', website: '' }

/** Sets NUXT_PUBLIC_CONTACT_FORM_ACTION for the test, as the deployment would. */
const configureFormService = (action: string) => {
  useRuntimeConfig().public.contactFormAction = action
}

describe('useContactForm', () => {
  afterEach(() => {
    configureFormService('')
    post.mockReset()
  })

  it('sends the message to the form service and thanks the visitor', async () => {
    configureFormService(FORM_SERVICE)
    post.mockResolvedValue({ ok: true })
    const form = await mountComposable(async () => useContactForm('Thanks!'), {
      route: '/en/contact',
    })

    expect(await form.send(message)).toBe(true)
    const [url, options] = post.mock.calls[0] ?? []
    expect(url).toBe(FORM_SERVICE)
    expect(options.method).toBe('POST')
    expect(Object.fromEntries(options.body)).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello',
    })
    expect(useToast().toasts.value.at(-1)).toMatchObject({ title: 'Thanks!', color: 'success' })
  })

  it('tells the visitor when sending failed', async () => {
    configureFormService(FORM_SERVICE)
    post.mockRejectedValue(new Error('Offline'))
    const form = await mountComposable(async () => useContactForm('Thanks!'), {
      route: '/en/contact',
    })

    expect(await form.send(message)).toBe(false)
    expect(useToast().toasts.value.at(-1)).toMatchObject({ color: 'error' })
  })

  it('is disabled without a configured service', async () => {
    const form = await mountComposable(async () => useContactForm('Thanks!'))

    expect(form.isEnabled).toBe(false)
  })
})
