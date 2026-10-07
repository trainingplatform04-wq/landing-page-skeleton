<script setup lang="ts">
import { PortableText, type PortableTextComponents } from '@portabletext/vue'

import type { RichText } from '~/types/content.types'

defineProps<{ value: RichText }>()

const ULink = resolveComponent('ULink')
const NuxtImg = resolveComponent('NuxtImg')

// Links arrive resolved (`href`); one without an address renders as plain text.
const components: PortableTextComponents = {
  marks: {
    link: ({ value }, { slots }) =>
      value.href
        ? h(
            ULink,
            {
              to: value.href,
              target: value.external && value.href.startsWith('https://') ? '_blank' : undefined,
              class: 'text-primary underline',
            },
            slots.default,
          )
        : slots.default?.(),
  },
  types: {
    accessibleImage: ({ value }) =>
      value.url
        ? h(NuxtImg, {
            src: value.url,
            alt: value.alt ?? '',
            width: 800,
            sizes: 'sm:100vw md:720px',
            class: 'rounded-lg',
          })
        : null,
  },
}
</script>

<template>
  <!-- Spacing, headings and list markers for CMS text, without a typography plugin. -->
  <div
    v-if="value.length"
    class="text-toned [&_h2]:text-highlighted [&_h3]:text-highlighted space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
  >
    <PortableText :value="value" :components="components" :on-missing-component="false" />
  </div>
</template>
