<script setup lang="ts">
import { useFooter } from '~/composables/useFooter/useFooter'

const { localBusiness, ...footer } = await useFooter()

// The business is the same in every language: registered once.
if (localBusiness) useSchemaOrg([defineLocalBusiness(localBusiness)])
</script>

<template>
  <AppFooter v-bind="footer" />
</template>
