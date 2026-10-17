<script setup lang="ts">
import { useLayout } from '~/composables/useLayout/useLayout'

const layout = useLayout()
// The footer is never hydrated: a new language renders a new one, in that language.
const { locale } = useI18n()
</script>

<template>
  <div>
    <LazyAppHeader
      hydrate-on-idle
      :site-name="layout.siteName"
      :home-path="layout.homePath"
      :navigation="layout.navigation"
    />
    <UMain>
      <slot />
    </UMain>
    <LazySiteFooter :key="locale" hydrate-never />
    <LazyConsentBanner hydrate-never />
  </div>
</template>
