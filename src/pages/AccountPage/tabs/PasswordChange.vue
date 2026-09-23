<template>
  <div class="password-change">
    <div class="password-change__title _h3">
      {{ $t('Password Change') }}
    </div>

    <div class="password-change__inputs">
      <BaseInput
        v-model="form.currentPassword"
        type="password"
        autocomplete="off"
        :label="$t('Current password')"
        :error="errors.currentPassword"
        :disabled="isSubmitting"
        class="password-change__input"
      />

      <BaseInput
        v-model="form.newPassword"
        type="password"
        autocomplete="new-password"
        :label="$t('Create new password:')"
        :error="errors.newPassword"
        :disabled="isSubmitting"
        class="password-change__input"
      />

      <BaseInput
        v-model="form.confirmPassword"
        type="password"
        autocomplete="new-password"
        :label="$t('Confirm new Password')"
        :error="errors.confirmPassword"
        :disabled="isSubmitting"
        class="password-change__input"
      />
    </div>

    <div v-if="generalError" class="password-change__error _text-error">
      {{ generalError }}
    </div>

    <BaseButton
      type="button"
      variant="primary"
      class="password-change__submit"
      :disabled="isSubmitting"
      @click="submit"
    >
      <span v-if="isSubmitting"> {{ $t('Saving') }}... </span>

      <span v-else>
        {{ $t('Save') }}
      </span>
    </BaseButton>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['success'])

const { t } = useI18n()

const toast = useToast()
const userStore = useUserStore()

const isSubmitting = ref(false)
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

const clearErrors = () => {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
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

  if (!form.currentPassword) {
    errors.currentPassword = t('Current password is required')
  }

  if (!form.newPassword) {
    errors.newPassword = t('New password is required')
  } else if (String(form.newPassword).length < 5) {
    errors.newPassword = t('Password must contain at least 5 characters')
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = t('Please confirm new password')
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = t('Passwords do not match')
  }

  return !(
    errors.currentPassword ||
    errors.newPassword ||
    errors.confirmPassword
  )
}

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validate()) {
    return
  }

  userStore.clearError?.()

  try {
    isSubmitting.value = true

    await userStore.updatePassword({
      cur_password: form.currentPassword,
      new_password: form.newPassword,
      repeat_password: form.confirmPassword,
    })

    toast.success(t('Password changed successfully'))

    resetForm()

    emit('success')
  } catch (error) {
    generalError.value =
      error?.response?.data?.message ||
      error?.message ||
      userStore.error ||
      t('Failed to update password')
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => form.currentPassword,
  () => {
    errors.currentPassword = ''
    generalError.value = ''
  },
)

watch(
  () => form.newPassword,
  () => {
    errors.newPassword = ''
    generalError.value = ''
  },
)

watch(
  () => form.confirmPassword,
  () => {
    errors.confirmPassword = ''
    generalError.value = ''
  },
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.password-change {
  width: 100%;

  &__title {
    color: var(--primary-color);
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }
  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 20);
    }
  }

  &__input {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__error {
    margin-bottom: 8px;
  }

  &__submit {
  }
}
</style>
