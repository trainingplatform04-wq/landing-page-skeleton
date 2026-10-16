import { z } from 'zod'

import { useCms } from '~/composables/useCms/useCms'
import {
  type MapContext,
  toCta,
  toImage,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'
import { ctaFragment, imageFragment, q, seoFragment } from '~/utils/groqd/groqd.utils'

import type { Cta, Image, Seo } from '~/types/content.types'
import type { InferResultType } from 'groqd'

const aboutQuery = q
  .parameters<{ locale: string }>()
  .star.filterByType('aboutPage')
  .filterRaw('_id == "aboutPage-" + $locale')
  .slice(0)
  .project((page) => ({
    label: z.string().nullable(),
    title: z.string(),
    description: z.string().nullable(),
    image: page.field('image').project(imageFragment).nullable(true),
    closingTitle: z.string().nullable(),
    closingText: z.string().nullable(),
    cta: page.field('cta').project(ctaFragment).nullable(true),
    seo: page.field('seo').project(seoFragment).nullable(true),
  }))
  .nullable(true)

/** Everything the About page shows. */
export interface AboutView {
  seo: Seo
  label?: string
  title: string
  description?: string
  image?: Image
  closing?: { title?: string; text?: string; cta?: Cta }
}

type AboutData = NonNullable<InferResultType<typeof aboutQuery>>

function toAboutView(page: AboutData, context: MapContext): AboutView {
  const cta = toCta(page.cta, context)
  // Shown with a title or a button; a text alone has nothing to lead to.
  const closing =
    page.closingTitle || cta
      ? { title: page.closingTitle ?? undefined, text: page.closingText ?? undefined, cta }
      : undefined
  return {
    seo: toSeo(page.seo, {
      title: page.title,
      description: page.description,
      image: page.image?.url ?? undefined,
    }),
    label: page.label ?? undefined,
    title: page.title,
    description: page.description ?? undefined,
    image: toImage(page.image),
    closing,
  }
}

/** The About page in the active language: 503 on a CMS error, empty while unpublished. */
export async function useAbout(): Promise<AboutView> {
  const { runQuery, context } = useCms()
  const { t } = useI18n()

  const fetchAbout = () => runQuery(aboutQuery, { parameters: { locale: context.locale } })
  const { data, error } = await useAsyncData(`about:${context.locale}`, fetchAbout)

  if (error.value) throw createError({ status: 503, fatal: true })
  if (!data.value) return { seo: unpublishedSeo(t('nav.about')), title: t('nav.about') }

  return toAboutView(data.value, context)
}
