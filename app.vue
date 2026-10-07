<script setup lang="ts">
import { useSiteHead } from '~/composables/useSiteHead/useSiteHead'

useSiteHead()
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
