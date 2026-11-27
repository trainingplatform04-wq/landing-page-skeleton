import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { mountComposable } from '~~/tests/helpers/mountComposable'

import { useContactForm } from './useContactForm'

const { post } = vi.hoisted(() => ({ post: vi.fn() }))
mockNuxtImport('$fetch', () => post)

const EMAILJS = { serviceId: 'service_test', templateId: 'template_test', publicKey: 'key_test' }

const message = { name: 'Ada', email: 'ada@example.com', message: 'Hello', website: '' }

/** Sets NUXT_PUBLIC_EMAILJS_* for the test, as the deployment would. */
const configureEmailJs = (ids: Partial<typeof EMAILJS>) => {
  Object.assign(useRuntimeConfig().public.emailjs, ids)
}

const mountForm = () =>
  mountComposable(async () => useContactForm('Thanks!'), { route: '/en/contact' })

describe('useContactForm', () => {
  afterEach(() => {
    configureEmailJs({ serviceId: '', templateId: '', publicKey: '' })
    post.mockReset()
  })

  it('sends the message to EmailJS and thanks the visitor', async () => {
    configureEmailJs(EMAILJS)
    post.mockResolvedValue('OK')
    const form = await mountForm()

    expect(await form.send(message)).toBe(true)
    const [url, options] = post.mock.calls[0] ?? []
    expect(url).toBe('https://api.emailjs.com/api/v1.0/email/send')
    expect(options.method).toBe('POST')
    expect(options.body).toEqual({
      service_id: 'service_test',
      template_id: 'template_test',
      user_id: 'key_test',
      template_params: { name: 'Ada', email: 'ada@example.com', message: 'Hello' },
    })
    expect(useToast().toasts.value.at(-1)).toMatchObject({ title: 'Thanks!', color: 'success' })
  })

  it('drops a message whose honeypot is filled, and still thanks the sender', async () => {
    configureEmailJs(EMAILJS)
    const form = await mountForm()

    expect(await form.send({ ...message, website: 'https://spam.example' })).toBe(true)
    expect(post).not.toHaveBeenCalled()
    expect(useToast().toasts.value.at(-1)).toMatchObject({ title: 'Thanks!', color: 'success' })
  })

  it('tells the visitor when sending failed', async () => {
    configureEmailJs(EMAILJS)
    post.mockRejectedValue(new Error('Quota reached'))
    const form = await mountForm()

    expect(await form.send(message)).toBe(false)
    expect(useToast().toasts.value.at(-1)).toMatchObject({ color: 'error' })
  })

  it('is disabled while any EmailJS id is missing', async () => {
    configureEmailJs({ ...EMAILJS, templateId: '' })
    const form = await mountComposable(async () => useContactForm('Thanks!'))

    expect(form.isEnabled).toBe(false)
  })
})
