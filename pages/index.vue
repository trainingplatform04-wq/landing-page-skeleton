<script setup lang="ts">
import { useHome } from '~/composables/useHome/useHome'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const home = await useHome()
const { t } = useI18n()
const localePath = useLocalePath()

usePageMeta(home.seo)

const moreLink = (label: string, to: string) => ({
  label,
  to,
  variant: 'subtle' as const,
  trailingIcon: 'i-lucide-arrow-right',
})
const highlights = home.about?.highlights.map((title) => ({ title, icon: 'i-lucide-check' }))
</script>

<template>
  <div>
    <HomeHero v-bind="home.hero" />

    <UPageSection
      v-if="home.offers.length"
      :title="t('home.featuredOffers')"
      :links="[moreLink(t('home.allOffers'), localePath('offers'))]"
    >
      <UPageGrid>
        <OfferCard v-for="offer in home.offers" :key="offer.id" :offer="offer" />
      </UPageGrid>
    </UPageSection>

    <UPageSection
      v-if="home.about"
      :title="home.about.title"
      :features="highlights"
      orientation="horizontal"
      class="bg-elevated/50"
    >
      <template v-if="home.about.body.length" #description>
        <RichText :value="home.about.body" />
      </template>

      <NuxtImg
        v-if="home.about.portrait"
        :src="home.about.portrait.url"
        :alt="home.about.portrait.alt"
        width="640"
        height="640"
        sizes="sm:100vw lg:50vw"
        class="w-full rounded-lg object-cover shadow-xl"
      />
    </UPageSection>

    <UPageSection v-if="home.testimonials.length" :title="t('testimonials.title')">
      <TestimonialList :testimonials="home.testimonials" />
    </UPageSection>

    <UPageSection
      v-if="home.faq.length"
      :title="t('faq.title')"
      :links="[moreLink(t('faq.all'), localePath('faq'))]"
    >
      <FaqList :items="home.faq" />
    </UPageSection>

    <UPageSection v-if="home.closing">
      <UPageCTA :title="home.closing.title" :description="home.closing.text" variant="subtle">
        <template v-if="home.closing.cta" #links>
          <CtaLink :cta="home.closing.cta" size="xl" />
        </template>
      </UPageCTA>
    </UPageSection>
  </div>
</template>
