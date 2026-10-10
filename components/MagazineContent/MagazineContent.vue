<script setup lang="ts">
import { useMagazine } from '~/composables/useMagazine/useMagazine'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

// The magazine page's content: rendered on the server only (its page never hydrates it), so
// its data, sections and code stay out of the page's first JavaScript.
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
