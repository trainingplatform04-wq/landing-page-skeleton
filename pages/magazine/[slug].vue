<script setup lang="ts">
// One page view per article: moving to another article mounts the page again.
definePageMeta({ key: (route) => route.fullPath })
</script>

<template>
  <div>
    <LazyArticleContent hydrate-never />
    <LazyArticleEnhancer hydrate-on-idle />
  </div>
</template>
