<script setup lang="ts">
import { useMagazine } from '~/composables/useMagazine/useMagazine'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const magazine = await useMagazine()

usePageMeta(magazine.seo)
</script>

<template>
  <div>
    <MagazineHero :label="magazine.label" :title="magazine.title" :intro="magazine.intro" />
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
    <ClosingBand v-if="magazine.closing" v-bind="magazine.closing" section="magazine-closing" />
  </div>
</template>
