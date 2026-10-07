<script setup lang="ts">
import { z } from 'zod'

import type { FormSubmitEvent } from '@nuxt/ui'
import type { ContactMessage } from '~/composables/useContactForm/useContactForm'

const props = defineProps<{
  /** Sends the message; resolves to `true` when it was sent. */
  send: (message: ContactMessage) => Promise<boolean>
  privacyPath: string
}>()

const { t } = useI18n()

const schema = computed(() =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t('contact.form.required'))
      .max(100, t('contact.form.tooLong', { max: 100 })),
    email: z.string().trim().email(t('contact.form.invalidEmail')),
    message: z
      .string()
      .trim()
      .min(1, t('contact.form.required'))
      .max(2000, t('contact.form.tooLong', { max: 2000 })),
    consent: z.boolean().refine(Boolean, t('contact.form.consentRequired')),
    website: z.string(),
  }),
)

const emptyForm = () => ({ name: '', email: '', message: '', consent: false, website: '' })
const state = reactive(emptyForm())
const sending = ref(false)

async function onSubmit(event: FormSubmitEvent<z.output<typeof schema.value>>) {
  sending.value = true
  const sent = await props.send(event.data)
  sending.value = false
  if (sent) Object.assign(state, emptyForm())
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
    <UFormField :label="t('contact.form.name')" name="name" required>
      <UInput v-model="state.name" autocomplete="name" class="w-full" />
    </UFormField>
    <UFormField :label="t('contact.form.email')" name="email" required>
      <UInput v-model="state.email" type="email" autocomplete="email" class="w-full" />
    </UFormField>
    <UFormField :label="t('contact.form.message')" name="message" required>
      <UTextarea v-model="state.message" :rows="5" class="w-full" />
    </UFormField>

    <!-- Honeypot: invisible to people, filled in by bots. -->
    <UInput
      v-model="state.website"
      class="hidden"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
    />

    <UFormField name="consent">
      <UCheckbox v-model="state.consent">
        <template #label>
          {{ t('contact.form.consent') }}
          <ULink :to="privacyPath" class="underline">{{ t('footer.privacy') }}</ULink>
        </template>
      </UCheckbox>
    </UFormField>

    <UButton
      type="submit"
      :label="t('contact.form.submit')"
      :loading="sending"
      icon="i-lucide-send"
      class="self-start"
    />
  </UForm>
</template>
