<script setup lang="ts">
import { useLayout } from '~/composables/useLayout/useLayout'

const layout = useLayout()
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
    <LazySiteFooter hydrate-never />
  </div>
</template>
