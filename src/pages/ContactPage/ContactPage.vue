<template>
  <AuthLayout>
    <div class="contact">
      <div class="contact__title _h3">
        {{ $t('contact us') }}
      </div>

      <form class="contact__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-if="IS_COMBINED_NAME_AND_SURNAME"
          v-model="formData.fullName"
          name="fullName"
          autocomplete="name"
          :label="$t('Full name')"
          :error="errors.fullName"
          :disabled="isLoading"
          required
          class="contact__input"
        />

        <template v-else>
          <BaseInput
            v-model="formData.name"
            name="name"
            autocomplete="given-name"
            :label="$t('Name')"
            :error="errors.name"
            :disabled="isLoading"
            required
            class="contact__input"
          />

          <BaseInput
            v-model="formData.surname"
            name="surname"
            autocomplete="family-name"
            :label="$t('Surname')"
            :error="errors.surname"
            :disabled="isLoading"
            required
            class="contact__input"
          />
        </template>

        <BaseInput
          v-model="formData.email"
          type="email"
          name="email"
          autocomplete="email"
          :label="$t('Email')"
          :error="errors.email"
          :disabled="isLoading"
          required
          class="contact__input"
        />

        <BaseInput
          v-if="SHOW_PHONE_FIELD"
          v-model="formData.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          :label="$t('Phone')"
          :error="errors.phone"
          :disabled="isLoading"
          required
          class="contact__input"
        />

        <BaseTextarea
          v-model="formData.message"
          name="message"
          :label="$t('Message')"
          :rows="6"
          :maxLength="500"
          :showCounter="true"
          :error="errors.message"
          :disabled="isLoading"
          required
          class="contact__textarea"
        />

        <BaseCheckbox
          v-model="formData.termsAccepted"
          :error="errors.termsAccepted"
          :disabled="isLoading"
          class="contact__checkbox"
          terms
        />

        <div v-if="errors.general" class="contact__error _text-error">
          {{ errors.general }}
        </div>

        <BaseButton
          class="contact__submit"
          type="submit"
          variant="primary"
          :disabled="isLoading"
          :loading="isLoading"
        >
          {{ isLoading ? $t('Sending') : $t('Send') }}
        </BaseButton>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'
import { useToast } from '@/composables/useToast'
import AuthLayout from '@/layouts/AuthLayout.vue'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const IS_COMBINED_NAME_AND_SURNAME = false
const SHOW_PHONE_FIELD = false

const { t } = useI18n()
const toast = useToast()

const authStore = useAuthStore()
const userStore = useUserStore()

const isLoading = ref(false)

const formData = reactive({
  fullName: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  message: '',
  termsAccepted: false,
})

const errors = reactive({
  fullName: '',
  name: '',
  surname: '',
  email: '',
  phone: '',
  message: '',
  termsAccepted: '',
  general: '',
})

const emailRe = /^\S+@\S+\.\S+$/

const norm = value => String(value ?? '').trim()

const splitFullName = fullName => {
  const parts = norm(fullName).split(/\s+/).filter(Boolean)

  return {
    name: parts[0] || '',
    surname: parts.slice(1).join(' ') || '',
  }
}

const getNameData = () => {
  if (IS_COMBINED_NAME_AND_SURNAME) {
    return splitFullName(formData.fullName)
  }

  return {
    name: norm(formData.name),
    surname: norm(formData.surname),
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const prefillFromProfile = async () => {
  if (!authStore.isAuthenticated) return

  if (!userStore.user) {
    await userStore.fetchProfile()
  }

  const user = userStore.user

  if (!user) return

  const name = norm(user.name)
  const surname = norm(user.surname)

  if (IS_COMBINED_NAME_AND_SURNAME) {
    formData.fullName = [name, surname].filter(Boolean).join(' ')
  } else {
    formData.name = name
    formData.surname = surname
  }

  formData.email = user.email || ''

  if (SHOW_PHONE_FIELD) {
    formData.phone = user.phone || ''
  }
}

const validateForm = () => {
  clearErrors()

  if (IS_COMBINED_NAME_AND_SURNAME) {
    const { name, surname } = splitFullName(formData.fullName)

    if (!name || !surname) {
      errors.fullName = t('Please enter your full name')
    }
  } else {
    if (!norm(formData.name)) {
      errors.name = t('Name is required')
    }

    if (!norm(formData.surname)) {
      errors.surname = t('Surname is required')
    }
  }

  if (!norm(formData.email)) {
    errors.email = t('Email is required')
  } else if (!emailRe.test(norm(formData.email))) {
    errors.email = t('Invalid email format')
  }

  if (SHOW_PHONE_FIELD && !norm(formData.phone)) {
    errors.phone = t('Phone is required')
  }

  if (!norm(formData.message)) {
    errors.message = t('Message is required')
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = t('You must accept the terms')
  }

  return !Object.values(errors).some(Boolean)
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true

    const { name, surname } = getNameData()

    const payload = {
      name,
      surname,
      email: norm(formData.email),
      message: norm(formData.message),
    }

    if (SHOW_PHONE_FIELD) {
      payload.phone = norm(formData.phone)
    }

    await api.post('/send-question', payload)

    toast.success(t('Message sent successfully!'))

    clearForm()
  } catch (err) {
    const backendErrors = err?.response?.data?.errors
    const backendMessage = err?.response?.data?.message

    if (backendErrors && Object.keys(backendErrors).length) {
      const errorMap = {
        name: IS_COMBINED_NAME_AND_SURNAME ? 'fullName' : 'name',
        surname: IS_COMBINED_NAME_AND_SURNAME ? 'fullName' : 'surname',
        email: 'email',
        phone: 'phone',
        message: 'message',
      }

      Object.entries(backendErrors).forEach(([field, messages]) => {
        const errorKey = errorMap[field] || field

        if (errorKey in errors) {
          errors[errorKey] = Array.isArray(messages)
            ? messages[0] || ''
            : messages || ''
        }
      })

      errors.general = backendMessage || ''
    } else {
      errors.general =
        backendMessage || err?.message || t('Something went wrong')
    }

    toast.error(errors.general || t('Something went wrong'))
  } finally {
    isLoading.value = false
  }
}

const clearForm = () => {
  formData.message = ''
  formData.termsAccepted = false

  if (!authStore.isAuthenticated) {
    formData.fullName = ''
    formData.name = ''
    formData.surname = ''
    formData.email = ''
    formData.phone = ''
  }

  clearErrors()
}

onMounted(prefillFromProfile)

watch(
  () => authStore.isAuthenticated,
  async isAuthenticated => {
    if (isAuthenticated) {
      await prefillFromProfile()
    }
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.contact {
  position: relative;
  z-index: 1;
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 10);
    }
  }

  &__form {
  }

  &__input,
  &__textarea {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__checkbox {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__error {
    text-align: center;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__submit {
  }
}
</style>
