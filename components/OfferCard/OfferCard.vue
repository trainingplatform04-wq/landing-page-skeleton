<script setup lang="ts">
import type { OfferCard } from '~/types/content.types'

defineProps<{ offer: OfferCard }>()
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
        class="aspect-3/2 w-full rounded-md object-cover"
      />
    </template>

    <template v-if="offer.price" #footer>
      <p class="text-muted text-sm">{{ offer.price }}</p>
    </template>
  </UPageCard>
</template>
