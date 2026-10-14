<script setup lang="ts">
import { useAnalytics } from '~/composables/useAnalytics/useAnalytics'
import { useOffer } from '~/composables/useOffer/useOffer'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const offer = await useOffer()
const { t } = useI18n()
const setI18nParams = useSetI18nParams()

usePageMeta(offer.seo)
// The language switcher and hreflang link this offer's own slug in each language.
setI18nParams(offer.slugs)

const slug = String(useRoute().params.slug ?? '')
const { track } = useAnalytics()
onMounted(() => track('offer_view', { offer: slug }))
</script>

<template>
  <div>
    <UPageHero
      :title="offer.title"
      :description="offer.summary"
      :orientation="offer.image ? 'horizontal' : 'vertical'"
    >
      <template v-if="offer.cta" #links>
        <CtaLink :cta="offer.cta" size="xl" track="offer_cta" :data-track-offer="slug" />
      </template>

      <NuxtImg
        v-if="offer.image"
        :src="offer.image.url"
        :alt="offer.image.alt"
        width="800"
        height="600"
        sizes="sm:100vw lg:50vw"
        format="webp"
        fetchpriority="high"
        :preload="{ fetchPriority: 'high' }"
        class="w-full rounded-lg object-cover shadow-xl"
      />
    </UPageHero>

    <UPageSection>
      <p v-if="offer.price" class="text-highlighted text-lg font-semibold">
        {{ t('offers.price', { price: offer.price }) }}
      </p>
      <RichText :value="offer.body" />
    </UPageSection>
  </div>
</template>
