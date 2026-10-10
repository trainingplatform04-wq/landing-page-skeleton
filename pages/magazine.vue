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
    <MagazineHero :kicker="magazine.kicker" :title="magazine.title" :intro="magazine.intro" />
    <MagazineFeatured :posts="magazine.featured" />
    <MagazineGrid
      :tabs="magazine.tabs"
      :posts="magazine.posts"
      :pages="magazine.pages"
      :page="magazine.page"
      :filtered="magazine.filtered"
      :all-to="magazine.allTo"
      :has-featured="magazine.featured.length > 0"
    />
    <MagazineClosing v-if="magazine.closing" v-bind="magazine.closing" />
  </div>
</template>
