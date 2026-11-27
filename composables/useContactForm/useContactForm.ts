import { useAnalytics } from '~/composables/useAnalytics/useAnalytics'
import { EMAILJS_SEND_PATH } from '~/constants/contact.constants'

/** What the visitor writes in the contact form. */
export interface ContactMessage {
  name: string
  email: string
  message: string
  /** The honeypot: always empty for a person. */
  website: string
}

/**
 * Sends the contact form to EmailJS (`NUXT_PUBLIC_EMAILJS_*`) in the background: no server
 * code of ours, no page reload. EmailJS emails the owner and sends the visitor the linked
 * auto-reply, both from the owner's mailbox. Without all three ids the page shows an email link.
 */
export function useContactForm(successText: string) {
  const { public: config } = useRuntimeConfig()
  const { t } = useI18n()
  const toast = useToast()
  const { track } = useAnalytics()
  const { serviceId, templateId, publicKey, apiHost } = config.emailjs

  const thank = () =>
    toast.add({ title: successText, color: 'success', icon: 'i-lucide-circle-check' })

  /** `true` when the message was sent, or silently dropped as a bot's. */
  async function send(message: ContactMessage) {
    // A bot filled the hidden field: it sees success, and the auto-reply never goes out from
    // the owner's mailbox to an address it typed.
    if (message.website) {
      thank()
      return true
    }

    try {
      // The one call that is not Sanity: EmailJS's browser SDK is not needed for one request
      // (CODING_STANDARDS § 2).
      // eslint-disable-next-line no-restricted-globals
      await $fetch(`${apiHost}${EMAILJS_SEND_PATH}`, {
        method: 'POST',
        responseType: 'text',
        body: {
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: { name: message.name, email: message.email, message: message.message },
        },
      })
      thank()
      track('contact_submit')
      return true
    } catch {
      toast.add({ title: t('contact.form.error'), color: 'error', icon: 'i-lucide-circle-alert' })
      return false
    }
  }

  return { isEnabled: Boolean(serviceId && templateId && publicKey), send }
}
