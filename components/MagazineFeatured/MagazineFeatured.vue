<script setup lang="ts">
import type { PostCard } from '~/types/content.types'

const props = defineProps<{ posts: PostCard[] }>()

const lead = computed(() => props.posts[0])
const others = computed(() => props.posts.slice(1))
</script>

<template>
  <section v-if="lead" data-section="magazine-featured" class="pt-10 md:pt-14 xl:pt-16">
    <UContainer class="grid gap-5 xl:grid-cols-[2fr_1fr] xl:gap-6">
      <PostCard :post="lead" variant="large" />
      <div v-if="others.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-1 xl:gap-6">
        <PostCard v-for="post in others" :key="post.id" :post="post" variant="compact" />
      </div>
    </UContainer>
  </section>
</template>
