<script setup lang="ts">
import { useAbout } from '~/composables/useAbout/useAbout'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

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
    <ClosingBand v-if="about.closing" v-bind="about.closing" section="about-closing" />
  </div>
</template>
