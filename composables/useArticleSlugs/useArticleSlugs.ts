/**
 * The current article's slug in each language. ArticleContent (never hydrated) sets it on the
 * server; ArticleEnhancer reads it in the browser and hands it to the language switcher.
 */
export function useArticleSlugs() {
  return useState<Record<string, { slug: string }> | undefined>('article-slugs')
}
