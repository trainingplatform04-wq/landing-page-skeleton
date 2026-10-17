<script setup lang="ts">
import { de, en } from '@nuxt/ui/locale'

import { useSiteHead } from '~/composables/useSiteHead/useSiteHead'

useSiteHead()

// Nuxt UI's own labels (color switch, pagination, …) in the site's language.
const { locale } = useI18n()
const uiLocale = computed(() => (locale.value === 'de' ? de : en))
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
