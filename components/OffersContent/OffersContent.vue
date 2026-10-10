<script setup lang="ts">
import { useOffers } from '~/composables/useOffers/useOffers'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

// The offers page's content: rendered on the server only (its page never hydrates it), so its
// data and code stay out of the page's first JavaScript.
const offersPage = await useOffers()
const { t } = useI18n()

usePageMeta(offersPage.seo)
</script>

<template>
  <UContainer>
    <UPageHeader :title="offersPage.title" :description="offersPage.intro" />

    <UPageBody>
      <UEmpty
        v-if="!offersPage.offers.length"
        icon="i-lucide-package-open"
        :title="t('offers.empty')"
      />
      <UPageGrid v-else>
        <OfferCard
          v-for="(offer, index) in offersPage.offers"
          :key="offer.id"
          :offer="offer"
          :priority="index === 0"
        />
      </UPageGrid>

      <CtaLink v-if="offersPage.cta" :cta="offersPage.cta" class="mt-8" />
    </UPageBody>
  </UContainer>
</template>
