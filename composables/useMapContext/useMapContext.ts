import type { MapContext } from '~/utils/content/content.utils'

/** The visitor's language, as the mappers need it (locale, formatting language, localized paths). */
export function useMapContext(): MapContext {
  const { locale, localeProperties } = useI18n()
  const localePath = useLocalePath()

  return {
    locale: locale.value,
    language: localeProperties.value.language ?? locale.value,
    localePath,
  }
}
