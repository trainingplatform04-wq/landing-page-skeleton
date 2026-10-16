<script setup lang="ts">
import type { Cta } from '~/types/content.types'

defineProps<{
  title?: string
  text?: string
  cta?: Cta
  /** The band closes the magazine, every article and the About page: the design gate compares each. */
  section?: 'magazine-closing' | 'article-closing' | 'about-closing'
}>()
</script>

<template>
  <section
    v-if="title || cta"
    :data-section="section ?? 'magazine-closing'"
    class="bg-neutral-900 py-12 text-white md:py-16"
  >
    <UContainer class="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
      <div>
        <h2
          v-if="title"
          class="text-4xl leading-none font-black break-words hyphens-auto uppercase md:text-5xl"
        >
          {{ title }}
        </h2>
        <p v-if="text" class="mt-4 text-sm leading-6 text-neutral-400 md:text-base">{{ text }}</p>
      </div>
      <UButton
        v-if="cta"
        :to="cta.to"
        :label="cta.label"
        size="xl"
        trailing-icon="i-lucide-arrow-right"
        class="h-12 w-full justify-center px-7 md:w-auto md:shrink-0"
        data-track="cta_click"
        :data-track-label="cta.label"
      />
    </UContainer>
  </section>
</template>
