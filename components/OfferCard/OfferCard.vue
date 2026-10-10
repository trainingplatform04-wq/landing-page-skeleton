<script setup lang="ts">
import type { OfferCard } from '~/types/content.types'

defineProps<{
  offer: OfferCard
  /** The first card of the page: its image is the page's largest, loaded first. */
  priority?: boolean
}>()
</script>

<template>
  <UPageCard :title="offer.title" :description="offer.summary" :to="offer.to">
    <template v-if="offer.image" #header>
      <NuxtImg
        :src="offer.image.url"
        :alt="offer.image.alt"
        width="480"
        height="320"
        sizes="sm:100vw md:50vw lg:33vw"
        format="webp"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        :preload="priority ? { fetchPriority: 'high' } : false"
        class="aspect-3/2 w-full rounded-md object-cover"
      />
    </template>

    <template v-if="offer.price" #footer>
      <p class="text-muted text-sm">{{ offer.price }}</p>
    </template>
  </UPageCard>
</template>
