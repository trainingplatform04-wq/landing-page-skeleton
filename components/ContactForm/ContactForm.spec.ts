import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ContactForm from './ContactForm.vue'

const mountForm = (send = vi.fn().mockResolvedValue(true)) =>
  mountSuspended(ContactForm, { route: '/en/contact', props: { send, privacyPath: '/en/privacy' } })

describe('ContactForm', () => {
  it('labels every field and links the privacy policy', async () => {
    const wrapper = await mountForm()

    for (const label of ['Name', 'Email', 'Message']) {
      const field = wrapper.findAll('label').find((node) => node.text().startsWith(label))
      const id = field?.attributes('for')
      expect(id && wrapper.find(`#${id}`).exists()).toBe(true)
    }
    expect(wrapper.find('a[href="/en/privacy"]').text()).toBe('Privacy')
  })

  it('does not send an incomplete form and says what is missing', async () => {
    const send = vi.fn().mockResolvedValue(true)
    const wrapper = await mountForm(send)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(send).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Please fill this in')
    expect(wrapper.text()).toContain('Please agree so we can answer you')
  })

  it('sends a complete form and empties it once sent', async () => {
    const send = vi.fn().mockResolvedValue(true)
    const wrapper = await mountForm(send)

    await wrapper.find('input[autocomplete="name"]').setValue('Ada')
    await wrapper.find('input[type="email"]').setValue('ada@example.com')
    await wrapper.find('textarea').setValue('Hello')
    await wrapper.find('button[role="checkbox"]').trigger('click')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ada', email: 'ada@example.com', message: 'Hello' }),
    )
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
  })

  it('says in the visitor language when a message is too long', async () => {
    const send = vi.fn().mockResolvedValue(true)
    const wrapper = await mountForm(send)

    await wrapper.find('textarea').setValue('x'.repeat(2001))
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(send).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('At most 2000 characters')
  })
})
