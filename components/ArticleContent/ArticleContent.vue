<script setup lang="ts">
import { useArticle } from '~/composables/useArticle/useArticle'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'
import { ARTICLE_SLUGS_STATE } from '~/constants/article.constants'

// An article's content. On a page load it renders on the server only (its page never hydrates
// it), so its data, sections and code stay out of the page's first JavaScript; after a
// client-side navigation it renders in the browser. ArticleEnhancer adds the interactions.
const article = await useArticle()
const setI18nParams = useSetI18nParams()

usePageMeta(article.seo)
// The language switcher and hreflang link this article's own slug in each language. The
// slugs also go to the page's state (set on every render, so they always belong to this
// article), from which ArticleEnhancer hands them to the switcher after a page load.
setI18nParams(article.slugs)
useState(ARTICLE_SLUGS_STATE).value = article.slugs
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
      :reading-time="article.readingTime"
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
    <MagazineClosing v-bind="article.closing" section="article-closing" />
  </div>
</template>
