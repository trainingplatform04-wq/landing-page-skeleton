<script setup lang="ts">
defineProps<{
  title: string
  label?: string
  intro?: string
}>()
</script>

<template>
  <section
    data-section="magazine-hero"
    class="border-default bg-inverted text-inverted flex min-h-70 items-center border-b py-7 md:py-10 xl:min-h-90 xl:py-14"
  >
    <UContainer class="w-full">
      <p v-if="label" class="text-primary text-xs font-bold uppercase">{{ label }}</p>
      <h1
        class="mt-4 max-w-5xl text-[44px] leading-[0.95] font-black break-words hyphens-auto uppercase md:text-6xl xl:text-[80px]"
      >
        {{ title }}
      </h1>
      <p v-if="intro" class="text-dimmed mt-5 max-w-2xl text-sm leading-6 md:text-lg md:leading-8">
        {{ intro }}
      </p>
    </UContainer>
  </section>
</template>
