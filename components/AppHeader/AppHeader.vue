<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps<{
  siteName: string
  homePath: string
  navigation: NavigationMenuItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <UHeader :title="siteName" :to="homePath">
    <UNavigationMenu :items="navigation" :aria-label="t('nav.label')" />

    <template #right>
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
