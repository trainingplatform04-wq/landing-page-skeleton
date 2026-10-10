import type { SlugIsUniqueValidator, SlugValidationContext } from 'sanity'

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

/**
 * A slug shared by every language version (a magazine category's `?category=` value): the
 * German and English pages link to each other with the same query, so the versions must agree.
 */
export async function matchesTranslations(
  slug: { current?: string } | undefined,
  { document, getClient }: Pick<SlugValidationContext, 'document' | 'getClient'>,
): Promise<true | string> {
  if (!document || !slug?.current) return true
  const id = document._id.replace(/^drafts\./, '')
  const query = `*[_type == "translation.metadata" && references($id)][0]
    .translations[].value->slug.current`
  const slugs = await getClient({ apiVersion: SANITY_API_VERSION }).fetch<Array<
    string | null
  > | null>(query, { id })
  const other = (slugs ?? []).find((value) => value && value !== slug.current)
  return other ? `Use "${other}", as in the other language: the address is shared.` : true
}
