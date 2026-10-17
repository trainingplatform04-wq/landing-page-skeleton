import { type IGroqBuilder, makeSafeQueryRunner, type QueryConfig } from 'groqd'

/** What a query asks for besides the visitor's language, which is always sent as `$locale`. */
type CmsParams<Config extends QueryConfig> = Omit<NonNullable<Config['parameters']>, 'locale'>

/**
 * The only door to the CMS: runs a groqd query with the site's Sanity client, in the visitor's
 * language, once on the server (`useAsyncData`), and validates the answer. A CMS error answers
 * 503, unless `optional`: then it returns `null` and the caller shows what the code knows.
 */
export async function useCmsQuery<Result, Config extends QueryConfig>(
  name: string,
  query: IGroqBuilder<Result, Config>,
  params?: CmsParams<Config>,
  { optional = false } = {},
): Promise<Result | null> {
  const sanity = useSanity()
  const { locale } = useI18n()
  const run = makeSafeQueryRunner((groq, { parameters }) => sanity.fetch(groq, parameters))

  // groqd types the parameters a query declares; every query here declares `locale`.
  const parameters = { locale: locale.value, ...params } as Config['parameters']
  // One cache entry per query and parameters: `article:de:protein-ohne-pulver`.
  const key = [name, locale.value, ...Object.values(params ?? {})].join(':')

  const { data, error } = await useAsyncData(key, () => run(query, { parameters }))
  if (error.value && !optional) throw createError({ status: 503, fatal: true })
  // Nuxt types `data` through its `pick` option, which TypeScript can't follow for a generic result.
  return (data.value ?? null) as Result | null
}
