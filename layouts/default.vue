<script setup lang="ts">
import { useLayout } from '~/composables/useLayout/useLayout'

const layout = await useLayout()

// The business is the same in every language: registered once.
if (layout.value.localBusiness) useSchemaOrg([defineLocalBusiness(layout.value.localBusiness)])
</script>

<template>
  <div>
    <AppHeader
      :site-name="layout.siteName"
      :home-path="layout.homePath"
      :navigation="layout.navigation"
    />
    <UMain>
      <slot />
    </UMain>
    <AppFooter :site-name="layout.siteName" v-bind="layout.footer" />
  </div>
</template>
