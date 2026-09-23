<template>
  <div class="sign-in sign-in_rest">
    <button
      variant="transparent"
      class="sign-in__reset"
      type="button"
      @click="router.push({ name: 'LoginPage' })"
    >
      <SvgIcon :icon="CloseIcon" class="sign-in__reset-icon" />
    </button>
    <div class="sign-in__title _h3">
      {{ $t('Forgot your password?') }}
    </div>
    <div class="sign-in__subtitle">
      {{ $t('Enter your E-Mail to get a reset link to your account.') }}
    </div>
    <form @submit.prevent="handlePasswordReset" class="sign-in__form">
      <div class="sign-in__inputs">
        <BaseInput
          class="sign-in__input"
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="$t('person@gmail.com ')"
          required
          :error="errorMessage"
        />
      </div>

      <div v-if="serverMessage" class="sign-in__success _text-success">
        {{ serverMessage }}
      </div>

      <div v-if="errorMessage" class="sign-in__error _text-error">
        {{ errorMessage }}
      </div>
      <div class="sign-in__actions">
        <BaseButton
          type="submit"
          :disabled="isLoading"
          class="sign-in__submit sign-in__submit_reset"
        >
          <span v-if="isLoading">{{ $t('Sending') }}...</span>
          <span v-else>{{ $t('Send') }}</span>
        </BaseButton>
        <BaseButton
          v-if="false"
          variant="bordered"
          class="sign-in__switch sign-in__switch_full"
          type="button"
          @click="router.push({ name: 'LoginPage' })"
        >
          {{ $t('back') }}
        </BaseButton>
      </div>
    </form>
    <div v-if="false" class="sign-in__bottom">
      <div class="sign-in__text">
        {{ $t('Remember your password?') }}
      </div>
      <BaseButton
        variant="bordered"
        class="sign-in__switch"
        type="button"
        @click="router.push({ name: 'LoginPage' })"
      >
        {{ $t('back') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { CloseIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

defineEmits(['back-to-sign-in'])

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const isLoading = ref(false)

const errorMessage = ref('')
const serverMessage = ref('')

const handlePasswordReset = async () => {
  errorMessage.value = ''
  serverMessage.value = ''

  if (!email.value) {
    errorMessage.value = t('Email is required')
    return
  }

  isLoading.value = true

  try {
    await userStore.resetPassword(email.value)

    serverMessage.value = t(
      'Password reset link sent. Please check your email.',
    )
    toast.success(serverMessage.value)
  } catch (error) {
    const apiMessage =
      error?.response?.data?.message ||
      error?.message ||
      t('Failed to send reset link')

    errorMessage.value = apiMessage
    toast.error(apiMessage)
  } finally {
    isLoading.value = false
  }
}
</script>
