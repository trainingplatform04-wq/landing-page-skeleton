<script setup lang="ts">
import type { Cta } from '~/types/content.types'

defineProps<{
  title?: string
  text?: string
  cta?: Cta
}>()
</script>

<template>
  <section
    v-if="title || cta"
    data-section="magazine-closing"
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
      <UButton
        v-if="cta"
        :to="cta.to"
        :label="cta.label"
        size="xl"
        trailing-icon="i-lucide-arrow-right"
        class="w-full justify-center md:w-auto md:shrink-0"
      />
    </UContainer>
  </section>
</template>
