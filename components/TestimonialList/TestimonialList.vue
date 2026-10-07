<script setup lang="ts">
import type { Testimonial } from '~/types/content.types'

defineProps<{ testimonials: Testimonial[] }>()
</script>

<template>
  <UPageColumns>
    <UPageCard v-for="testimonial in testimonials" :key="testimonial.id" variant="subtle">
      <blockquote class="text-toned">“{{ testimonial.quote }}”</blockquote>
      <template #footer>
        <UUser
          :name="testimonial.author"
          :avatar="
            testimonial.photo
              ? { src: testimonial.photo.url, alt: testimonial.photo.alt }
              : undefined
          "
        />
      </template>
    </UPageCard>
  </UPageColumns>
</template>
