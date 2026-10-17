<script setup lang="ts">
import type { Image } from '~/types/content.types'

defineProps<{
  title: string
  label?: string
  description?: string
  image?: Image
}>()
</script>

<template>
  <section data-section="about-hero" class="pt-8 pb-14 md:pt-12 md:pb-20">
    <NuxtImg
      v-if="image"
      :src="image.url"
      :style="{ objectPosition: image.position }"
      :alt="image.alt"
      width="1120"
      height="480"
      sizes="sm:100vw md:100vw xl:1120px"
      format="webp"
      quality="70"
      fetchpriority="high"
      :preload="{ fetchPriority: 'high' }"
      class="mb-8 aspect-4/3 w-full object-cover md:mx-auto md:mb-12 md:aspect-video md:w-[calc(100%-3rem)] md:max-w-[1120px] md:rounded-lg xl:aspect-21/9"
    />

    <div class="mx-auto w-[calc(100%-2rem)] max-w-[760px] text-center md:w-[calc(100%-3rem)]">
      <p v-if="label" class="text-primary text-xs font-bold uppercase">{{ label }}</p>
      <h1
        class="mt-4 text-[32px] leading-[1.05] font-black break-words hyphens-auto uppercase md:text-[40px] xl:text-[56px]"
      >
        {{ title }}
      </h1>
      <p v-if="description" class="text-muted mx-auto mt-5 max-w-160 text-xl leading-8">
        {{ description }}
      </p>
    </div>
  </section>
</template>
