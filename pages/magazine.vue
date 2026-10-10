<script setup lang="ts">
import { useMagazine } from '~/composables/useMagazine/useMagazine'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

// The category and the page live in the query: a new query is a new page view.
definePageMeta({ key: (route) => route.fullPath })

const magazine = await useMagazine()

usePageMeta(magazine.seo)
</script>

<template>
  <div>
    <LazyMagazineHero
      hydrate-never
      :kicker="magazine.kicker"
      :title="magazine.title"
      :intro="magazine.intro"
    />
    <LazyMagazineFeatured hydrate-never :posts="magazine.featured" />
    <LazyMagazineGrid
      hydrate-never
      :tabs="magazine.tabs"
      :posts="magazine.posts"
      :pages="magazine.pages"
      :page="magazine.page"
      :filtered="magazine.filtered"
      :all-to="magazine.allTo"
      :has-featured="magazine.featured.length > 0"
    />
    <LazyMagazineClosing v-if="magazine.closing" hydrate-never v-bind="magazine.closing" />
  </div>
</template>
