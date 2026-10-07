<script setup lang="ts">
import { useContact } from '~/composables/useContact/useContact'
import { useContactForm } from '~/composables/useContactForm/useContactForm'
import { usePageMeta } from '~/composables/usePageMeta/usePageMeta'

const contact = await useContact()
const form = useContactForm(contact.successText)
const { t } = useI18n()
const localePath = useLocalePath()

usePageMeta(contact.seo)
</script>

<template>
  <UContainer>
    <UPageHeader :title="contact.title" :description="contact.intro" />

    <UPageBody>
      <div class="grid gap-12 lg:grid-cols-3">
        <UCard class="lg:col-span-2">
          <!--
            The form only works with JavaScript (it sends in the background), so it renders in
            the browser only. This also keeps Nuxt UI's generated field ids the same as the labels.
          -->
          <ClientOnly v-if="form.isEnabled">
            <ContactForm :send="form.send" :privacy-path="localePath('privacy')" />
            <template #fallback>
              <USkeleton class="h-96 w-full" />
            </template>
          </ClientOnly>
          <UAlert
            v-else-if="contact.business"
            color="neutral"
            variant="subtle"
            icon="i-lucide-mail"
            :title="t('contact.form.unavailable')"
          >
            <template #description>
              <ULink :to="`mailto:${contact.business.email}`">{{ contact.business.email }}</ULink>
            </template>
          </UAlert>
        </UCard>

        <div v-if="contact.business" class="text-toned flex flex-col gap-3">
          <p class="text-highlighted font-semibold">{{ contact.business.name }}</p>
          <p v-for="line in contact.business.addressLines" :key="line">{{ line }}</p>
          <ULink :to="`mailto:${contact.business.email}`" class="flex items-center gap-2">
            <UIcon name="i-lucide-mail" />
            {{ contact.business.email }}
          </ULink>
          <ULink
            v-if="contact.business.phone"
            :to="contact.business.phone.href"
            class="flex items-center gap-2"
          >
            <UIcon name="i-lucide-phone" />
            {{ contact.business.phone.label }}
          </ULink>
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>
