<script setup lang="ts">
import type { PostCard } from '~/types/content.types'

defineProps<{ posts: PostCard[] }>()
</script>

<template>
  <section v-if="posts.length" data-section="magazine-featured" class="pt-10 md:pt-14 xl:pt-16">
    <UContainer class="grid gap-5 xl:grid-cols-[2fr_1fr] xl:gap-6">
      <PostCard :post="posts[0]!" variant="large" />
      <div v-if="posts.length > 1" class="grid gap-5 md:grid-cols-2 xl:grid-cols-1 xl:gap-6">
        <PostCard v-for="post in posts.slice(1)" :key="post.id" :post="post" variant="compact" />
      </div>
    </UContainer>
  </section>
</template>
