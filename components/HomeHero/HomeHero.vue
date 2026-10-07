<script setup lang="ts">
import type { Cta, Image } from '~/types/content.types'

defineProps<{
  title: string
  text?: string
  image?: Image
  cta?: Cta
}>()
</script>

<template>
  <UPageHero :title="title" :description="text" :orientation="image ? 'horizontal' : 'vertical'">
    <template v-if="cta" #links>
      <CtaLink :cta="cta" size="xl" />
    </template>

    <NuxtImg
      v-if="image"
      :src="image.url"
      :alt="image.alt"
      width="800"
      height="600"
      sizes="sm:100vw lg:50vw"
      preload
      class="w-full rounded-lg object-cover shadow-xl"
    />
  </UPageHero>
</template>
