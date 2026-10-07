<script setup lang="ts">
import type { Business } from '~/types/content.types'

defineProps<{
  siteName: string
  year: number
  note?: string
  business?: Business
  /** Always shown: the imprint and privacy pages must be reachable from every page. */
  legalLinks: { imprint: string; privacy: string }
}>()

const { t } = useI18n()
</script>

<template>
  <UFooter>
    <template #left>
      <div class="text-muted flex flex-col gap-1 text-sm">
        <p>{{ t('footer.copyright', { year, name: business?.name ?? siteName }) }}</p>
        <p v-if="note">{{ note }}</p>
      </div>
    </template>

    <nav :aria-label="t('footer.legal')" class="flex gap-4 text-sm">
      <ULink :to="legalLinks.imprint">{{ t('footer.imprint') }}</ULink>
      <ULink :to="legalLinks.privacy">{{ t('footer.privacy') }}</ULink>
    </nav>

    <template v-if="business" #right>
      <div class="text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <ULink :to="`mailto:${business.email}`">{{ business.email }}</ULink>
        <ULink v-if="business.phone" :to="business.phone.href">{{ business.phone.label }}</ULink>
        <ULink
          v-for="social in business.socials"
          :key="social.url"
          :to="social.url"
          target="_blank"
          class="capitalize"
        >
          {{ social.platform }}
        </ULink>
      </div>
    </template>
  </UFooter>
</template>
