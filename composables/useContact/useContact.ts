import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import { toBusiness, toSeo, unpublishedSeo } from '~/utils/content/content.utils'
import { businessFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { Business, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const contactQuery = q.parameters<{ locale: string }>().project((root) => ({
  page: root.star
    .filterByType('contactPage')
    .filterRaw('_id == "contactPage-" + $locale')
    .slice(0)
    .project((page) => ({
      title: z.string(),
      intro: z.string().nullable(),
      successText: z.string().nullable(),
      seo: page.field('seo').project(seoFragment).nullable(true),
    }))
    .nullable(true),
  business: root.star
    .filterByType('businessProfile')
    .filterRaw('_id == "businessProfile"')
    .slice(0)
    .project(businessFragment)
    .nullable(true),
}))

/** Everything the contact page shows (the form itself comes from `useContactForm`). */
export interface ContactView {
  seo: Seo
  title: string
  intro?: string
  successText: string
  business?: Business
}

function toContactView(
  data: InferResultType<typeof contactQuery>,
  defaults: { title: string; successText: string },
): ContactView {
  const business = data.business ? toBusiness(data.business) : undefined
  if (!data.page) return { seo: unpublishedSeo(defaults.title), ...defaults, business }
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
  const { runQuery, context } = useCms()
  const { t } = useI18n()

  const fetchContact = () => runQuery(contactQuery, { parameters: { locale: context.locale } })
  const { data, error } = await useAsyncData(`contact:${context.locale}`, fetchContact)

  if (error.value || !data.value) throw createError({ status: 503, fatal: true })

  return toContactView(data.value, { title: t('nav.contact'), successText: t('contact.form.sent') })
}
