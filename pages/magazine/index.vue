<script setup lang="ts">
// The category and the page live in the query: a new query is a new page view.
definePageMeta({ key: (route) => route.fullPath })
</script>

<template>
  <LazyMagazineContent hydrate-never />
</template>
