/** What the visitor writes in the contact form. */
export interface ContactMessage {
  name: string
  email: string
  message: string
  /** The honeypot: always empty for a person. */
  website: string
}

/**
 * Sends the contact form to the EU form service (`NUXT_PUBLIC_CONTACT_FORM_ACTION`) in the
 * background: no server code of ours, no page reload. The service emails the site owner.
 * A toast tells the visitor whether it worked. Without a configured service the contact
 * page shows an email link instead.
 */
export function useContactForm(successText: string) {
  const { public: config } = useRuntimeConfig()
  const { t } = useI18n()
  const toast = useToast()
  const action = config.contactFormAction

  /** `true` when the message was sent. */
  async function send(message: ContactMessage) {
    const body = new FormData()
    body.append('name', message.name)
    body.append('email', message.email)
    body.append('message', message.message)

    try {
      // The one call that is not Sanity: the form service has no SDK (CODING_STANDARDS § 2).
      // eslint-disable-next-line no-restricted-globals
      await $fetch(action, { method: 'POST', body, headers: { Accept: 'application/json' } })
      toast.add({ title: successText, color: 'success', icon: 'i-lucide-circle-check' })
      return true
    } catch {
      toast.add({ title: t('contact.form.error'), color: 'error', icon: 'i-lucide-circle-alert' })
      return false
    }
  }

  return { isEnabled: Boolean(action), send }
}
