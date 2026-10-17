import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { type ContactData, contactQuery } from '~/composables/useContact/contact.query'
import { toBusiness, toSeo, unpublishedSeo } from '~/utils/content/content.utils'

import type { Business, Seo } from '~/types/content.types'

/** Everything the contact page shows (the form itself comes from `useContactForm`). */
export interface ContactView {
  seo: Seo
  title: string
  intro?: string
  successText: string
  business?: Business
}

function toContactView(
  data: ContactData | null,
  defaults: { title: string; successText: string },
): ContactView {
  const business = data?.business ? toBusiness(data.business) : undefined
  if (!data?.page) return { seo: unpublishedSeo(defaults.title), ...defaults, business }
  return {
    seo: toSeo(data.page.seo, { title: data.page.title, description: data.page.intro }),
    title: data.page.title,
    intro: data.page.intro ?? undefined,
    successText: data.page.successText ?? defaults.successText,
    business,
  }
}

/** The contact page and the business facts: 503 on a CMS error, empty while unpublished. */
export async function useContact(): Promise<ContactView> {
  const { t } = useI18n()

  const data = await useCmsQuery('contact', contactQuery)
  return toContactView(data, { title: t('nav.contact'), successText: t('contact.form.sent') })
}
