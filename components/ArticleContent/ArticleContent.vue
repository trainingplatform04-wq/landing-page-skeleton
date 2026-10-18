<script setup lang="ts">
import { useArticle } from '~/composables/useArticle/useArticle'
import { useArticleSlugs } from '~/composables/useArticleSlugs/useArticleSlugs'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

// Never hydrated on a page load; ArticleEnhancer adds the interactions in the browser.
const article = await useArticle()
const setI18nParams = useSetI18nParams()

usePageMeta(article.seo)
// The language switcher and hreflang link this article's own slug in each language.
setI18nParams(article.slugs)
useArticleSlugs().value = article.slugs
useSeoMeta({ ogType: 'article', articlePublishedTime: article.dateTime })
useSchemaOrg([
  defineArticle({
    headline: article.title,
    description: article.excerpt,
    image: article.cover?.url,
    datePublished: article.dateTime,
    author: article.author ? { name: article.author.name } : undefined,
  }),
  ...article.faq.map(({ question, answer }) =>
    defineQuestion({ name: question, acceptedAnswer: answer }),
  ),
])
</script>

<template>
  <div>
    <ArticleHero
      :title="article.title"
      :excerpt="article.excerpt"
      :magazine-to="article.magazineTo"
      :category="article.category"
      :author="article.author"
      :date="article.date"
      :date-time="article.dateTime"
      :reading-minutes="article.readingMinutes"
      :cover="article.cover"
    />
    <ArticleTakeaways :items="article.takeaways" />
    <ArticleBody :toc="article.toc" :body="article.body" />
    <ArticleFaq :items="article.faq" />
    <ArticleAuthor
      v-if="article.author"
      :author="article.author"
      :magazine-to="article.magazineTo"
    />
    <ArticleRelated :posts="article.related" />
    <ClosingBand v-if="article.closing" v-bind="article.closing" section="article-closing" />
  </div>
</template>
