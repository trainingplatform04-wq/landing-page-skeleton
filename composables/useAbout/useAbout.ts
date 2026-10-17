import { type AboutData, aboutQuery } from '~/composables/useAbout/about.query'
import { useCmsQuery } from '~/composables/useCmsQuery/useCmsQuery'
import { useMapContext } from '~/composables/useMapContext/useMapContext'
import {
  type MapContext,
  toClosing,
  toImage,
  toSeo,
  unpublishedSeo,
} from '~/utils/content/content.utils'

import type { Closing, Image, Seo } from '~/types/content.types'

export interface AboutView {
  seo: Seo
  label?: string
  title: string
  description?: string
  image?: Image
  closing?: Closing
}

function toAboutView(page: AboutData, context: MapContext): AboutView {
  return {
    seo: toSeo(page.seo, {
      title: page.title,
      description: page.description,
      image: page.image?.url,
    }),
    label: page.label ?? undefined,
    title: page.title,
    description: page.description ?? undefined,
    image: toImage(page.image),
    closing: toClosing(page.closing, context),
  }
}

/** The About page in the active language: 503 on a CMS error, empty while unpublished. */
export async function useAbout(): Promise<AboutView> {
  const context = useMapContext()
  const { t } = useI18n()

  const page = await useCmsQuery('about', aboutQuery)
  if (!page) return { seo: unpublishedSeo(t('nav.about')), title: t('nav.about') }
  return toAboutView(page, context)
}
