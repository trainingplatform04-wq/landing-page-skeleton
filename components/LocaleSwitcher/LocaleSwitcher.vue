<script setup lang="ts">
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const otherLocales = computed(() => locales.value.filter(({ code }) => code !== locale.value))

// Known once the page has set its translated slugs: in the browser, after mounting. The
// server's HTML gets the same state from SwitchLocalePathLink (`data-i18n-disabled`).
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const isMissing = (code: typeof locale.value) => mounted.value && !switchLocalePath(code)
</script>

<template>
  <nav :aria-label="t('localeSwitcher.label')" class="flex items-center gap-1">
    <!--
      SwitchLocalePathLink (from @nuxtjs/i18n) links the same page in the other language,
      correct from the first server render. An offer without a translation is disabled.
    -->
    <SwitchLocalePathLink
      v-for="item in otherLocales"
      :key="item.code"
      :locale="item.code"
      :hreflang="item.language"
      :lang="item.language"
      :aria-label="item.name"
      :aria-disabled="isMissing(item.code) || undefined"
      :tabindex="isMissing(item.code) ? -1 : undefined"
      class="text-default hover:bg-elevated rounded-md px-2.5 py-1.5 text-sm font-medium data-i18n-disabled:pointer-events-none data-i18n-disabled:opacity-50"
    >
      {{ item.code.toUpperCase() }}
    </SwitchLocalePathLink>
  </nav>
</template>
