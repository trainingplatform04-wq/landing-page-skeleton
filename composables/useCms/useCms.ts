import { makeSafeQueryRunner } from 'groqd'

import type { MapContext } from '~/utils/content/content.utils'

/**
 * What every page composable needs: `runQuery` runs a groqd query with the site's Sanity
 * client (the result is validated when it arrives), `context` tells the mappers the
 * visitor's language.
 */
export function useCms() {
  const sanity = useSanity()
  const { locale, localeProperties } = useI18n()
  const localePath = useLocalePath()

  const runQuery = makeSafeQueryRunner((query, { parameters }) => sanity.fetch(query, parameters))

  const context: MapContext = {
    locale: locale.value,
    language: localeProperties.value.language ?? locale.value,
    localePath,
  }

  return { runQuery, context }
}
