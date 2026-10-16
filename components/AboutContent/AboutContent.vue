<script setup lang="ts">
import { useAbout } from '~/composables/useAbout/useAbout'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

// The About page's content: rendered on the server only (its page never hydrates it), so its
// data, sections and code stay out of the page's first JavaScript.
const about = await useAbout()

usePageMeta(about.seo)
</script>

<template>
  <div>
    <AboutHero
      :label="about.label"
      :title="about.title"
      :description="about.description"
      :image="about.image"
    />
    <MagazineClosing v-if="about.closing" v-bind="about.closing" section="about-closing" />
  </div>
</template>
