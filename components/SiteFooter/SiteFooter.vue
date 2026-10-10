<script setup lang="ts">
import { useFooter } from '~/composables/useFooter/useFooter'

// Rendered on the server only (the layout never hydrates it): its data and code stay out of
// every page's first JavaScript.
const view = await useFooter()

// The business is the same in every language: registered once.
if (view.value.localBusiness) useSchemaOrg([defineLocalBusiness(view.value.localBusiness)])
</script>

<template>
  <AppFooter v-bind="view.footer" />
</template>
