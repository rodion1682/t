<template>
  <form class="password-change" @submit.prevent="submit">
    <section class="password-change__section">
      <h2 class="password-change__subtitle">
        {{ $t('Password change') }}
      </h2>

      <div class="password-change__grid">
        <BaseInput
          v-model="form.currentPassword"
          class="password-change__current"
          type="password"
          autocomplete="current-password"
          :label="$t('Current password')"
          :placeholder="$t('Current password')"
          :error="errors.currentPassword"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.newPassword"
          type="password"
          autocomplete="new-password"
          :label="$t('New password')"
          :placeholder="$t('New password')"
          :error="errors.newPassword"
          :disabled="isSubmitting"
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          autocomplete="new-password"
          :label="$t('Confirm new password')"
          :placeholder="$t('Confirm new password')"
          :error="errors.confirmPassword"
          :disabled="isSubmitting"
        />
      </div>
    </section>

    <div v-if="generalError" class="password-change__error _text-error">
      {{ generalError }}
    </div>

    <div class="password-change__actions">
      <BaseButton
        class="password-change__save"
        type="submit"
        variant="primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? $t('Saving') + '...' : $t('Save') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['success'])

const { t } = useI18n()

const toast = useToast()
const userStore = useUserStore()

const generalError = ref('')

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isSubmitting = computed(() => userStore.isUpdating)

const normalize = value => {
  return String(value ?? '')
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  generalError.value = ''
}

const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''

  clearErrors()
}

const validate = () => {
  clearErrors()

  const currentPassword = normalize(form.currentPassword)

  const newPassword = normalize(form.newPassword)

  const confirmPassword = normalize(form.confirmPassword)

  if (!currentPassword) {
    errors.currentPassword = t('Current password is required')
  }

  if (!newPassword) {
    errors.newPassword = t('New password is required')
  } else if (newPassword.length < 5) {
    errors.newPassword = t('Password must contain at least 5 characters')
  }

  if (!confirmPassword) {
    errors.confirmPassword = t('Please confirm new password')
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = t('Passwords do not match')
  }

  return !Object.values(errors).some(Boolean)
}

const applyServerErrors = responseErrors => {
  if (!responseErrors) {
    return
  }

  const errorMap = {
    cur_password: 'currentPassword',
    current_password: 'currentPassword',
    new_password: 'newPassword',
    password: 'newPassword',
    repeat_password: 'confirmPassword',
    password_confirmation: 'confirmPassword',
  }

  Object.entries(responseErrors).forEach(([key, messages]) => {
    const field = errorMap[key]

    if (!field) {
      return
    }

    errors[field] = Array.isArray(messages)
      ? messages[0] || ''
      : String(messages || '')
  })
}

const submit = async () => {
  if (isSubmitting.value || !validate()) {
    return
  }

  userStore.clearError?.()

  try {
    await userStore.updatePassword({
      cur_password: form.currentPassword,

      new_password: form.newPassword,

      repeat_password: form.confirmPassword,
    })

    toast.success(t('Password changed successfully'))

    resetForm()

    emit('success')
  } catch (error) {
    applyServerErrors(error?.response?.data?.errors)

    const hasFieldError = Object.values(errors).some(Boolean)

    if (!hasFieldError) {
      generalError.value =
        error?.response?.data?.message ||
        error?.message ||
        userStore.error ||
        t('Failed to update password')
    }
  }
}

Object.keys(form).forEach(field => {
  watch(
    () => form[field],
    () => {
      if (field in errors) {
        errors[field] = ''
      }

      generalError.value = ''
    },
  )
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.password-change {
  width: 100%;

  &__section {
    width: 100%;
  }

  &__subtitle {
    margin: 0 0 26px;

    @include ibm-14-700;

    color: var(--kelp);

    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    column-gap: 20px;
    row-gap: 18px;
  }

  &__current {
    grid-column: 1 / -1;
  }

  &__error {
    margin-top: 18px;

    text-align: center;
  }

  &__actions {
    display: flex;
    justify-content: center;

    margin-top: 28px;
  }

  &__save {
    width: 180px;
    min-height: 46px;
  }

  :deep(.base-input) {
    min-width: 0;
  }

  :deep(input) {
    min-height: 44px;

    border-radius: 999px;
  }
}

@media (max-width: $md4) {
  .password-change {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__current {
      grid-column: auto;
    }

    &__subtitle {
      margin-bottom: 20px;
    }

    &__actions {
      margin-top: 24px;
    }

    &__save {
      width: 100%;
    }
  }
}
</style>
