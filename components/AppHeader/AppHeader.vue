<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps<{
  siteName: string
  homePath: string
  navigation: NavigationMenuItem[]
}>()

const { t } = useI18n()
// The switch reads the visitor's scheme, known only in the browser: rendered there, with a
// same-size placeholder on the server (no layout shift, no hydration mismatch).
</script>

<template>
  <UHeader :title="siteName" :to="homePath">
    <UNavigationMenu :items="navigation" :aria-label="t('nav.label')" />

    <template #right>
      <ClientOnly>
        <UColorModeButton />
        <template #fallback>
          <span class="inline-block size-8" aria-hidden="true" />
        </template>
      </ClientOnly>
      <LocaleSwitcher />
    </template>

    <template #body>
      <UNavigationMenu
        :items="navigation"
        orientation="vertical"
        :aria-label="t('nav.label')"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
