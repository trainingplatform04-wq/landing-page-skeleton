<script setup lang="ts">
import { offeredCategories } from '~/constants/consent.constants'
import { COOKIES } from '~/constants/cookies.constants'

const { t } = useI18n()
const { public: config } = useRuntimeConfig()

// The same inventory as the consent window: exactly what this site can set.
const categories = offeredCategories(config.gtmId)
const rows = computed(() =>
  COOKIES.filter(({ category }) => categories.includes(category)).map((cookie) => ({
    name: cookie.name,
    provider: t(`cookies.providers.${cookie.provider}`),
    purpose: t(`cookies.${cookie.id}.purpose`),
    duration: t(`cookies.${cookie.id}.duration`),
    category: t(`consent.categories.${cookie.category}.title`),
  })),
)
</script>

<template>
  <section class="mx-auto mt-12 max-w-3xl" aria-labelledby="cookie-table-title">
    <h2 id="cookie-table-title" class="text-highlighted text-2xl font-bold">
      {{ t('cookies.title') }}
    </h2>
    <div class="border-default mt-6 overflow-x-auto rounded-lg border">
      <table class="w-full min-w-[640px] text-left text-sm">
        <thead class="bg-elevated text-highlighted">
          <tr>
            <th scope="col" class="px-4 py-3 font-semibold">{{ t('cookies.name') }}</th>
            <th scope="col" class="px-4 py-3 font-semibold">{{ t('cookies.provider') }}</th>
            <th scope="col" class="px-4 py-3 font-semibold">{{ t('cookies.purpose') }}</th>
            <th scope="col" class="px-4 py-3 font-semibold">{{ t('cookies.duration') }}</th>
            <th scope="col" class="px-4 py-3 font-semibold">{{ t('cookies.category') }}</th>
          </tr>
        </thead>
        <tbody class="divide-default divide-y">
          <tr v-for="row in rows" :key="row.name">
            <td class="px-4 py-3 font-mono text-xs">{{ row.name }}</td>
            <td class="px-4 py-3">{{ row.provider }}</td>
            <td class="text-muted px-4 py-3">{{ row.purpose }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ row.duration }}</td>
            <td class="px-4 py-3">{{ row.category }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <UButton
      data-consent="settings"
      type="button"
      color="neutral"
      variant="outline"
      icon="i-lucide-cookie"
      :label="t('footer.cookieSettings')"
      class="mt-6"
    />
  </section>
</template>
