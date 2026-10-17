<script setup lang="ts">
import type { Cta } from '~/types/content.types'

defineProps<{
  title?: string
  text?: string
  cta?: Cta
  /** The page it closes, named for the design gate's screenshots. */
  section: 'magazine-closing' | 'article-closing' | 'about-closing'
}>()
</script>

<template>
  <section
    v-if="title || cta"
    :data-section="section"
    class="bg-inverted text-inverted py-12 md:py-16"
  >
    <UContainer class="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
      <div>
        <h2
          v-if="title"
          class="text-4xl leading-none font-black break-words hyphens-auto uppercase md:text-5xl"
        >
          {{ title }}
        </h2>
        <p v-if="text" class="text-dimmed mt-4 text-sm leading-6 md:text-base">{{ text }}</p>
      </div>
      <CtaLink
        v-if="cta"
        :cta="cta"
        size="xl"
        trailing-icon="i-lucide-arrow-right"
        class="h-12 w-full justify-center px-7 md:w-auto md:shrink-0"
      />
    </UContainer>
  </section>
</template>
