<script setup lang="ts">
import { de, en } from '@nuxt/ui/locale'

import { useSiteHead } from '~/composables/useSiteHead/useSiteHead'

import type { LocaleCode } from '~/constants/i18n.constants'

/** Nuxt UI's own labels (color switch, pagination, …) per site language. */
const UI_LOCALES = { de, en } satisfies Record<LocaleCode, typeof en>

useSiteHead()

const { locale } = useI18n()
const uiLocale = computed(() => UI_LOCALES[locale.value])
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
