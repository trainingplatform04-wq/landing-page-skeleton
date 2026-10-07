import type { SlugIsUniqueValidator } from 'sanity'

import { SANITY_API_VERSION } from '../../../constants/sanity.constants'

/**
 * Sanity's default check refuses the same slug in two languages. Ours only compares
 * documents of the same type and language, so `/angebote/yoga` and `/en/offers/yoga` coexist.
 */
export const isUniqueInTypeAndLanguage: SlugIsUniqueValidator = async (
  slug,
  { document, getClient },
) => {
  if (!document) return true
  const id = document._id.replace(/^drafts\./, '')
  const query = `!defined(*[
    _type == $type && language == $language && slug.current == $slug
    && !(_id in [$id, "drafts." + $id])
  ][0]._id)`
  return getClient({ apiVersion: SANITY_API_VERSION }).fetch<boolean>(query, {
    type: document._type,
    language: document.language ?? null,
    slug,
    id,
  })
}
